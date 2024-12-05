import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false
});

export default sequelize;
