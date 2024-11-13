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
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    // Find user by ID in both Customer and AirlineStaff models
    Customer.findByPk(id)
        .then(user => user ? done(null, user) : AirlineStaff.findByPk(id))  
        .then(user => done(null, user))                                                                                    
        .catch(err => done(err));
});

export default passport;
