import mongoose from 'mongoose';
import { User } from './models/User';
import { Task } from './models/Task';

// Load env if not using bun (but bun loads it partially)
// In bun, process.env is populated from .env automagically usually
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/focusflow';

console.log('----------------------------------------');
console.log('🔍 Database Diagnostic Tool');
console.log('----------------------------------------');
console.log('🔌 Connecting to:', uri);

async function run() {
    try {
        if (uri.startsWith('mongodb+srv://')) {
            console.log('⚠️  SRV connection detected, applying Bun workaround options...');
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                family: 4 // Force IPv4
            });
        } else {
            await mongoose.connect(uri);
        }
        console.log('✅ Connected successfully to MongoDB');

        // List Databases
        const admin = mongoose.connection.db!.admin();
        const dbs = await admin.listDatabases();
        console.log('\n📂 Available Databases:');
        dbs.databases.forEach(db => console.log(`   - ${db.name} (${db.sizeOnDisk} bytes)`));

        // focusflow stats
        const dbName = mongoose.connection.db!.databaseName;
        console.log(`\n📊 Stats for current DB: [${dbName}]`);

        const cols = await mongoose.connection.db!.listCollections().toArray();
        console.log('   Collections:', cols.map(c => c.name).join(', ') || 'None');

        if (cols.length > 0) {
            const userCount = await User.countDocuments();
            console.log(`   - Users: ${userCount}`);

            const taskCount = await Task.countDocuments();
            console.log(`   - Tasks: ${taskCount}`);

            if (userCount > 0) {
                const users = await User.find().limit(5);
                console.log('\n   Latest 5 Users:');
                users.forEach(u => console.log(`     - ID: ${u._id}, Email: ${u.email}, GoogleId: ${u.googleId}`));
            }
        } else {
            console.log('   ⚠️  No collections found! The database exists but is empty.');
        }

        console.log('----------------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

run();
