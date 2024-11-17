import express from 'express';
import Flight from '../models/Flight.mjs'; // Import the Flight model
import Rates from '../models/Rates.mjs'; // Import the Rates model
import Maintenance from '../models/MaintenanceProcedure.mjs'; // Import the Maintenance model
import Ticket from '../models/Ticket.mjs'; // Import the Ticket model
import { Op } from 'sequelize'; // Import Sequelize operators
import ensureAuthenticated from '../middleware/authMiddleware.mjs'; // Ensure this middleware is imported
import sequelize from '../config/db.mjs'; // Import the sequelize instance

const router = express.Router();

// Route to render the manage flights page
router.get('/manage-flights', ensureAuthenticated, (req, res) => {
    res.render('staff/manageFlights'); // Render the manageFlights.ejs view
});

// Route to render the analytics page
router.get('/analytics', ensureAuthenticated, (req, res) => {
    res.render('staff/analytics'); // Render the analytics.ejs view
});

// Route to render the maintenance page
router.get('/maintenance', ensureAuthenticated, (req, res) => {
    res.render('staff/maintenance'); // Render the maintenance.ejs view
});

// Route to render the revenue page
router.get('/revenue', ensureAuthenticated, (req, res) => {
    res.render('staff/revenue'); // Render the revenue.ejs view
});

// Route to create a new flight
router.post('/create-flight', ensureAuthenticated, async (req, res) => {
    const { airline_name } = req.user;
    const { flight_number, departure_datetime, departure_airport, arrival_airport, base_price, status } = req.body;

    console.log('Creating flight with:', {
        airline_name,
        flight_number,
        departure_datetime,
        departure_airport,
        arrival_airport,
        base_price,
        status
    });

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
        console.error('Error creating flight:', error); // Log the error for debugging
        if (error.original && error.original.code === 'ER_DUP_ENTRY') {
            // Handle duplicate entry error
            res.status(409).json({ message: 'Flight already exists' });
        } else {
            res.status(500).json({ message: 'Error creating flight' });
        }
    }
});

// Route to update an existing flight
router.put('/update-flight/:flight_number/:departure_datetime', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { departure_airport, arrival_airport, base_price, status } = req.body;

    // Extract airline_name from the authenticated user's data
    const airline_name = req.user.airline_name;

    // Log the received data for debugging
    console.log('Received data:', {
        airline_name,
        departure_airport,
        arrival_airport,
        base_price,
        status,
        flight_number,
        departure_datetime
    });

    try {
        const result = await sequelize.query(
            `UPDATE Flight
            SET airline_name = ?, departure_airport = ?, arrival_airport = ?, base_price = ?, status = ?
            WHERE flight_number = ? AND departure_datetime = ?`,
            {
                replacements: [airline_name, departure_airport, arrival_airport, base_price, status, flight_number, departure_datetime],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        console.log('Full update result:', result);

        if (result[1] > 0) {
            res.json({ message: 'Flight updated successfully' });
        } else {
            res.status(404).json({ message: 'Flight not found' });
        }
    } catch (error) {
        console.error('Error updating flight:', error);
        res.status(500).json({ message: 'Error updating flight' });
    }
});

// Route to view flight ratings
router.get('/flight-ratings/:flight_number/:departure_datetime', ensureAuthenticated, async (req, res) => {
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
        console.error('Error retrieving flight ratings:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving flight ratings' });
    }
});

// Route to schedule maintenance
router.post('/schedule-maintenance', ensureAuthenticated, async (req, res) => {
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
        console.error('Error scheduling maintenance:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error scheduling maintenance' });
    }
});

// Route to view flights
router.get('/view-flights', ensureAuthenticated, async (req, res) => {
    const { username } = req.user; // Assume username is extracted from session or JWT
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

// Route to view flight customers
router.get('/flight-customers/:flight_number/:departure_datetime', ensureAuthenticated, async (req, res) => {
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
        console.error('Error retrieving flight customers:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving flight customers' });
    }
});

// Route to change flight status
router.put('/change-flight-status/:flight_number/:departure_datetime', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { status } = req.body;
    const { airline_name } = req.user;

    try {
        const result = await sequelize.query(
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

        console.log('Update result:', result); // Log the update result

        // Check if any rows were affected
        if (result[1] > 0) { // Check the second element for affected rows
            res.json({ message: 'Flight status updated successfully' });
        } else {
            res.status(404).json({ message: 'Flight not found' });
        }
    } catch (error) {
        console.error('Error updating flight status:', error);
        res.status(500).json({ message: 'Error updating flight status' });
    }
});

// Route to add an airplane
router.post('/add-airplane', ensureAuthenticated, async (req, res) => {
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
        console.error('Error adding airplane:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error adding airplane' });
    }
});

// Route to view all airplanes owned by the airline
router.get('/view-airplanes', ensureAuthenticated, async (req, res) => {
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
        console.error('Error retrieving airplanes:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving airplanes' });
    }
});

// Route to add an airport
router.post('/add-airport', ensureAuthenticated, async (req, res) => {
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
        console.error('Error adding airport:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error adding airport' });
    }
});

// Route to view frequent customer
router.get('/frequent-customer', ensureAuthenticated, async (req, res) => {
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
        console.error('Error retrieving frequent customer:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving frequent customer' });
    }
});

// Route to view customer flights
router.get('/customer-flights/:email', ensureAuthenticated, async (req, res) => {
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
        console.error('Error retrieving customer flights:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving customer flights' });
    }
});

// Route to view earned revenue
router.get('/earned-revenue', ensureAuthenticated, async (req, res) => {
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
        console.error('Error retrieving earned revenue:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error retrieving earned revenue' });
    }
});

export default router;
