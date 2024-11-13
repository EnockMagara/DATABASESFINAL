import express from 'express';
import Flight from '../models/Flight.mjs'; // Import the Flight model

const router = express.Router();

// Route to search for future flights
router.get('/search-flights', async (req, res) => {
    // Extract search parameters from query
    const { source, destination, departureDate, returnDate } = req.query;

    try {
        // Query database for matching flights
        const flights = await Flight.findAll({
            where: {
                departure_airport: source,
                arrival_airport: destination,
                departure_datetime: {
                    [Op.gte]: new Date(departureDate) // Ensure the flight is in the future
                }
            }
        });

        // If returnDate is provided, filter for round trip flights
        if (returnDate) {
            const returnFlights = await Flight.findAll({
                where: {
                    departure_airport: destination,
                    arrival_airport: source,
                    departure_datetime: {
                        [Op.gte]: new Date(returnDate)
                    }
                }
            });
            return res.json({ flights, returnFlights });
        }

        // Send flight data as response
        res.json(flights);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

// Route to view flight status
router.get('/flight-status', async (req, res) => {
    // Extract flight details from query
    const { airline, flightNumber, date } = req.query;

    try {
        // Query database for flight status
        const flight = await Flight.findOne({
            where: {
                airline_name: airline,
                flight_number: flightNumber,
                departure_datetime: {
                    [Op.eq]: new Date(date)
                }
            }
        });

        // Send status as response
        if (flight) {
            res.json({ status: flight.status });
        } else {
            res.status(404).send('Flight not found');
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

export default router;
