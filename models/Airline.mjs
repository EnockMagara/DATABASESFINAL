import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs'; // Import the sequelize instance

class Airline extends Model {}

Airline.init({
    airline_name: {
        type: DataTypes.STRING(100),
        primaryKey: true, // Primary key for Airline
    }
}, {
    sequelize,
    modelName: 'Airline',
    tableName: 'Airline',
    timestamps: false // Disable timestamps if not needed
});

export default Airline;
