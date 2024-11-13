import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Customer from '../models/Customer.mjs';
import AirlineStaff from '../models/AirlineStaff.mjs';
import argon2 from 'argon2'; // Import argon2 for password hashing

// Configure local strategy for customer
passport.use('customer-local', new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            // Find customer by email
            const customer = await Customer.findOne({ where: { email } });
            // Check if customer exists and password matches
            if (!customer || !(await argon2.verify(customer.password, password))) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            // Successful login
            return done(null, customer);
        } catch (err) {
            return done(err);
        }
    }
));

// Configure local strategy for airline staff
passport.use('staff-local', new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            // Find staff by username
            const staff = await AirlineStaff.findOne({ where: { username } });
            // Check if staff exists and password matches
            if (!staff || !(await argon2.verify(staff.password, password))) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            // Successful login
            return done(null, staff);
        } catch (err) {
            return done(err);
        }
    }
));

// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user.email || user.username);
});

// Deserialize user from session
passport.deserializeUser((identifier, done) => {
    console.log('Deserializing user with identifier:', identifier); // Debugging log

    // First, attempt to find the user as a Customer
    Customer.findOne({ where: { email: identifier } })
        .then(user => {
            if (user) {
                console.log('Customer found:', user); // Debugging log
                return done(null, user); // If found, return the customer
            }
            console.log('Customer not found, checking AirlineStaff'); // Additional log
            // If not found as a Customer, attempt to find as AirlineStaff
            return AirlineStaff.findOne({ where: { username: identifier } })
                .then(staff => {
                    if (staff) {
                        console.log('AirlineStaff found:', staff); // Debugging log
                        return done(null, staff); // If found, return the staff
                    }
                    console.log('AirlineStaff not found, user does not exist'); // Additional log
                    return done(new Error('User not found')); // If neither found, return error
                });
        })
        .catch(err => {
            console.error('Error during deserialization:', err); // Debugging log
            return done(err);
        });
});

export default passport;
