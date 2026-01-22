import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@focusflow.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Generate random verification token
export const generateVerificationToken = (): string => {
  return crypto.randomUUID();
};

// Generate 6-digit OTP securely
export const generateOTP = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Map to 100000-999999 range
  const otp = (array[0] % 900000) + 100000;
  return otp.toString();
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
): Promise<boolean> => {
  if (!resend) {
    console.warn('⚠️ Resend API key not configured. Email not sent.');
    console.log(`📧 Verification link: ${FRONTEND_URL}/verify?token=${verificationToken}`);
    return true; // Return true for development
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your FocusFlow account',
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #171717; margin: 0;">FocusFlow</h1>
          </div>
          
          <h2 style="color: #171717; margin: 0 0 20px;">Welcome, ${name}!</h2>
          
          <p style="color: #525252; font-size: 16px; line-height: 1.6;">
            Thanks for signing up for FocusFlow. Please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/verify?token=${verificationToken}" 
               style="background: #171717; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #737373; font-size: 14px;">
            Or copy and paste this link into your browser:
            <br>
            <a href="${FRONTEND_URL}/verify?token=${verificationToken}" style="color: #171717; word-break: break-all;">
              ${FRONTEND_URL}/verify?token=${verificationToken}
            </a>
          </p>
          
          <p style="color: #a3a3a3; font-size: 12px; margin-top: 40px;">
            This link expires in 24 hours. If you didn't sign up for FocusFlow, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send OTP email
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  if (!resend) {
    console.warn('⚠️ Resend API key not configured. Email not sent.');
    console.log(`🔢 OTP Code: ${otp}`);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your FocusFlow verification code',
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #171717; margin: 0;">FocusFlow</h1>
          </div>
          
          <h2 style="color: #171717; margin: 0 0 20px;">Your verification code</h2>
          
          <p style="color: #525252; font-size: 16px; line-height: 1.6;">
            Use this code to verify your login:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f5f5f5; padding: 20px 40px; border-radius: 12px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #171717;">
                ${otp}
              </span>
            </div>
          </div>
          
          <p style="color: #a3a3a3; font-size: 12px; margin-top: 40px;">
            This code expires in 10 minutes. If you didn't request this code, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};
