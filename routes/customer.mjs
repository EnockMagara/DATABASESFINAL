import express from 'express';
import Ticket from '../models/Ticket.mjs'; // Import the Ticket model
import Flight from '../models/Flight.mjs'; // Import the Flight model
import { Op } from 'sequelize'; // Import Sequelize operators
import Rates from '../models/Rates.mjs'; // Import the Rates model

const router = express.Router();

// Route to purchase a ticket
router.post('/purchase-ticket', async (req, res) => {
    // Extract ticket details from request body
    const { airline_name, flight_number, departure_datetime, email, sold_price, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob } = req.body;

    try {
        // Create a new ticket in the database
        const newTicket = await Ticket.create({
            airline_name,
            flight_number,
            departure_datetime,
            email,
            sold_price,
            purchase_datetime: new Date(), // Set purchase time to current time
            card_number,
            name_on_card,
            card_expiration_date,
            passenger_first_name,
            passenger_last_name,
            passenger_dob
        });

        // Send success response
        res.status(201).json(newTicket);
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error purchasing ticket');
    }
});

// Route to view my flights
router.get('/my-flights', async (req, res) => {
    // Extract customer email from request (assuming it's stored in session or JWT)
    const { email } = req.user;

    try {
        // Query database for flights associated with the customer's email
        const tickets = await Ticket.findAll({
            where: {
                email
            },
            include: [Flight] // Include flight details
        });

        // Send flight data as response
        res.json(tickets);
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error retrieving flights');
    }
});

// Route to give ratings and comments
router.post('/give-feedback', async (req, res) => {
    // Extract feedback details from request body
    const { email, airline_name, flight_number, departure_datetime, rating, comments } = req.body;

    try {
        // Create a new feedback entry in the database
        const feedback = await Rates.create({
            email,
            airline_name,
            flight_number,
            departure_datetime,
            rating,
            comments
        });

        // Send success response
        res.status(201).json(feedback);
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error submitting feedback');
    }
});

export default router;
