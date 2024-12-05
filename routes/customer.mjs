import express from 'express';
import Ticket from '../models/Ticket.mjs';
import Flight from '../models/Flight.mjs';
import { Op } from 'sequelize';
import Rates from '../models/Rates.mjs';
import ensureAuthenticated from '../middleware/authMiddleware.mjs';
import sequelize from '../config/db.mjs';
import Airplane from '../models/Airplane.mjs';

const router = express.Router();

router.get('/ratings', ensureAuthenticated, (req, res) => {
    res.render('customer/ratings', { user: req.user, tickets: [] });
});

router.get('/flights', ensureAuthenticated, (req, res) => {
    res.render('customer/flights');
});

router.get('/purchase', ensureAuthenticated, (req, res) => {
    res.render('customer/purchase');
});

router.get('/spending', ensureAuthenticated, (req, res) => {
    res.render('customer/spending');
});

router.get('/search-flights', ensureAuthenticated, async (req, res) => {
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

router.post('/purchase-ticket', ensureAuthenticated, async (req, res) => {
    const { airline_name, flight_number, departure_datetime, email, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob } = req.body;

    try {
        const departureDate = new Date(departure_datetime + 'Z');

        const flight = await Flight.findOne({
            where: {
                airline_name,
                flight_number,
                departure_datetime: departureDate
            },
            include: [{
                model: Airplane,
                attributes: ['number_of_seats']
            }]
        });

        if (!flight) {
            console.error('Flight does not exist with provided details');
            return res.status(400).json({ message: 'Flight does not exist' });
        }

        const bookedTicketsCount = await Ticket.count({
            where: {
                airline_name,
                flight_number,
                departure_datetime: departureDate
            }
        });

        if (bookedTicketsCount >= flight.Airplane.number_of_seats) {
            console.error('No available seats on this flight');
            return res.status(400).json({ message: 'No available seats on this flight' });
        }

        let ticketPrice = flight.base_price;
        const capacityThreshold = 0.8 * flight.Airplane.number_of_seats;

        if (bookedTicketsCount >= capacityThreshold) {
            ticketPrice *= 1.25;
        }

        const ticket = await Ticket.create({
            airline_name,
            flight_number,
            departure_datetime: departureDate,
            email,
            sold_price: ticketPrice,
            purchase_datetime: new Date(),
            card_number,
            name_on_card,
            card_expiration_date,
            passenger_first_name,
            passenger_last_name,
            passenger_dob
        });

        res.status(201).json({ message: 'Ticket purchased successfully', ticketId: ticket.ticket_id, price: ticketPrice });
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        res.status(500).json({ message: 'Error purchasing ticket' });
    }
});

router.post('/cancel-trip', ensureAuthenticated, async (req, res) => {
    const { ticket_id } = req.body;
    const email = req.user.email;

    try {
        if (!ticket_id || !email) {
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

        res.json({ message: 'Trip cancellation request processed successfully' });

    } catch (error) {
        console.error('Error cancelling trip:', error);
        res.status(500).json({ message: 'Error cancelling trip' });
    }
});

router.post('/give-feedback', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime, rating, comments } = req.body;
    const { email } = req.user;

    try {
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

        const [flight] = await sequelize.query(
            `SELECT airline_name FROM Flight 
            WHERE flight_number = ? 
            AND departure_datetime = ? 
            AND departure_datetime < NOW()`,
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

router.get('/spending/total-year', async (req, res) => {
    const { email } = req.user;

    try {
        const result = await sequelize.query(
            `SELECT 
                SUM(T.sold_price) AS total_spent
            FROM 
                Ticket T
            JOIN 
                Customer C ON T.email = C.email
            WHERE 
                T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
                AND C.email = ?;`,
            {
                replacements: [email],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(result[0] || {});
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving total spending for the past year' });
    }
});

router.get('/spending/monthly-last-6-months', async (req, res) => {
    const { email } = req.user;

    try {
        const currentDate = new Date();
        
        const months = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push(date.toISOString().slice(0, 7));
        }

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
                month DESC`,
            {
                replacements: [email],
                type: sequelize.QueryTypes.SELECT
            }
        );

        const spendingMap = results.reduce((acc, { month, total_spent }) => {
            acc[month] = total_spent;
            return acc;
        }, {});

        const completeResults = months.map(month => ({
            month,
            total_spent: spendingMap[month] || 0
        }));

        res.json(completeResults);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving monthly spending for the last 6 months' });
    }
});

router.get('/spending/total-range', async (req, res) => {
    const { email } = req.user;
    const { startDate, endDate } = req.query;

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

router.get('/tickets/future', ensureAuthenticated, async (req, res) => {
    try {
        const tickets = await sequelize.query(`
            SELECT 
                ticket_id,
                flight_number,
                departure_datetime
            FROM 
                Ticket
            WHERE 
                email = :email
                AND departure_datetime > NOW() + INTERVAL 1 DAY
        `, {
            replacements: { email: req.user.email },
            type: sequelize.QueryTypes.SELECT
        });

        res.json(tickets);
    } catch (error) {
        console.error('Error retrieving tickets:', error);
        res.status(500).json({ message: 'Error retrieving tickets' });
    }
});

export default router;
