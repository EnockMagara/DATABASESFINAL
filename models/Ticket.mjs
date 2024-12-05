import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';
import Flight from './Flight.mjs';
import Customer from './Customer.mjs';
import { v4 as uuidv4 } from 'uuid'; 

class Ticket extends Model {}

Ticket.init({
    ticket_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true // Primary key for Ticket
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
    arrival_datetime: {
        type: DataTypes.DATE,
        references: {
            model: Flight,
            key: 'arrival_datetime'
        }
    },
    email: {
        type: DataTypes.STRING(100),
        references: {
            model: Customer,
            key: 'email'
        }
    },
    sold_price: DataTypes.DECIMAL(10, 2),
    purchase_datetime: DataTypes.DATE,
    card_number: DataTypes.STRING(20),
    name_on_card: DataTypes.STRING(100),
    card_expiration_date: DataTypes.DATE,
    passenger_first_name: DataTypes.STRING(50),
    passenger_last_name: DataTypes.STRING(50),
    passenger_dob: DataTypes.DATE
}, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'Ticket',
    timestamps: false
});

Ticket.belongsTo(Flight, { foreignKey: ['airline_name', 'flight_number', 'departure_datetime'] });
Ticket.belongsTo(Customer, { foreignKey: 'email' });

export default Ticket;
