import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { connectDB } from './config/db';
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';
import { columnRoutes } from './routes/columns';
import { userRoutes } from './routes/users';
import { verifyToken, extractToken } from './utils/jwt';

// Connect to MongoDB
await connectDB();

const app = new Elysia()
    .use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    }))
    .derive(({ headers }) => {
        const authHeader = headers.authorization || null;
        const token = extractToken(authHeader);

        if (!token) {
            return { user: null };
        }

        const payload = verifyToken(token);
        return { user: payload };
    })
    .get('/', () => ({
        message: 'FocusFlow API is running',
        version: '1.0.0'
    }))
    .use(authRoutes)
    .use(taskRoutes)
    .use(columnRoutes)
    .use(userRoutes)
    .listen(3000);

console.log(`🚀 FocusFlow API running at http://localhost:${app.server?.port}`);
