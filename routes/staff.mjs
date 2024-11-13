import express from 'express';
import Flight from '../models/Flight.mjs'; // Import the Flight model
import Rates from '../models/Rates.mjs'; // Import the Rates model
import Maintenance from '../models/Maintenance.mjs'; // Import the Maintenance model
import Ticket from '../models/Ticket.mjs'; // Import the Ticket model
import { Op } from 'sequelize'; // Import Sequelize operators

const router = express.Router();

// Route to create a new flight
router.post('/create-flight', async (req, res) => {
    // Extract flight details from request body
    const { airline_name, flight_number, departure_datetime, departure_airport, arrival_airport, base_price, status } = req.body;

    try {
        // Create a new flight in the database
        const newFlight = await Flight.create({
            airline_name,
            flight_number,
            departure_datetime,
            departure_airport,
            arrival_airport,
            base_price,
            status
        });

        // Send success response
        res.status(201).json(newFlight);
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error creating flight');
    }
});

// Route to update an existing flight
router.put('/update-flight/:flight_number/:departure_datetime', async (req, res) => {
    // Extract flight number and departure datetime from URL parameters
    const { flight_number, departure_datetime } = req.params;
    // Extract updated flight details from request body
    const { airline_name, departure_airport, arrival_airport, base_price, status } = req.body;

    try {
        // Find the flight to update
        const flight = await Flight.findOne({
            where: {
                flight_number,
                departure_datetime
            }
        });

        // If flight not found, send 404 response
        if (!flight) {
            return res.status(404).send('Flight not found');
        }

        // Update flight details
        flight.airline_name = airline_name;
        flight.departure_airport = departure_airport;
        flight.arrival_airport = arrival_airport;
        flight.base_price = base_price;
        flight.status = status;

        // Save updated flight to the database
        await flight.save();

        // Send success response
        res.json(flight);
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error updating flight');
    }
});

// Route to view flight ratings
router.get('/flight-ratings/:flight_number/:departure_datetime', async (req, res) => {
    const { flight_number, departure_datetime } = req.params;

    try {
        // Query database for ratings associated with the flight
        const ratings = await Rates.findAll({
            where: {
                flight_number,
                departure_datetime
            }
        });

        // Send ratings data as response
        res.json(ratings);
    } catch (error) {
        res.status(500).send('Error retrieving flight ratings');
    }
});

// Route to schedule maintenance
router.post('/schedule-maintenance', async (req, res) => {
    const { airplane_id, maintenance_date, description } = req.body;

    try {
        // Create a new maintenance record in the database
        const newMaintenance = await Maintenance.create({
            airplane_id,
            maintenance_date,
            description
        });

        // Send success response
        res.status(201).json(newMaintenance);
    } catch (error) {
        res.status(500).send('Error scheduling maintenance');
    }
});

// Route to view earned revenue and frequent customers
router.get('/analytics', async (req, res) => {
    try {
        // Calculate total revenue
        const totalRevenue = await Ticket.sum('sold_price');

        // Find frequent customers (e.g., customers with more than 5 tickets)
        const frequentCustomers = await Ticket.findAll({
            attributes: ['email', [sequelize.fn('COUNT', sequelize.col('ticket_id')), 'ticket_count']],
            group: ['email'],
            having: sequelize.where(sequelize.fn('COUNT', sequelize.col('ticket_id')), '>', 5)
        });

        // Send analytics data as response
        res.json({ totalRevenue, frequentCustomers });
    } catch (error) {
        res.status(500).send('Error retrieving analytics data');
    }
});

export default router;
