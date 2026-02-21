const { sequelize } = require('./models');

const updateSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const queryInterface = sequelize.getQueryInterface();
        const tableDesc = await queryInterface.describeTable('Products');

        if (!tableDesc.original_price) {
            console.log('Adding original_price column...');
            await sequelize.query('ALTER TABLE Products ADD COLUMN original_price DECIMAL(10, 2);');
        } else {
            console.log('original_price column already exists.');
        }

        if (!tableDesc.tax) {
            console.log('Adding tax column...');
            await sequelize.query("ALTER TABLE Products ADD COLUMN tax VARCHAR(255) DEFAULT 'included';");
        } else {
            console.log('tax column already exists.');
        }

        if (!tableDesc.shipping_cost) {
            console.log('Adding shipping_cost column...');
            await sequelize.query('ALTER TABLE Products ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0;');
        } else {
            console.log('shipping_cost column already exists.');
        }

        console.log('Schema update complete.');

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await sequelize.close();
    }
};

updateSchema();
