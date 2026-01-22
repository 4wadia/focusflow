import { Elysia, t } from 'elysia';
import { Task } from '../models';
import { authMiddleware } from '../middleware/auth';

export const taskRoutes = new Elysia({ prefix: '/api/tasks' })
    .use(authMiddleware)

    // Get all tasks for user (optionally filter by date/column)
    .get('/', async ({ user, query, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const filter: any = { userId: user.userId };

        if (query.date) {
            filter.date = query.date;
        }

        if (query.columnId) {
            filter.columnId = query.columnId;
        }

        const tasks = await Task.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        return { tasks };
    }, { requireAuth: true })

    // Get single task
    .get('/:id', async ({ user, params, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const task = await Task.findOne({
            _id: params.id,
            userId: user.userId
        }).select('-__v');

        if (!task) {
            set.status = 404;
            return { error: 'Task not found' };
        }

        return { task };
    }, { requireAuth: true })

    // Create task
    .post('/', async ({ user, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        // Validate high priority limit (max 5 per day)
        if (body.priority === 'High') {
            const highPriorityCount = await Task.countDocuments({
                userId: user.userId,
                date: body.date,
                priority: 'High'
            });

            if (highPriorityCount >= 5) {
                set.status = 400;
                return { error: 'Maximum 5 high priority tasks per day' };
            }
        }

        const task = await Task.create({
            userId: user.userId,
            columnId: body.columnId,
            title: body.title,
            duration: body.duration,
            dueTime: body.dueTime,
            date: body.date,
            priority: body.priority || 'Medium',
            isCompleted: false,
            subtasks: body.subtasks || [],
            tags: body.tags || []
        });

        return { task };
    }, {
        requireAuth: true,
        body: t.Object({
            columnId: t.String(),
            title: t.String({ minLength: 1 }),
            duration: t.Optional(t.String()),
            dueTime: t.Optional(t.String()),
            date: t.String(),
            priority: t.Optional(t.Union([
                t.Literal('High'),
                t.Literal('Medium'),
                t.Literal('Low'),
                t.Literal('Completed')
            ])),
            subtasks: t.Optional(t.Array(t.Object({
                id: t.String(),
                text: t.String(),
                completed: t.Boolean()
            }))),
            tags: t.Optional(t.Array(t.String()))
        })
    })

    // Update task
    .put('/:id', async ({ user, params, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        // If updating to High priority, validate the limit
        if (body.priority === 'High') {
            // First get the current task to know its date
            const currentTask = await Task.findOne({
                _id: params.id,
                userId: user.userId
            });

            if (!currentTask) {
                set.status = 404;
                return { error: 'Task not found' };
            }

            // Use the new date if provided, otherwise use current task's date
            const targetDate = body.date || currentTask.date;

            // Count high priority tasks for that day, excluding the current task
            const highPriorityCount = await Task.countDocuments({
                userId: user.userId,
                date: targetDate,
                priority: 'High',
                _id: { $ne: params.id }
            });

            if (highPriorityCount >= 5) {
                set.status = 400;
                return { error: 'Maximum 5 high priority tasks per day' };
            }
        }

        const task = await Task.findOneAndUpdate(
            { _id: params.id, userId: user.userId },
            { $set: body },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!task) {
            set.status = 404;
            return { error: 'Task not found' };
        }

        return { task };
    }, {
        requireAuth: true,
        body: t.Partial(t.Object({
            columnId: t.String(),
            title: t.String(),
            duration: t.String(),
            dueTime: t.String(),
            date: t.String(),
            priority: t.Union([
                t.Literal('High'),
                t.Literal('Medium'),
                t.Literal('Low'),
                t.Literal('Completed')
            ]),
            isCompleted: t.Boolean(),
            order: t.Number(),
            subtasks: t.Array(t.Object({
                id: t.String(),
                text: t.String(),
                completed: t.Boolean()
            })),
            tags: t.Array(t.String())
        }))
    })

    // Delete task
    .delete('/:id', async ({ user, params, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const task = await Task.findOneAndDelete({
            _id: params.id,
            userId: user.userId
        });

        if (!task) {
            set.status = 404;
            return { error: 'Task not found' };
        }

        return { message: 'Task deleted' };
    }, { requireAuth: true })

    // Toggle task completion
    .patch('/:id/toggle', async ({ user, params, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const task = await Task.findOne({
            _id: params.id,
            userId: user.userId
        });

        if (!task) {
            set.status = 404;
            return { error: 'Task not found' };
        }

        task.isCompleted = !task.isCompleted;
        task.priority = task.isCompleted ? 'Completed' : 'Medium';
        await task.save();

        return { task };
    }, { requireAuth: true })

    // Move task to different column/position
    .patch('/:id/move', async ({ user, params, body, set }: any) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const task = await Task.findOne({
            _id: params.id,
            userId: user.userId
        });

        if (!task) {
            set.status = 404;
            return { error: 'Task not found' };
        }

        const oldColumnId = task.columnId.toString();
        const oldOrder = task.order;
        const newColumnId = body.columnId;
        const newOrder = body.order;

        if (oldColumnId === newColumnId && oldOrder === newOrder) {
            return { task };
        }

        const operations: any[] = [];

        if (oldColumnId === newColumnId) {
            // Moving within the same column
            if (oldOrder < newOrder) {
                // Moving down
                operations.push({
                    updateMany: {
                        filter: {
                            userId: user.userId,
                            columnId: oldColumnId,
                            order: { $gt: oldOrder, $lte: newOrder },
                            _id: { $ne: params.id }
                        },
                        update: { $inc: { order: -1 } }
                    }
                });
            } else {
                // Moving up
                operations.push({
                    updateMany: {
                        filter: {
                            userId: user.userId,
                            columnId: oldColumnId,
                            order: { $gte: newOrder, $lt: oldOrder },
                            _id: { $ne: params.id }
                        },
                        update: { $inc: { order: 1 } }
                    }
                });
            }
        } else {
            // Moving to a different column
            operations.push({
                updateMany: {
                    filter: {
                        userId: user.userId,
                        columnId: oldColumnId,
                        order: { $gt: oldOrder },
                        _id: { $ne: params.id }
                    },
                    update: { $inc: { order: -1 } }
                }
            });
            operations.push({
                updateMany: {
                    filter: {
                        userId: user.userId,
                        columnId: newColumnId,
                        order: { $gte: newOrder },
                        _id: { $ne: params.id }
                    },
                    update: { $inc: { order: 1 } }
                }
            });
        }

        // Update the task itself
        operations.push({
            updateOne: {
                filter: { _id: params.id, userId: user.userId },
                update: { $set: { columnId: newColumnId, order: newOrder } }
            }
        });

        if (operations.length > 0) {
            await Task.bulkWrite(operations);
        }

        const updatedTask = await Task.findById(params.id).select('-__v');

        return { task: updatedTask };
    }, {
        requireAuth: true,
        body: t.Object({
            columnId: t.String(),
            order: t.Number()
        })
    });
