import { Elysia } from 'elysia';
import { verifyToken, extractToken, JWTPayload } from '../utils/jwt';

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
    .derive(({ headers }) => {
        const authHeader = headers.authorization || null;
        const token = extractToken(authHeader);

        if (!token) {
            return { user: null };
        }

        const payload = verifyToken(token);
        return { user: payload };
    })
    .macro({
        requireAuth(enabled: boolean) {
            if (!enabled) return {};

            return {
                beforeHandle({ user, set }) {
                    if (!user) {
                        set.status = 401;
                        return { error: 'Unauthorized' };
                    }
                }
            };
        }
    });

// Type helper for authenticated routes
export type AuthUser = JWTPayload;
