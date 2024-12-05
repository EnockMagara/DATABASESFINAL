import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Customer from '../models/Customer.mjs';
import AirlineStaff from '../models/AirlineStaff.mjs';
import argon2 from 'argon2';

// Customer authentication strategy
passport.use('customer-local', new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const customer = await Customer.findOne({ where: { email } });
            if (!customer || !(await argon2.verify(customer.password, password))) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            return done(null, customer);
        } catch (err) {
            return done(err);
        }
    }
));

// Staff authentication strategy 
passport.use('staff-local', new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
        try {
            const staff = await AirlineStaff.findOne({ where: { username } });
            if (!staff || !(await argon2.verify(staff.password, password))) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            return done(null, staff);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.email || user.username);
});

passport.deserializeUser((identifier, done) => {
    Customer.findOne({ where: { email: identifier } })
        .then(user => {
            if (user) {
                return done(null, user);
            }
            return AirlineStaff.findOne({ where: { username: identifier } })
                .then(staff => {
                    if (staff) {
                        return done(null, staff);
                    }
                    return done(new Error('User not found'));
                });
        })
        .catch(err => {
            console.error('Error during deserialization:', err);
            return done(err);
        });
});

export default passport;
