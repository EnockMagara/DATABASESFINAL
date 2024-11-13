import express from 'express';
import passport from 'passport';
import argon2 from 'argon2';
import Customer from '../models/Customer.mjs';
import AirlineStaff from '../models/AirlineStaff.mjs';
import Ticket from '../models/Ticket.mjs';
import Flight from '../models/Flight.mjs';

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

// Route to render the customer dashboard
router.get('/customer/dashboard', async (req, res) => {
    try {
        // Fetch tickets for the logged-in customer
        const tickets = await Ticket.findAll({
            where: { email: req.user.email },
            include: [{ model: Flight }] // Include related Flight data
        });

        // Render the customer dashboard view with tickets
        res.render('customer/dashboard', { user: req.user, tickets });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).send('Error loading dashboard');
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
        // Handle errors and send error response
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
    req.logout(); // Destroy user session
    res.redirect('/login'); // Redirect to login page
});

export default router;
