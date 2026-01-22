import { Elysia, t } from 'elysia';
import { Column, Task } from '../models';
import { authMiddleware } from '../middleware/auth';

export const columnRoutes = new Elysia({ prefix: '/api/columns' })
    .use(authMiddleware)

    // Get all columns with their tasks
    .get('/', async ({ user, query, set }) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const columns = await Column.find({ userId: user.userId })
            .sort({ order: 1 })
            .select('-__v');

        // Optionally include tasks for each column
        if (query.includeTasks === 'true') {
            const taskFilter: any = { userId: user.userId };
            if (query.date) {
                taskFilter.date = query.date;
            }

            const tasks = await Task.find(taskFilter)
                .sort({ order: 1, createdAt: -1 })
                .select('-__v');

            // Group tasks by columnId
            const tasksByColumn = tasks.reduce((acc, task) => {
                const colId = task.columnId.toString();
                if (!acc[colId]) acc[colId] = [];
                acc[colId].push(task);
                return acc;
            }, {} as Record<string, typeof tasks>);

            const columnsWithTasks = columns.map(col => ({
                ...col.toObject(),
                tasks: tasksByColumn[col._id.toString()] || []
            }));

            return { columns: columnsWithTasks };
        }

        return { columns };
    }, { requireAuth: true })

    // Get single column
    .get('/:id', async ({ user, params, set }) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const column = await Column.findOne({
            _id: params.id,
            userId: user.userId
        }).select('-__v');

        if (!column) {
            set.status = 404;
            return { error: 'Column not found' };
        }

        return { column };
    }, { requireAuth: true })

    // Create column
    .post('/', async ({ user, body, set }) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        // Get max order for user's columns
        const lastColumn = await Column.findOne({ userId: user.userId })
            .sort({ order: -1 });

        const column = await Column.create({
            userId: user.userId,
            title: body.title,
            order: (lastColumn?.order ?? -1) + 1
        });

        return { column };
    }, {
        requireAuth: true,
        body: t.Object({
            title: t.String({ minLength: 1, maxLength: 50 })
        })
    })

    // Update column
    .put('/:id', async ({ user, params, body, set }) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const column = await Column.findOneAndUpdate(
            { _id: params.id, userId: user.userId },
            { $set: body },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!column) {
            set.status = 404;
            return { error: 'Column not found' };
        }

        return { column };
    }, {
        requireAuth: true,
        body: t.Partial(t.Object({
            title: t.String({ minLength: 1, maxLength: 50 }),
            order: t.Number()
        }))
    })

    // Delete column (and all its tasks)
    .delete('/:id', async ({ user, params, set }) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized' };
        }

        const column = await Column.findOneAndDelete({
            _id: params.id,
            userId: user.userId
        });

        if (!column) {
            set.status = 404;
            return { error: 'Column not found' };
        }

        // Delete all tasks in this column
        await Task.deleteMany({ columnId: params.id });

        return { message: 'Column and its tasks deleted' };
    }, { requireAuth: true });
