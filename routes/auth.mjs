import express from 'express';
import passport from 'passport';
import argon2 from 'argon2';
import Customer from '../models/Customer.mjs';
import AirlineStaff from '../models/AirlineStaff.mjs';

const router = express.Router();

// Route for user registration
router.post('/register', async (req, res) => {
    const { userType, email, username, password, ...otherDetails } = req.body;
    try {
        // Hash the password
        const hashedPassword = await argon2.hash(password);

        if (userType === 'customer') {
            // Save customer to the database
            await Customer.create({ email, password: hashedPassword, ...otherDetails });
        } else if (userType === 'staff') {
            // Save airline staff to the database
            await AirlineStaff.create({ username, password: hashedPassword, ...otherDetails });
        }

        // Send success response
        res.redirect('/login');
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error registering user');
    }
});

// Route for user login
router.post('/login', (req, res, next) => {
    const { userType } = req.body;
    const strategy = userType === 'customer' ? 'customer-local' : 'staff-local';

    passport.authenticate(strategy, {
        successRedirect: '/home', // Redirect to home on success
        failureRedirect: '/login', // Redirect back to login on failure
        failureFlash: true // Enable flash messages
    })(req, res, next);
});

// Route for user logout
router.get('/logout', (req, res) => {
    req.logout(); // Destroy user session
    res.redirect('/login'); // Redirect to login page
});

export default router;
