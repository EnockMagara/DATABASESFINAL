import express from 'express';
import { Op } from 'sequelize'; // Import Sequelize operators
import Flight from '../models/Flight.mjs'; // Import the Flight model
import sequelize from 'sequelize'; // Import Sequelize

const router = express.Router();

// Route to search for future flights
router.get('/search-flights', async (req, res) => {
    // Extract search parameters from query
    const { source, destination, departureDate, returnDate } = req.query;

    try {
        // Query database for one-way flights
        const [flights] = await sequelize.query(
            `SELECT 
                F.airline_name,
                F.flight_number,
                F.departure_datetime,
                A1.name AS departure_airport_name,
                A1.city AS departure_city,
                A2.name AS arrival_airport_name,
                A2.city AS arrival_city,
                F.status,
                F.base_price
            FROM 
                Flight F
            JOIN 
                Airport A1 ON F.departure_airport = A1.airport_code
            JOIN 
                Airport A2 ON F.arrival_airport = A2.airport_code
            WHERE 
                F.departure_datetime >= ?
                AND (A1.city = ? OR A1.name = ?)
                AND (A2.city = ? OR A2.name = ?)`,
            {
                replacements: [new Date(departureDate), source, source, destination, destination],
                type: sequelize.QueryTypes.SELECT
            }
        );

        // If returnDate is provided, query for return flights
        if (returnDate) {
            const [returnFlights] = await sequelize.query(
                `SELECT 
                    F.airline_name,
                    F.flight_number,
                    F.departure_datetime,
                    A1.name AS departure_airport_name,
                    A1.city AS departure_city,
                    A2.name AS arrival_airport_name,
                    A2.city AS arrival_city,
                    F.status,
                    F.base_price
                FROM 
                    Flight F
                JOIN 
                    Airport A1 ON F.departure_airport = A1.airport_code
                JOIN 
                    Airport A2 ON F.arrival_airport = A2.airport_code
                WHERE 
                    F.departure_datetime >= ?
                    AND (A1.city = ? OR A1.name = ?)
                    AND (A2.city = ? OR A2.name = ?)`,
                {
                    replacements: [new Date(returnDate), destination, destination, source, source],
                    type: sequelize.QueryTypes.SELECT
                }
            );
            // Return both flights and returnFlights as JSON
            return res.json({ flights, returnFlights });
        }

        // Send flight data as response, even if empty
        res.json({ flights });
    } catch (error) {
        // Return error message as JSON
        res.status(500).json({ message: 'Error searching for flights' });
    }
});

// Route to view flight status
router.get('/flight-status', async (req, res) => {
    // Extract flight details from query
    const { airline, flightNumber, date } = req.query;

    try {
        // Query database for flight status
        const [flight] = await sequelize.query(
            `SELECT 
                status
            FROM 
                Flight
            WHERE 
                airline_name = ?
                AND flight_number = ?
                AND departure_datetime = ?`,
            {
                replacements: [airline, flightNumber, new Date(date)],
                type: sequelize.QueryTypes.SELECT
            }
        );

        // Send status as response, or an empty object if not found
        if (flight) {
            res.json({ status: flight.status });
        } else {
            res.status(404).json({ message: 'Flight not found' });
        }
    } catch (error) {
        // Return error message as JSON
        res.status(500).json({ message: 'Error retrieving flight status' });
    }
});

export default router;
