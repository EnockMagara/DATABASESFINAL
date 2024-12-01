import express from 'express';
import Ticket from '../models/Ticket.mjs'; // Import the Ticket model
import Flight from '../models/Flight.mjs'; // Import the Flight model
import { Op } from 'sequelize'; // Import Sequelize operators
import Rates from '../models/Rates.mjs'; // Import the Rates model
import ensureAuthenticated from '../middleware/authMiddleware.mjs'; // Import your authentication middleware
import sequelize from '../config/db.mjs'; // Import the sequelize instance

const router = express.Router();

// Route to render the ratings page
router.get('/ratings', ensureAuthenticated, (req, res) => {
    res.render('customer/ratings', { user: req.user, tickets: [] }); // Pass user and tickets data
});

// Route to render the flights search page
router.get('/flights', ensureAuthenticated, (req, res) => {
    res.render('customer/flights');
});

// Route to render the purchase page
router.get('/purchase', ensureAuthenticated, (req, res) => {
    res.render('customer/purchase');
});

// Route to render the spending page
router.get('/spending', ensureAuthenticated, (req, res) => {
    res.render('customer/spending');
});

// Route to search flights
router.get('/search-flights', ensureAuthenticated, async (req, res) => {
    const { departureAirport, arrivalAirport, departureDate, returnDate } = req.query;

    try {
        console.log('Query parameters:', { departureAirport, arrivalAirport, departureDate, returnDate });

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

// Route to purchase a ticket
router.post('/purchase-ticket', async (req, res) => {
    const { airline_name, flight_number, departure_datetime, email, sold_price, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob } = req.body;

    // Log incoming request data
    console.log('Purchase request data:', req.body);

    try {
        // Parse the departure_datetime as UTC
        const departureDate = new Date(departure_datetime + 'Z'); // Append 'Z' to treat it as UTC

        // Log the formatted date
        console.log('Formatted departure date:', departureDate.toISOString());

        // Check if the flight exists
        const flightExists = await Flight.findOne({
            where: {
                airline_name,
                flight_number,
                departure_datetime: departureDate // Use the formatted date
            }
        });

        if (!flightExists) {
            console.log('Flight not found:', { airline_name, flight_number, departure_datetime: departureDate });
            return res.status(400).json({ message: 'Flight does not exist' });
        }

        // Create a new ticket using the Sequelize model
        const ticket = await Ticket.create({
            airline_name,
            flight_number,
            departure_datetime: departureDate, // Use the formatted date
            email,
            sold_price,
            purchase_datetime: new Date(), // Set the current date and time
            card_number,
            name_on_card,
            card_expiration_date,
            passenger_first_name,
            passenger_last_name,
            passenger_dob
        });

        // Log the generated UUID for the ticket
        console.log('Generated ticket_id:', ticket.ticket_id);

        res.status(201).json({ message: 'Ticket purchased successfully', ticketId: ticket.ticket_id });
    } catch (error) {
        // Log the error for debugging
        console.error('Error purchasing ticket:', error);
        res.status(500).json({ message: 'Error purchasing ticket' });
    }
});

// Route to cancel a trip
router.post('/cancel-trip', ensureAuthenticated, async (req, res) => {
    const { ticket_id } = req.body; // Only get ticket_id from the request body
    const email = req.user.email; // Retrieve email from the authenticated user

    // Log the incoming request data
    console.log('Cancel trip request data:', { ticket_id, email });

    try {
        if (!ticket_id || !email) {
            // If request data is missing, return an error
            return res.status(400).json({ message: 'Invalid request data' });
        }

        await sequelize.query(
            `DELETE FROM Ticket 
            WHERE ticket_id = ? 
            AND email = ? 
            AND departure_datetime > NOW() + INTERVAL 1 DAY`,
            {
                replacements: [ticket_id, email],
                type: sequelize.QueryTypes.DELETE
            }
        );

        // Log a success message
        console.log('Trip cancellation request processed successfully');

        // Always return a success message if request data was valid
        res.json({ message: 'Trip cancellation request processed successfully' });

    } catch (error) {
        // Log the error details
        console.error('Error cancelling trip:', error);
        res.status(500).json({ message: 'Error cancelling trip' });
    }
});

// Route to give feedback
router.post('/give-feedback', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime, rating, comments } = req.body;
    const { email } = req.user; // Retrieve email from the authenticated user

    try {
        // Check if the customer has a ticket for the specified flight
        const [ticket] = await sequelize.query(
            `SELECT * FROM Ticket 
            WHERE email = ? 
            AND flight_number = ? 
            AND departure_datetime = ?`,
            {
                replacements: [email, flight_number, departure_datetime],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!ticket) {
            return res.status(403).json({ message: 'You do not have a ticket for this flight' });
        }

        // Optionally, check if the flight has already departed
        const [flight] = await sequelize.query(
            `SELECT airline_name FROM Flight 
            WHERE flight_number = ? 
            AND departure_datetime = ? 
            AND departure_datetime < NOW()`, // Ensure the flight has departed
            {
                replacements: [flight_number, departure_datetime],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found or has not yet departed' });
        }

        const airline_name = flight.airline_name;

        const [result] = await sequelize.query(
            `INSERT INTO Rates (email, airline_name, flight_number, departure_datetime, rating, comments)
            VALUES (?, ?, ?, ?, ?, ?)`,
            {
                replacements: [email, airline_name, flight_number, departure_datetime, rating, comments],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting feedback or incorrect date/time' });
    }
});

// Route to get total spending for the past year
router.get('/spending/total-year', async (req, res) => {
    const { email } = req.user; // Assume email is extracted from session or JWT

    try {
        // SQL query to get total spending for the past year
        const result = await sequelize.query(
            `SELECT 
                SUM(T.sold_price) AS total_spent -- Calculate the total spending
            FROM 
                Ticket T -- From the Ticket table
            JOIN 
                Customer C ON T.email = C.email -- Join with Customer table to ensure valid customer
            WHERE 
                T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR) -- Filter for the past year
                AND C.email = ?; -- Filter by specific customer email`,
            {
                replacements: [email], // Use replacements to prevent SQL injection
                type: sequelize.QueryTypes.SELECT // Specify the query type
            }
        );

        res.json(result[0] || {}); // Send the result as JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving total spending for the past year' }); // Send error response
    }
});

// Route to get monthly spending for the last 6 months
router.get('/spending/monthly-last-6-months', async (req, res) => {
    const { email } = req.user;

    try {
        // Get the current date
        const currentDate = new Date();
        
        // Generate the last 6 months starting from the current month
        const months = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push(date.toISOString().slice(0, 7)); // Format as 'YYYY-MM'
        }

        // Execute the SQL query to get monthly spending
        const results = await sequelize.query(
            `SELECT 
                DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month,
                SUM(T.sold_price) AS total_spent
            FROM 
                Ticket T
            WHERE 
                T.email = ?
                AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY 
                month
            ORDER BY 
                month DESC`, // Order by month in descending order
            {
                replacements: [email],
                type: sequelize.QueryTypes.SELECT
            }
        );

        // Create a map of results for easy lookup
        const spendingMap = results.reduce((acc, { month, total_spent }) => {
            acc[month] = total_spent;
            return acc;
        }, {});

        // Fill in missing months with zero spending
        const completeResults = months.map(month => ({
            month,
            total_spent: spendingMap[month] || 0
        }));

        res.json(completeResults); // Send the complete results
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving monthly spending for the last 6 months' });
    }
});

// Route to get total and monthly spending for a specified date range
router.get('/spending/total-range', async (req, res) => {
    const { email } = req.user;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    try {
        const totalResult = await sequelize.query(
            `SELECT 
                SUM(T.sold_price) AS total_spent
            FROM 
                Ticket T
            WHERE 
                T.email = ?
                AND T.purchase_datetime BETWEEN ? AND ?`,
            {
                replacements: [email, startDate, endDate],
                type: sequelize.QueryTypes.SELECT
            }
        );

        const monthlyResults = await sequelize.query(
            `SELECT 
                DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month,
                SUM(T.sold_price) AS total_spent
            FROM 
                Ticket T
            WHERE 
                T.email = ?
                AND T.purchase_datetime BETWEEN ? AND ?
            GROUP BY 
                month
            ORDER BY 
                month`,
            {
                replacements: [email, startDate, endDate],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({ total: totalResult[0] || {}, monthly: monthlyResults });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving spending for the specified date range' });
    }
});

// Route to get tickets more than 24 hours away
router.get('/tickets/future', ensureAuthenticated, async (req, res) => {
    try {
        const tickets = await sequelize.query(`
            SELECT 
                ticket_id, -- Ticket ID
                flight_number, -- Flight number
                departure_datetime -- Departure date and time
            FROM 
                Ticket
            WHERE 
                email = :email -- Filter by customer's email
                AND departure_datetime > NOW() + INTERVAL 1 DAY -- More than 24 hours away
        `, {
            replacements: { email: req.user.email }, // Use replacements to prevent SQL injection
            type: sequelize.QueryTypes.SELECT // Specify the query type
        });

        res.json(tickets); // Send the tickets as JSON
    } catch (error) {
        console.error('Error retrieving tickets:', error); // Log any errors
        res.status(500).json({ message: 'Error retrieving tickets' }); // Send error response
    }
});

export default router;
