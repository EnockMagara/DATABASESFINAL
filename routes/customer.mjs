import express from 'express';
import Ticket from '../models/Ticket.mjs'; // Import the Ticket model
import Flight from '../models/Flight.mjs'; // Import the Flight model
import { Op } from 'sequelize'; // Import Sequelize operators
import Rates from '../models/Rates.mjs'; // Import the Rates model
import ensureAuthenticated from '../middleware/authMiddleware.mjs'; // Import your authentication middleware

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


router.get('/search-flights', async (req, res) => {
    const { source, destination, departureDate, returnDate } = req.query;

    try {
        // Outbound flights
        const [outboundFlights] = await sequelize.query(
            `SELECT 
                F1.airline_name,
                F1.flight_number,
                F1.departure_datetime,
                A1.name AS departure_airport_name,
                A1.city AS departure_city,
                A2.name AS arrival_airport_name,
                A2.city AS arrival_city,
                F1.status,
                F1.base_price
            FROM 
                Flight F1
            JOIN 
                Airport A1 ON F1.departure_airport = A1.airport_code
            JOIN 
                Airport A2 ON F1.arrival_airport = A2.airport_code
            WHERE 
                F1.departure_datetime > NOW()
                AND (A1.city = ? OR A1.name = ?)
                AND (A2.city = ? OR A2.name = ?)
                AND F1.departure_datetime BETWEEN ? AND ?`,
            {
                replacements: [source, source, destination, destination, departureDate, returnDate],
                type: sequelize.QueryTypes.SELECT
            }
        );

        // Return flights (if returnDate is provided)
        let returnFlights = [];
        if (returnDate) {
            [returnFlights] = await sequelize.query(
                `SELECT 
                    F2.airline_name,
                    F2.flight_number,
                    F2.departure_datetime,
                    A3.name AS departure_airport_name,
                    A3.city AS departure_city,
                    A4.name AS arrival_airport_name,
                    A4.city AS arrival_city,
                    F2.status,
                    F2.base_price
                FROM 
                    Flight F2
                JOIN 
                    Airport A3 ON F2.departure_airport = A3.airport_code
                JOIN 
                    Airport A4 ON F2.arrival_airport = A4.airport_code
                WHERE 
                    F2.departure_datetime > NOW()
                    AND (A3.city = ? OR A3.name = ?)
                    AND (A4.city = ? OR A4.name = ?)
                    AND F2.departure_datetime BETWEEN ? AND ?`,
                {
                    replacements: [destination, destination, source, source, returnDate, returnDate],
                    type: sequelize.QueryTypes.SELECT
                }
            );
        }

        res.json({ outboundFlights, returnFlights });
    } catch (error) {
        res.status(500).send('Error searching for flights');
    }
});

router.post('/purchase-ticket', async (req, res) => {
    const { airline_name, flight_number, departure_datetime, email, sold_price, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob } = req.body;

    try {
        const [result] = await sequelize.query(
            `INSERT INTO Ticket (airline_name, flight_number, departure_datetime, email, sold_price, purchase_datetime, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob)
            VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [airline_name, flight_number, departure_datetime, email, sold_price, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Ticket purchased successfully', ticketId: result });
    } catch (error) {
        res.status(500).send('Error purchasing ticket');
    }
});

router.post('/cancel-trip', async (req, res) => {
    const { ticket_id, email } = req.body;

    try {
        const [result] = await sequelize.query(
            `DELETE FROM Ticket 
            WHERE ticket_id = ? 
            AND email = ? 
            AND departure_datetime > NOW() + INTERVAL 1 DAY`,
            {
                replacements: [ticket_id, email],
                type: sequelize.QueryTypes.DELETE
            }
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Trip cancelled successfully' });
        } else {
            res.status(400).send('Unable to cancel trip. Ensure the trip is more than 24 hours away.');
        }
    } catch (error) {
        res.status(500).send('Error cancelling trip');
    }
});

router.post('/give-feedback', async (req, res) => {
    const { email, airline_name, flight_number, departure_datetime, rating, comments } = req.body;

    try {
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
        res.status(500).send('Error submitting feedback');
    }
});

router.get('/spending/total-year', async (req, res) => {
    const { email } = req.user; // Assume email is extracted from session or JWT

    try {
        const [result] = await sequelize.query(
            `SELECT 
                SUM(T.sold_price) AS total_spent
            FROM 
                Ticket T
            WHERE 
                T.email = ?
                AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`,
            {
                replacements: [email],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(result[0]);
    } catch (error) {
        res.status(500).send('Error retrieving total spending for the past year');
    }
});

router.get('/spending/monthly-last-6-months', async (req, res) => {
    const { email } = req.user;

    try {
        const [results] = await sequelize.query(
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
                month`,
            {
                replacements: [email],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(results);
    } catch (error) {
        res.status(500).send('Error retrieving monthly spending for the last 6 months');
    }
});

router.get('/spending/total-range', async (req, res) => {
    const { email } = req.user;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    try {
        const [totalResult] = await sequelize.query(
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

        const [monthlyResults] = await sequelize.query(
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

        res.json({ total: totalResult[0], monthly: monthlyResults });
    } catch (error) {
        res.status(500).send('Error retrieving spending for the specified date range');
    }
});

export default router;
