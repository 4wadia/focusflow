import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'focusflow-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: string;
    email: string;
}

export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
};

export const extractToken = (authHeader: string | null): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
};
