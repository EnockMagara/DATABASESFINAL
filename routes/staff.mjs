import express from 'express';
import Flight from '../models/Flight.mjs'; // Import the Flight model
import Rates from '../models/Rates.mjs'; // Import the Rates model
import Maintenance from '../models/MaintenanceProcedure.mjs'; // Import the Maintenance model
import Ticket from '../models/Ticket.mjs'; // Import the Ticket model
import { Op } from 'sequelize'; // Import Sequelize operators

const router = express.Router();

// Route to create a new flight
router.post('/create-flight', async (req, res) => {
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT
    const { flight_number, departure_datetime, departure_airport, arrival_airport, base_price, status } = req.body;

    try {
        const [result] = await sequelize.query(
            `INSERT INTO Flight (airline_name, flight_number, departure_datetime, departure_airport, arrival_airport, base_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [airline_name, flight_number, departure_datetime, departure_airport, arrival_airport, base_price, status],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Flight created successfully', flightId: result });
    } catch (error) {
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
        // Execute raw SQL query to update the flight
        const [result] = await sequelize.query(
            `UPDATE Flight
            SET airline_name = ?, departure_airport = ?, arrival_airport = ?, base_price = ?, status = ?
            WHERE flight_number = ? AND departure_datetime = ?`,
            {
                replacements: [airline_name, departure_airport, arrival_airport, base_price, status, flight_number, departure_datetime],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        // Check if any rows were affected
        if (result.affectedRows > 0) {
            res.json({ message: 'Flight updated successfully' });
        } else {
            res.status(404).send('Flight not found');
        }
    } catch (error) {
        // Handle errors and send error response
        res.status(500).send('Error updating flight');
    }
});

// Route to view flight ratings
router.get('/flight-ratings/:flight_number/:departure_datetime', async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT

    try {
        const [ratings] = await sequelize.query(
            `SELECT 
                R.airline_name,
                R.flight_number,
                R.departure_datetime,
                AVG(R.rating) AS average_rating,
                R.comments,
                R.rating
            FROM 
                Rates R
            WHERE 
                R.airline_name = ?
                AND R.flight_number = ?
                AND R.departure_datetime = ?
            GROUP BY 
                R.airline_name, R.flight_number, R.departure_datetime, R.comments, R.rating
            ORDER BY 
                R.departure_datetime`,
            {
                replacements: [airline_name, flight_number, departure_datetime],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(ratings);
    } catch (error) {
        res.status(500).send('Error retrieving flight ratings');
    }
});

// Route to schedule maintenance
router.post('/schedule-maintenance', async (req, res) => {
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT
    const { airplane_id, start_datetime, end_datetime, description } = req.body;

    try {
        const [result] = await sequelize.query(
            `INSERT INTO MaintenanceProcedure (airline_name, airplane_id, start_datetime, end_datetime, description)
            VALUES (?, ?, ?, ?, ?)`,
            {
                replacements: [airline_name, airplane_id, start_datetime, end_datetime, description],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Maintenance scheduled successfully', maintenanceId: result });
    } catch (error) {
        res.status(500).send('Error scheduling maintenance');
    }
});



router.get('/view-flights', async (req, res) => {
    const { username } = req.user; // Assume username is extracted from session or JWT
    const { startDate, endDate, source, destination } = req.query; // Optional query parameters

    try {
        // Default to showing future flights for the next 30 days
        const [flights] = await sequelize.query(
            `SELECT 
                F.airline_name,
                F.flight_number,
                F.departure_datetime,
                F.departure_airport,
                F.arrival_airport,
                F.status,
                F.base_price
            FROM 
                Flight F
            JOIN 
                AirlineStaff AS ON F.airline_name = AS.airline_name
            WHERE 
                AS.username = ?
                AND F.departure_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
                ${startDate && endDate ? 'AND F.departure_datetime BETWEEN ? AND ?' : ''}
                ${source ? 'AND (F.departure_airport = ? OR A1.city = ?)' : ''}
                ${destination ? 'AND (F.arrival_airport = ? OR A2.city = ?)' : ''}`,
            {
                replacements: [
                    username,
                    ...(startDate && endDate ? [startDate, endDate] : []),
                    ...(source ? [source, source] : []),
                    ...(destination ? [destination, destination] : [])
                ],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(flights);
    } catch (error) {
        res.status(500).send('Error retrieving flights');
    }
});

router.get('/flight-customers/:flight_number/:departure_datetime', async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT

    try {
        const [customers] = await sequelize.query(
            `SELECT 
                C.email,
                C.first_name,
                C.last_name,
                T.ticket_id,
                T.sold_price,
                T.purchase_datetime
            FROM 
                Ticket T
            JOIN 
                Customer C ON T.email = C.email
            WHERE 
                T.airline_name = ?
                AND T.flight_number = ?
                AND T.departure_datetime = ?`,
            {
                replacements: [airline_name, flight_number, departure_datetime],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(customers);
    } catch (error) {
        res.status(500).send('Error retrieving flight customers');
    }
});

router.put('/change-flight-status/:flight_number/:departure_datetime', async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { status } = req.body;
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT

    try {
        const [result] = await sequelize.query(
            `UPDATE Flight
            SET status = ?
            WHERE airline_name = ?
            AND flight_number = ?
            AND departure_datetime = ?`,
            {
                replacements: [status, airline_name, flight_number, departure_datetime],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Flight status updated successfully' });
        } else {
            res.status(404).send('Flight not found');
        }
    } catch (error) {
        res.status(500).send('Error updating flight status');
    }
});

router.post('/add-airplane', async (req, res) => {
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT
    const { airplane_id, model, capacity } = req.body;

    try {
        const [result] = await sequelize.query(
            `INSERT INTO Airplane (airline_name, airplane_id, model, capacity)
            VALUES (?, ?, ?, ?)`,
            {
                replacements: [airline_name, airplane_id, model, capacity],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Airplane added successfully', airplaneId: result });
    } catch (error) {
        res.status(500).send('Error adding airplane');
    }
});

// Route to view all airplanes owned by the airline
router.get('/view-airplanes', async (req, res) => {
    const { airline_name } = req.user;

    try {
        const [airplanes] = await sequelize.query(
            `SELECT * FROM Airplane WHERE airline_name = ?`,
            {
                replacements: [airline_name],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(airplanes);
    } catch (error) {
        res.status(500).send('Error retrieving airplanes');
    }
});

router.post('/add-airport', async (req, res) => {
    const { airport_code, name, city, country } = req.body;

    try {
        const [result] = await sequelize.query(
            `INSERT INTO Airport (airport_code, name, city, country)
            VALUES (?, ?, ?, ?)`,
            {
                replacements: [airport_code, name, city, country],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Airport added successfully', airportCode: result });
    } catch (error) {
        res.status(500).send('Error adding airport');
    }
});

router.get('/frequent-customer', async (req, res) => {
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT

    try {
        const [frequentCustomer] = await sequelize.query(
            `SELECT 
                T.email,
                COUNT(T.ticket_id) AS ticket_count
            FROM 
                Ticket T
            JOIN 
                Flight F ON T.airline_name = F.airline_name 
                AND T.flight_number = F.flight_number 
                AND T.departure_datetime = F.departure_datetime
            WHERE 
                F.airline_name = ?
                AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            GROUP BY 
                T.email
            ORDER BY 
                ticket_count DESC
            LIMIT 1`,
            {
                replacements: [airline_name],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(frequentCustomer);
    } catch (error) {
        res.status(500).send('Error retrieving frequent customer');
    }
});

router.get('/customer-flights/:email', async (req, res) => {
    const { email } = req.params;
    const { airline_name } = req.user; // Assume airline_name is extracted from session or JWT

    try {
        const [flights] = await sequelize.query(
            `SELECT 
                F.airline_name,
                F.flight_number,
                F.departure_datetime,
                F.departure_airport,
                F.arrival_airport,
                F.status
            FROM 
                Ticket T
            JOIN 
                Flight F ON T.airline_name = F.airline_name 
                AND T.flight_number = F.flight_number 
                AND T.departure_datetime = F.departure_datetime
            WHERE 
                T.email = ?
                AND F.airline_name = ?
            ORDER BY 
                F.departure_datetime`,
            {
                replacements: [email, airline_name],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(flights);
    } catch (error) {
        res.status(500).send('Error retrieving customer flights');
    }
});

router.get('/earned-revenue', async (req, res) => {
    try {
        const [revenueLastMonth] = await sequelize.query(
            `SELECT 
                SUM(T.sold_price) AS total_revenue_last_month
            FROM 
                Ticket T
            WHERE 
                T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
            {
                type: sequelize.QueryTypes.SELECT
            }
        );

        const [revenueLastYear] = await sequelize.query(
            `SELECT 
                SUM(T.sold_price) AS total_revenue_last_year
            FROM 
                Ticket T
            WHERE 
                T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`,
            {
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({ revenueLastMonth, revenueLastYear });
    } catch (error) {
        res.status(500).send('Error retrieving earned revenue');
    }
});

export default router;
