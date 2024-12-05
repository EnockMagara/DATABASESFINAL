import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';
import Airline from './Airline.mjs';
import StaffEmail from './StaffEmail.mjs';
import StaffPhoneNumber from './StaffPhoneNumber.mjs';

class AirlineStaff extends Model {}

AirlineStaff.init({
    username: {
        type: DataTypes.STRING(50),
        primaryKey: true // Primary key for AirlineStaff
    },
    password: DataTypes.STRING(100),
    first_name: DataTypes.STRING(50),
    last_name: DataTypes.STRING(50),
    date_of_birth: DataTypes.DATE,
    airline_name: {
        type: DataTypes.STRING(100),
        references: {
            model: Airline,
            key: 'airline_name'
        }
    }
}, {
    sequelize,
    modelName: 'AirlineStaff',
    tableName: 'AirlineStaff',
    timestamps: false
});

AirlineStaff.belongsTo(Airline, { foreignKey: 'airline_name' });
AirlineStaff.hasMany(StaffEmail, { foreignKey: 'username' });
AirlineStaff.hasMany(StaffPhoneNumber, { foreignKey: 'username' });

export default AirlineStaff;
