import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';
import Customer from './Customer.mjs';
import Flight from './Flight.mjs';

class Rates extends Model {}

Rates.init({
    email: {
        type: DataTypes.STRING(100),
        references: {
            model: Customer,
            key: 'email'
        }
    },
    airline_name: {
        type: DataTypes.STRING(100),
        references: {
            model: Flight,
            key: 'airline_name'
        }
    },
    flight_number: {
        type: DataTypes.STRING(10),
        references: {
            model: Flight,
            key: 'flight_number'
        }
    },
    departure_datetime: {
        type: DataTypes.DATE,
        references: {
            model: Flight,
            key: 'departure_datetime'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 5
        }
    },
    comments: DataTypes.TEXT
}, {
    sequelize,
    modelName: 'Rates',
    tableName: 'Rates',
    timestamps: false
});

Rates.belongsTo(Customer, { foreignKey: 'email' });
Rates.belongsTo(Flight, { foreignKey: ['airline_name', 'flight_number', 'departure_datetime'] });

export default Rates;
