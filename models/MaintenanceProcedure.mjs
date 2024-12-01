import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';
import Airplane from './Airplane.mjs';

class MaintenanceProcedure extends Model {}

MaintenanceProcedure.init({
    procedure_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    airline_name: {
        type: DataTypes.STRING(100),
        references: {
            model: Airplane,
            key: 'airline_name'
        }
    },
    airplane_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Airplane,
            key: 'airplane_id'
        }
    },
    start_datetime: DataTypes.DATE,
    end_datetime: DataTypes.DATE
}, {
    sequelize,
    modelName: 'MaintenanceProcedure',
    tableName: 'MaintenanceProcedure',
    timestamps: false
});

MaintenanceProcedure.belongsTo(Airplane, { foreignKey: ['airline_name', 'airplane_id'] });

export default MaintenanceProcedure;
