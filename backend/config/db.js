const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:%23Faishal0786@db.tolgbkbxrmbjjeuxkwjg.supabase.co:5432/postgres';

sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false,
});

module.exports = sequelize;
