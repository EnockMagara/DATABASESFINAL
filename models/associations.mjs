import AirlineStaff from './AirlineStaff.mjs';
import StaffEmail from './StaffEmail.mjs';
import StaffPhoneNumber from './StaffPhoneNumber.mjs';


StaffEmail.belongsTo(AirlineStaff, { foreignKey: 'username' });
StaffPhoneNumber.belongsTo(AirlineStaff, { foreignKey: 'username' });


AirlineStaff.hasMany(StaffEmail, { foreignKey: 'username' });
AirlineStaff.hasMany(StaffPhoneNumber, { foreignKey: 'username' }); 