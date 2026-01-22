import { Elysia } from 'elysia';
import { JWTPayload } from '../utils/jwt';

// User extraction is handled globally in server/index.ts
// This middleware only provides the requireAuth macro for enforcing authentication
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
    .macro({
        requireAuth(enabled: boolean) {
            if (!enabled) return {};

            return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                beforeHandle(ctx: any) {
                    if (!ctx.user) {
                        ctx.set.status = 401;
                        return { error: 'Unauthorized' };
                    }
                }
            };
        }
    });

// Type helper for authenticated routes
export type AuthUser = JWTPayload;
