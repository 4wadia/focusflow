import { Elysia, t } from 'elysia';
import mongoose from 'mongoose';
import { User } from '../models';
import { authMiddleware } from '../middleware/auth';

export const userRoutes = new Elysia({ prefix: '/api/users' })
    .use(authMiddleware)

    // Get current user profile
    .get('/profile', async ({ user, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const dbUser = await User.findById(user.userId).select('-__v -googleId');

        if (!dbUser) {
            set.status = 404;
            return { error: 'User not found' };
        }

        return { user: dbUser };
    }, { requireAuth: true })

    // Update user profile
    .put('/profile', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const dbUser = await User.findByIdAndUpdate(
            user.userId,
            { $set: body },
            { new: true, runValidators: true }
        ).select('-__v -googleId');

        if (!dbUser) {
            set.status = 404;
            return { error: 'User not found' };
        }

        return { user: dbUser };
    }, {
        requireAuth: true,
        body: t.Partial(t.Object({
            name: t.String({ minLength: 1, maxLength: 100 }),
            role: t.String({ maxLength: 100 }),
            preferences: t.Partial(t.Object({
                darkMode: t.Boolean(),
                emailNotifications: t.Boolean(),
                pushNotifications: t.Boolean()
            }))
        }))
    })

    // Get user stats
    .get('/stats', async ({ user, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const { Task } = await import('../models');

        const [stats] = await Task.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(user.userId) } },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
                    }
                }
            }
        ]);

        const totalTasks = stats?.totalTasks || 0;
        const completedTasks = stats?.completedTasks || 0;

        return {
            stats: {
                totalTasks,
                completedTasks,
                pendingTasks: totalTasks - completedTasks,
                completionRate: totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0
            }
        };
    }, { requireAuth: true });
