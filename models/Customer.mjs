import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';

class Customer extends Model {}

Customer.init({
    email: {
        type: DataTypes.STRING(100),
        primaryKey: true // Primary key for Customer
    },
    password: DataTypes.STRING(100),
    first_name: DataTypes.STRING(50),
    last_name: DataTypes.STRING(50),
    date_of_birth: DataTypes.DATE,
    building_number: DataTypes.STRING(10),
    street: DataTypes.STRING(100),
    apartment_number: DataTypes.STRING(10),
    city: DataTypes.STRING(100),
    state: DataTypes.STRING(100),
    zip_code: DataTypes.STRING(10),
    passport_number: DataTypes.STRING(20),
    passport_expiration: DataTypes.DATE,
    passport_country: DataTypes.STRING(100)
}, {
    sequelize,
    modelName: 'Customer',
    tableName: 'Customer',
    timestamps: false
});

export default Customer;
