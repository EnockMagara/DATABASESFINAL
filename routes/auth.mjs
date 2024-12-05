import express from 'express';
import passport from 'passport';
import argon2 from 'argon2';
import Customer from '../models/Customer.mjs';
import AirlineStaff from '../models/AirlineStaff.mjs';
import Ticket from '../models/Ticket.mjs';
import Flight from '../models/Flight.mjs';
import sequelize from '../config/db.mjs';
import ensureAuthenticated from '../middleware/authMiddleware.mjs';
import StaffEmail from '../models/StaffEmail.mjs';
import StaffPhoneNumber from '../models/StaffPhoneNumber.mjs';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('public/index');
});

router.get('/register', (req, res) => {
    res.render('public/register');
});

router.get('/goodbye', (req, res) => {
    res.render('public/goodbye');
}); 

router.get('/customer-login', (req, res) => {
    res.render('public/customerLogin');
});

router.get('/staff-login', (req, res) => {
    res.render('public/staffLogin');
});

router.get('/customer/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const flights = await sequelize.query(`
            SELECT 
                T.ticket_id,
                F.airline_name,
                F.flight_number,
                F.departure_datetime,
                F.departure_airport,
                F.arrival_airport,
                T.sold_price
            FROM 
                Ticket T
            JOIN 
                Flight F ON T.airline_name = F.airline_name 
                AND T.flight_number = F.flight_number 
                AND T.departure_datetime = F.departure_datetime
            WHERE 
                T.email = :email
                AND F.departure_datetime > NOW()
        `, {
            replacements: { email: req.user.email },
            type: sequelize.QueryTypes.SELECT
        });

        res.render('customer/navigation', { user: req.user, flights });
    } catch (error) {
        console.error('Error retrieving flights:', error);
        res.status(500).send('Error retrieving flights');
    }
});

router.get('/customer/ratings', ensureAuthenticated, async (req, res) => {
    try {
        const pastFlights = await sequelize.query(`
            SELECT 
                T.ticket_id,
                F.airline_name,
                F.flight_number,
                F.departure_datetime,
                F.departure_airport,
                F.arrival_airport,
                T.sold_price
            FROM 
                Ticket T
            JOIN 
                Flight F ON T.airline_name = F.airline_name 
                AND T.flight_number = F.flight_number 
                AND T.departure_datetime = F.departure_datetime
            WHERE 
                T.email = :email
                AND F.departure_datetime < NOW()
        `, {
            replacements: { email: req.user.email },
            type: sequelize.QueryTypes.SELECT
        });

        res.render('customer/ratings', { user: req.user, pastFlights });
    } catch (error) {
        console.error('Error retrieving past flights:', error);
        res.status(500).send('Error retrieving past flights');
    }
});

router.get('/staff/dashboard', (req, res) => {
    res.render('staff/dashboard', { user: req.user });
});

router.post('/register', async (req, res) => {
    const { userType, email, username, password, staff_emails, staff_phone_numbers, ...otherDetails } = req.body;
    try {
        const hashedPassword = await argon2.hash(password);

        if (userType === 'customer') {
            await Customer.create({
                email,
                password: hashedPassword,
                first_name: otherDetails.first_name,
                last_name: otherDetails.last_name,
                date_of_birth: otherDetails.date_of_birth,
                building_number: otherDetails.building_number,
                street: otherDetails.street,
                apartment_number: otherDetails.apartment_number,
                city: otherDetails.city,
                state: otherDetails.state,
                zip_code: otherDetails.zip_code,
                passport_number: otherDetails.passport_number,
                passport_expiration: otherDetails.passport_expiration,
                passport_country: otherDetails.passport_country
            });
            res.redirect('/customer-login');
        } else if (userType === 'staff') {
            const staff = await AirlineStaff.create({
                username,
                password: hashedPassword,
                first_name: otherDetails.first_name,
                last_name: otherDetails.last_name,
                date_of_birth: otherDetails.date_of_birth,
                airline_name: otherDetails.airline_name
            });

            if (Array.isArray(staff_emails)) {
                for (const email of staff_emails) {
                    await StaffEmail.create({
                        username: staff.username,
                        email
                    });
                }
            }

            if (Array.isArray(staff_phone_numbers)) {
                for (const phone_number of staff_phone_numbers) {
                    await StaffPhoneNumber.create({
                        username: staff.username,
                        phone_number
                    });
                }
            }

            res.redirect('/staff-login');
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

router.post('/login', (req, res, next) => {
    const { userType } = req.body;
    const strategy = userType === 'customer' ? 'customer-local' : 'staff-local';

    passport.authenticate(strategy, (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }
            return res.redirect(userType === 'customer' ? '/customer/dashboard' : '/staff/dashboard');
        });
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/goodbye'); 
    });
});

export default router;
