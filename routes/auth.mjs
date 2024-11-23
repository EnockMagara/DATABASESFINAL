import express from 'express';
import passport from 'passport';
import argon2 from 'argon2';
import Customer from '../models/Customer.mjs';
import AirlineStaff from '../models/AirlineStaff.mjs';
import Ticket from '../models/Ticket.mjs';
import Flight from '../models/Flight.mjs';
import sequelize from '../config/db.mjs';
import ensureAuthenticated from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Route for the root path
router.get('/', (req, res) => {
    // Render the index.ejs file
    res.render('public/index');
});

// Route to render the registration page
router.get('/register', (req, res) => {
    // Render the register.ejs file
    res.render('public/register');
});

// Route to render the customer login page
router.get('/customer-login', (req, res) => {
    res.render('public/customerLogin');
});

// Route to render the staff login page
router.get('/staff-login', (req, res) => {
    res.render('public/staffLogin');
});

// Route to render the customer navigation with booked flights
router.get('/customer/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        // Only include flights with a departure_datetime in the future
        const flights = await sequelize.query(`
            SELECT 
                T.ticket_id, -- Ticket ID
                F.airline_name, -- Airline name
                F.flight_number, -- Flight number
                F.departure_datetime, -- Departure date and time
                F.departure_airport, -- Departure airport
                F.arrival_airport, -- Arrival airport
                T.sold_price -- Sold price of the ticket
            FROM 
                Ticket T
            JOIN 
                Flight F ON T.airline_name = F.airline_name 
                AND T.flight_number = F.flight_number 
                AND T.departure_datetime = F.departure_datetime
            WHERE 
                T.email = :email -- Filter by customer's email
                AND F.departure_datetime > NOW() -- Only future flights
        `, {
            replacements: { email: req.user.email }, // Use replacements to prevent SQL injection
            type: sequelize.QueryTypes.SELECT // Specify the query type
        });

        console.log('Flights data:', flights); // Log the flights data to check its structure

        // Render the customer navigation view with the flights data
        res.render('customer/navigation', { user: req.user, flights });
    } catch (error) {
        console.error('Error retrieving flights:', error); // Log any errors
        res.status(500).send('Error retrieving flights'); // Send error response
    }
});

// Route to render the customer navigation with past flights
router.get('/customer/ratings', ensureAuthenticated, async (req, res) => {
    try {
        // Use raw SQL to fetch tickets and related flight data for the logged-in customer
        // Only include flights with a departure_datetime in the past
        const pastFlights = await sequelize.query(`
            SELECT 
                T.ticket_id, -- Ticket ID
                F.airline_name, -- Airline name
                F.flight_number, -- Flight number
                F.departure_datetime, -- Departure date and time
                F.departure_airport, -- Departure airport
                F.arrival_airport, -- Arrival airport
                T.sold_price -- Sold price of the ticket
            FROM 
                Ticket T
            JOIN 
                Flight F ON T.airline_name = F.airline_name 
                AND T.flight_number = F.flight_number 
                AND T.departure_datetime = F.departure_datetime
            WHERE 
                T.email = :email -- Filter by customer's email
                AND F.departure_datetime < NOW() -- Only past flights
        `, {
            replacements: { email: req.user.email }, // Use replacements to prevent SQL injection
            type: sequelize.QueryTypes.SELECT // Specify the query type
        });

        console.log('Past Flights data:', pastFlights); // Log the past flights data to check its structure

        // Render a view with the past flights data
        res.render('customer/ratings', { user: req.user, pastFlights });
    } catch (error) {
        console.error('Error retrieving past flights:', error); // Log any errors
        res.status(500).send('Error retrieving past flights'); // Send error response
    }
});

// Route to render the staff dashboard
router.get('/staff/dashboard', (req, res) => {
    // Render the staff dashboard view
    res.render('staff/dashboard', { user: req.user });
});

// Route for user registration
router.post('/register', async (req, res) => {
    const { userType, email, username, password, ...otherDetails } = req.body;
    try {
        // Hash the password
        const hashedPassword = await argon2.hash(password);

        if (userType === 'customer') {
            // Save customer to the database with all details
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
            // Redirect to customer login page
            res.redirect('/customer-login');
        } else if (userType === 'staff') {
            // Save airline staff to the database with all details
            await AirlineStaff.create({
                username,
                password: hashedPassword,
                first_name: otherDetails.first_name,
                last_name: otherDetails.last_name,
                date_of_birth: otherDetails.date_of_birth,
                airline_name: otherDetails.airline_name
            });
            // Redirect to staff login page
            res.redirect('/staff-login');
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// Route for user login
router.post('/login', (req, res, next) => {
    console.log('Request body:', req.body); // Log the entire request body
    const { userType } = req.body;
    console.log('Login attempt:', { userType });

    const strategy = userType === 'customer' ? 'customer-local' : 'staff-local';
    console.log('Using strategy:', strategy); // Log the authentication strategy being used

    passport.authenticate(strategy, (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (!user) {
            console.log('Authentication failed:', info);
            return res.status(401).json({ success: false, message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }
            console.log('Login successful:', user);
            // Redirect based on user type
            if (userType === 'customer') {
                console.log('Redirecting to /customer/dashboard');
                return res.redirect('/customer/dashboard');
            } else {
                console.log('Redirecting to /staff/dashboard');
                return res.redirect('/staff/dashboard');
            }
        });
    })(req, res, next);
});

// Route for user logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        // Redirect to goodbye page or login page
        res.redirect('/goodbye'); 
    });
});

export default router;
