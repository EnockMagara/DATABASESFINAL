import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.mjs';

class StaffPhoneNumber extends Model {}

StaffPhoneNumber.init({
    phone_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true 
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false 
    }
}, {
    sequelize,
    modelName: 'StaffPhoneNumber',
    tableName: 'StaffPhoneNumber',
    timestamps: false
});

export default StaffPhoneNumber;
