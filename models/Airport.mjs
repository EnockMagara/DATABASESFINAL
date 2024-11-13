import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';

class Airport extends Model {}

Airport.init({
    airport_code: {
        type: DataTypes.CHAR(3),
        primaryKey: true // Primary key for Airport
    },
    name: DataTypes.STRING(100),
    city: DataTypes.STRING(100),
    country: DataTypes.STRING(100),
    number_of_terminals: DataTypes.INTEGER,
    airport_type: DataTypes.ENUM('domestic', 'international', 'both')
}, {
    sequelize,
    modelName: 'Airport',
    tableName: 'Airport',
    timestamps: false
});

export default Airport;
