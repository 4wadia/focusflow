import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
    } else {
        console.warn('⚠️  WARNING: JWT_SECRET not set. Using insecure default for development only.');
    }
}

const SECRET_KEY = JWT_SECRET || 'focusflow-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: string;
    email: string;
}

export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, SECRET_KEY) as JWTPayload;
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
