import express from 'express';
import sequelize from '../config/db.mjs';

const router = express.Router();

// Route to view flights
router.get('/search-flights', async (req, res) => {
    const { departureAirport, arrivalAirport, departureDate, returnDate } = req.query; // Query parameters

    try {
        // Log the query parameters for debugging
        console.log('Query parameters:', { departureAirport, arrivalAirport, departureDate, returnDate });

        // Construct the SQL query with the provided conditions
        const query = `
            SELECT 
                airline_name AS "Airline",
                flight_number AS "Flight Number",
                departure_datetime AS "Departure Date & Time",
                departure_airport AS "Departure Airport",
                arrival_airport AS "Arrival Airport",
                base_price AS "Base Price",
                status AS "Status"
            FROM 
                Flight
            WHERE 
                (
                    departure_airport = ? 
                    AND arrival_airport = ?
                    AND DATE(departure_datetime) = ?
                )
                ${returnDate ? `
                OR 
                (
                    departure_airport = ? 
                    AND arrival_airport = ?
                    AND DATE(departure_datetime) = ?
                )` : ''}
            ORDER BY 
                departure_datetime`;

        // Prepare replacements array
        const replacements = [
            departureAirport, arrivalAirport, departureDate,
            ...(returnDate ? [arrivalAirport, departureAirport, returnDate] : [])
        ];

        // Execute the query with replacements
        const [flights] = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        // Ensure the result is always an array
        const resultArray = Array.isArray(flights) ? flights : [flights];

        // Check if flights is undefined or empty
        if (!resultArray || resultArray.length === 0) {
            console.log('No flights found');
            return res.json([]); // Return an empty array if no flights are found
        }

        console.log('Flights retrieved:', resultArray); // Log the flights retrieved
        res.json(resultArray); // Ensure a JSON response is always sent
    } catch (error) {
        console.error('Error retrieving flights:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving flights' }); // Send a JSON error response
    }
});

// Route to view flight status
router.get('/flight-status', async (req, res) => {
    // Extract flight details from query
    const { airline, flightNumber, date } = req.query; // Get query parameters

    try {
        // Query database for flight status
        const [flight] = await sequelize.query(
            `SELECT 
                airline_name AS "Airline",
                flight_number AS "Flight Number",
                departure_datetime AS "Departure Date & Time",
                arrival_airport AS "Arrival Airport",
                departure_airport AS "Departure Airport",
                status AS "Flight Status"
            FROM 
                Flight
            WHERE 
                airline_name = ? -- Match airline name
                AND flight_number = ? -- Match flight number
                AND DATE(departure_datetime) = ?`, // Match departure date
            {
                replacements: [airline, flightNumber, date], // Use query parameters
                type: sequelize.QueryTypes.SELECT
            }
        );

        // Send status as response, or an empty object if not found
        if (flight) {
            res.json({ status: flight['Flight Status'] }); // Return flight status
        } else {
            res.status(404).json({ message: 'Flight not found' }); // Flight not found response
        }
    } catch (error) {
        // Return error message as JSON
        res.status(500).json({ message: 'Error retrieving flight status' }); // Error response
    }
});

export default router;
