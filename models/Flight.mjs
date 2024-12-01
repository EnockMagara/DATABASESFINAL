import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';
import Airline from './Airline.mjs';
import Airport from './Airport.mjs';
import Airplane from './Airplane.mjs';

class Flight extends Model {}

Flight.init({
    airline_name: {
        type: DataTypes.STRING(100),
        references: {
            model: Airline,
            key: 'airline_name'
        }
    },
    flight_number: {
        type: DataTypes.STRING(10),
        primaryKey: true // Part of composite primary key
    },
    departure_datetime: {
        type: DataTypes.DATE,
        primaryKey: true // Part of composite primary key
    },
    departure_airport: {
        type: DataTypes.CHAR(3),
        references: {
            model: Airport,
            key: 'airport_code'
        }
    },
    arrival_airport: {
        type: DataTypes.CHAR(3),
        references: {
            model: Airport,
            key: 'airport_code'
        }
    },
    base_price: DataTypes.DECIMAL(10, 2),
    status: DataTypes.ENUM('on-time', 'delayed', 'canceled'),
    airplane_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Airplane,
            key: 'airplane_id'
        }
    }
}, {
    sequelize,
    modelName: 'Flight',
    tableName: 'Flight',
    timestamps: false
});

Flight.belongsTo(Airline, { foreignKey: 'airline_name' });
Flight.belongsTo(Airport, { as: 'DepartureAirport', foreignKey: 'departure_airport' });
Flight.belongsTo(Airport, { as: 'ArrivalAirport', foreignKey: 'arrival_airport' });
Flight.belongsTo(Airplane, { foreignKey: 'airplane_id' });

export default Flight;
