const { sequelize } = require('./models');

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // SQLite specific query
        await sequelize.query('ALTER TABLE Orders ADD COLUMN referral_code TEXT;');

        console.log('Column referral_code added successfully.');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addColumn();
