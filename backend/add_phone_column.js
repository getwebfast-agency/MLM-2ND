const { sequelize } = require('./models');

async function updateDb() {
    try {
        await sequelize.authenticate();
        console.log('Connected');

        // Add phone column
        await sequelize.query('ALTER TABLE "Users" ADD COLUMN "phone" VARCHAR(255) UNIQUE;');
        console.log('Phone column added');

        // Make email nullable
        await sequelize.query('ALTER TABLE "Users" ALTER COLUMN "email" DROP NOT NULL;');
        console.log('Email set to nullable');

        console.log('Migration completed');
        process.exit(0);
    } catch (e) {
        // Might fail if already run, that's fine
        console.log(e.message);
        process.exit(1);
    }
}

updateDb();
