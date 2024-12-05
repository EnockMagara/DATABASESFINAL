import express from 'express';
import sequelize from '../config/db.mjs';

const router = express.Router();

router.get('/search-flights', async (req, res) => {
    const { departureAirport, arrivalAirport, departureDate, returnDate } = req.query;

    try {
        console.log('Query parameters:', { departureAirport, arrivalAirport, departureDate, returnDate });

        const query = `
            SELECT 
                airline_name AS "Airline",
                flight_number AS "Flight Number",
                departure_datetime AS "Departure Date & Time",
                arrival_datetime AS "Arrival Date & Time",
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

        const replacements = [
            departureAirport, arrivalAirport, departureDate,
            ...(returnDate ? [arrivalAirport, departureAirport, returnDate] : [])
        ];

        const [flights] = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        const resultArray = Array.isArray(flights) ? flights : [flights];

        if (!resultArray || resultArray.length === 0) {
            console.log('No flights found');
            return res.json([]);
        }

        console.log('Flights retrieved:', resultArray);
        res.json(resultArray);
    } catch (error) {
        console.error('Error retrieving flights:', error);
        res.status(500).json({ message: 'Error retrieving flights' });
    }
});

router.get('/flight-status', async (req, res) => {
    const { airline, flightNumber, date } = req.query;

    console.log('Flight status query parameters:', { airline, flightNumber, date });

    try {
        const [flight] = await sequelize.query(
            `SELECT 
                airline_name AS "Airline",
                flight_number AS "Flight Number",
                departure_datetime AS "Departure Date & Time",
                arrival_datetime AS "Arrival Date & Time",
                arrival_airport AS "Arrival Airport",
                departure_airport AS "Departure Airport",
                status AS "Flight Status"
            FROM 
                Flight
            WHERE 
                airline_name = ?
                AND flight_number = ?
                AND DATE(departure_datetime) = ?`,
            {
                replacements: [airline, flightNumber, date],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (flight) {
            res.json({ status: flight['Flight Status'] });
        } else {
            res.status(404).json({ message: 'Flight not found' });
        }
    } catch (error) {
        console.error('Error retrieving flight status:', error);
        res.status(500).json({ message: 'Error retrieving flight status' });
    }
});

export default router;
