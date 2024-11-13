import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';
import Airline from './Airline.mjs'; // Import related model

class Airplane extends Model {}

Airplane.init({
    airline_name: {
        type: DataTypes.STRING(100),
        references: {
            model: Airline, // Reference to Airline model
            key: 'airline_name'
        }
    },
    airplane_id: {
        type: DataTypes.INTEGER,
        primaryKey: true // Part of composite primary key
    },
    number_of_seats: DataTypes.INTEGER,
    manufacturing_company: DataTypes.STRING(100),
    model_number: DataTypes.STRING(50),
    manufacturing_date: DataTypes.DATE
}, {
    sequelize,
    modelName: 'Airplane',
    tableName: 'Airplane',
    timestamps: false
});

Airplane.belongsTo(Airline, { foreignKey: 'airline_name' });

export default Airplane;
