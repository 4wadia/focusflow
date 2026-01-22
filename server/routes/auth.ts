import { Elysia, t } from 'elysia';
import { User } from '../models';
import { Column } from '../models';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { generateOTP, generateVerificationToken, sendVerificationEmail, sendOTPEmail } from '../utils/email';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Default columns for new users
const DEFAULT_COLUMNS = ['All Tasks', 'Work', 'Personal'];

// Password hashing using Bun.password (bcrypt by default)
const hashPassword = async (password: string): Promise<string> => {
    return await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10  // Work factor (higher = more secure but slower)
    });
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await Bun.password.verify(password, hash);
};

export const authRoutes = new Elysia({ prefix: '/auth' })
    .use(authMiddleware)

    // ============ EMAIL/PASSWORD AUTH ============

    // Signup with email/password
    .post('/signup', async ({ body, set }) => {
        const { name, email, password } = body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            set.status = 400;
            return { error: 'Email already registered' };
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isEmailVerified: false,
            verificationToken,
            verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        // Create default columns
        await Column.insertMany(
            DEFAULT_COLUMNS.map((title, index) => ({
                userId: user._id,
                title,
                order: index
            }))
        );

        // Send verification email
        await sendVerificationEmail(email, name, verificationToken);

        return {
            message: 'Account created! Please check your email to verify your account.',
            requiresVerification: true
        };
    }, {
        body: t.Object({
            name: t.String({ minLength: 1 }),
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 })
        })
    })

    // Login with email/password (sends OTP)
    .post('/login', async ({ body, set }) => {
        const { email, password } = body;

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            set.status = 401;
            return { error: 'Invalid email or password' };
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            set.status = 401;
            return { error: 'Invalid email or password' };
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            set.status = 403;
            return { error: 'Please verify your email first', requiresVerification: true };
        }

        // Generate and send OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        await sendOTPEmail(email, otp);

        return {
            message: 'Verification code sent to your email',
            requiresOTP: true
        };
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        })
    })

    // Verify OTP and complete login
    .post('/verify-otp', async ({ body, set }) => {
        const { email, otp } = body;

        const user = await User.findOne({ email });
        if (!user) {
            set.status = 404;
            return { error: 'User not found' };
        }

        if (!user.otp || !user.otpExpires) {
            set.status = 400;
            return { error: 'No OTP requested' };
        }

        if (new Date() > user.otpExpires) {
            set.status = 400;
            return { error: 'OTP expired' };
        }

        if (user.otp !== otp) {
            set.status = 400;
            return { error: 'Invalid OTP' };
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate JWT
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email
        });

        return { token, user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl } };
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            otp: t.String({ minLength: 6, maxLength: 6 })
        })
    })

    // Verify email with token
    .get('/verify-email/:token', async ({ params, redirect }) => {
        const user = await User.findOne({
            verificationToken: params.token,
            verificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return redirect(`${FRONTEND_URL}?error=invalid_token`);
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        // Generate token and redirect
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email
        });

        return redirect(`${FRONTEND_URL}?token=${token}&verified=true`);
    })

    // Resend verification email
    .post('/resend-verification', async ({ body, set }) => {
        const { email } = body;

        const user = await User.findOne({ email });
        if (!user) {
            set.status = 404;
            return { error: 'User not found' };
        }

        if (user.isEmailVerified) {
            return { message: 'Email already verified' };
        }

        const verificationToken = generateVerificationToken();
        user.verificationToken = verificationToken;
        user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(email, user.name, verificationToken);

        return { message: 'Verification email sent' };
    }, {
        body: t.Object({
            email: t.String({ format: 'email' })
        })
    })

    // ============ GOOGLE OAUTH ============

    // Google OAuth redirect
    .get('/google', ({ redirect }) => {
        if (!GOOGLE_CLIENT_ID) {
            return redirect(`${FRONTEND_URL}?error=google_not_configured`);
        }

        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: `${BACKEND_URL}/auth/google/callback`,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent'
        });

        return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
    })

    // Google OAuth callback
    .get('/google/callback', async ({ query, redirect }) => {
        const { code, error } = query;

        if (error || !code) {
            return redirect(`${FRONTEND_URL}?error=auth_failed`);
        }

        try {
            // Exchange code for tokens
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: code as string,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    redirect_uri: `${BACKEND_URL}/auth/google/callback`,
                    grant_type: 'authorization_code'
                })
            });

            const tokens = await tokenResponse.json();

            if (!tokens.access_token) {
                return redirect(`${FRONTEND_URL}?error=token_failed`);
            }

            // Get user info from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            });

            const googleUser = await userInfoResponse.json();

            // Find or create user
            let user = await User.findOne({ googleId: googleUser.sub });

            if (!user) {
                // Check if email exists (user might have signed up with email first)
                user = await User.findOne({ email: googleUser.email });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = googleUser.sub;
                    user.isEmailVerified = true; // Google verifies emails
                    user.avatarUrl = googleUser.picture;
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        googleId: googleUser.sub,
                        email: googleUser.email,
                        name: googleUser.name,
                        avatarUrl: googleUser.picture,
                        isEmailVerified: true // Google verifies emails
                    });

                    // Create default columns for new user
                    await Column.insertMany(
                        DEFAULT_COLUMNS.map((title, index) => ({
                            userId: user!._id,
                            title,
                            order: index
                        }))
                    );
                }
            } else {
                // Update existing user info
                user.name = googleUser.name;
                user.avatarUrl = googleUser.picture;
                await user.save();
            }

            // Generate JWT
            const token = generateToken({
                userId: user._id.toString(),
                email: user.email
            });



            // Redirect to frontend with token
            return redirect(`${FRONTEND_URL}?token=${token}`);

        } catch (err) {
            console.error('Google auth error:', err);
            return redirect(`${FRONTEND_URL}?error=server_error`);
        }
    })

    // ============ COMMON ============

    // Get current user
    .get('/me', async (ctx) => {
        const user = (ctx as any).user as { userId: string; email: string } | null;
        if (!user) {
            ctx.set.status = 401;
            return { error: 'Not authenticated' };
        }

        const dbUser = await User.findById(user.userId).select('-__v -password -otp -verificationToken');

        if (!dbUser) {
            ctx.set.status = 404;
            return { error: 'User not found' };
        }

        return { user: dbUser };
    })

    // Logout
    .post('/logout', () => {
        return { message: 'Logged out successfully' };
    });

