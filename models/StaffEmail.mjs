import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';

class StaffEmail extends Model {}

StaffEmail.init({
    email_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true 
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false 
    }
}, {
    sequelize,
    modelName: 'StaffEmail',
    tableName: 'StaffEmail',
    timestamps: false
});

export default StaffEmail;
