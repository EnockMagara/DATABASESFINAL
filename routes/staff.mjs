import express from 'express';
import Flight from '../models/Flight.mjs';
import Rates from '../models/Rates.mjs';
import Maintenance from '../models/MaintenanceProcedure.mjs';
import Ticket from '../models/Ticket.mjs';
import { Op } from 'sequelize';
import ensureAuthenticated from '../middleware/authMiddleware.mjs';
import sequelize from '../config/db.mjs';

const router = express.Router();

router.get('/manage-flights', ensureAuthenticated, (req, res) => {
    res.render('staff/manageFlights');
});

router.get('/analytics', ensureAuthenticated, (req, res) => {
    res.render('staff/analytics');
});

router.get('/maintenance', ensureAuthenticated, (req, res) => {
    res.render('staff/maintenance');
});

router.get('/revenue', ensureAuthenticated, (req, res) => {
    res.render('staff/revenue');
});

router.post('/create-flight', ensureAuthenticated, async (req, res) => {
    const { airline_name } = req.user;
    const { flight_number, departure_datetime, arrival_datetime, departure_airport, arrival_airport, base_price, status, airplane_id } = req.body;

    try {
        const [maintenance] = await sequelize.query(
            `SELECT * FROM MaintenanceProcedure 
            WHERE airplane_id = ? 
            AND airline_name = ? 
            AND start_datetime <= ? 
            AND end_datetime >= ?`,
            {
                replacements: [airplane_id, airline_name, departure_datetime, departure_datetime],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (Array.isArray(maintenance) && maintenance.length > 0) {
            return res.status(409).json({ message: 'Airplane is under maintenance during this time' });
        }

        const [result] = await sequelize.query(
            `INSERT INTO Flight (airline_name, flight_number, departure_datetime, arrival_datetime, departure_airport, arrival_airport, base_price, status, airplane_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [airline_name, flight_number, departure_datetime, arrival_datetime, departure_airport, arrival_airport, base_price, status, airplane_id],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Flight created successfully', flightId: result });
    } catch (error) {
        console.error('Error creating flight:', error);
        res.status(500).json({ message: 'Error creating flight' });
    }
});

router.put('/update-flight/:flight_number/:departure_datetime', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { departure_airport, arrival_airport, base_price, status, airplane_id } = req.body;
    const airline_name = req.user.airline_name;

    try {
        const [maintenance] = await sequelize.query(
            `SELECT * FROM MaintenanceProcedure 
            WHERE airplane_id = ? 
            AND airline_name = ? 
            AND start_datetime <= ? 
            AND end_datetime >= ?`,
            {
                replacements: [airplane_id, airline_name, departure_datetime, departure_datetime],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (Array.isArray(maintenance) && maintenance.length > 0) {
            return res.status(409).json({ message: 'Airplane is under maintenance during this time' });
        }

        const result = await sequelize.query(
            `UPDATE Flight
            SET departure_airport = ?, arrival_airport = ?, base_price = ?, status = ?, airplane_id = ?
            WHERE flight_number = ? AND departure_datetime = ? AND airline_name = ?`,
            {
                replacements: [departure_airport, arrival_airport, base_price, status, airplane_id, flight_number, departure_datetime, airline_name],
                type: sequelize.QueryTypes.UPDATE
            }
        );

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

router.get('/flight-ratings/:flight_number/:departure_datetime', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { airline_name } = req.user;

    try {
        const ratings = await sequelize.query(
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
        console.error('Error retrieving flight ratings:', error);
        res.status(500).json({ message: 'Error retrieving flight ratings' });
    }
});

router.post('/schedule-maintenance', ensureAuthenticated, async (req, res) => {
    const airline_name = req.user.airline_name;
    const airplane_id = req.body.airplane_id;
    const start_datetime = req.body.start_datetime;
    const end_datetime = req.body.end_datetime;

    try {
        const [existingMaintenance] = await sequelize.query(
            `SELECT * FROM MaintenanceProcedure 
            WHERE airplane_id = ? 
            AND airline_name = ? 
            AND (
                (start_datetime <= ? AND end_datetime >= ?) OR 
                (start_datetime <= ? AND end_datetime >= ?)
            )`,
            {
                replacements: [airplane_id, airline_name, start_datetime, start_datetime, end_datetime, end_datetime],
                type: sequelize.QueryTypes.SELECT
            }
        );

        console.log('Existing maintenance:', existingMaintenance);

        if (Array.isArray(existingMaintenance) && existingMaintenance.length > 0) {
            return res.status(409).json({ message: 'Airplane is already scheduled for maintenance during this period' });
        }

        const [result] = await sequelize.query(
            `INSERT INTO MaintenanceProcedure (airline_name, airplane_id, start_datetime, end_datetime)
            VALUES (?, ?, ?, ?)`,
            {
                replacements: [airline_name, airplane_id, start_datetime, end_datetime],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Maintenance scheduled successfully', maintenanceId: result });
    } catch (error) {
        console.error('Error scheduling maintenance:', error);
        res.status(500).json({ message: 'Error scheduling maintenance' });
    }
});

router.get('/view-flights', ensureAuthenticated, async (req, res) => {
    const { username } = req.user;
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

router.get('/flight-customers/:flight_number/:departure_datetime', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime } = req.params;
    const { airline_name } = req.user;

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
        console.error('Error retrieving flight customers:', error);
        res.status(500).json({ message: 'Error retrieving flight customers' });
    }
});

router.put('/change-flight-status/:flight_number/:departure_datetime/:arrival_datetime', ensureAuthenticated, async (req, res) => {
    const { flight_number, departure_datetime, arrival_datetime } = req.params;
    const { status } = req.body;
    const { airline_name } = req.user;

    try {
        const result = await sequelize.query(
            `UPDATE Flight
            SET status = ?
            WHERE airline_name = ?
            AND flight_number = ?
            AND departure_datetime = ?
            AND arrival_datetime = ?`,
            {
                replacements: [status, airline_name, flight_number, departure_datetime, arrival_datetime],
                type: sequelize.QueryTypes.UPDATE
            }
        );

        console.log('Update result:', result);

        if (result[1] > 0) {
            res.json({ message: 'Flight status updated successfully' });
        } else {
            res.status(404).json({ message: 'Flight not found' });
        }
    } catch (error) {
        console.error('Error updating flight status:', error);
        res.status(500).json({ message: 'Error updating flight status' });
    }
});

router.post('/add-airplane', ensureAuthenticated, async (req, res) => {
    const { airline_name } = req.user;
    const { airplane_id, number_of_seats, manufacturing_company, model_number, manufacturing_date } = req.body;

    try {
        const [result] = await sequelize.query(
            `INSERT INTO Airplane (airline_name, airplane_id, number_of_seats, manufacturing_company, model_number, manufacturing_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            {
                replacements: [airline_name, airplane_id, number_of_seats, manufacturing_company, model_number, manufacturing_date],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Airplane added successfully', airplaneId: result });
    } catch (error) {
        console.error('Error adding airplane:', error);
        res.status(500).json({ message: 'Error adding airplane' });
    }
});

router.get('/view-airplanes', ensureAuthenticated, async (req, res) => {
    const { airline_name } = req.user;

    try {
        const airplanes = await sequelize.query(
            `SELECT * FROM Airplane WHERE airline_name = ?`,
            {
                replacements: [airline_name],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(airplanes);
    } catch (error) {
        console.error('Error retrieving airplanes:', error);
        res.status(500).json({ message: 'Error retrieving airplanes' });
    }
});

router.post('/add-airport', ensureAuthenticated, async (req, res) => {
    const { airport_code, name, city, country, number_of_terminals, airport_type } = req.body;

    try {
        const [result] = await sequelize.query(
            `INSERT INTO Airport (airport_code, name, city, country, number_of_terminals, airport_type)
            VALUES (?, ?, ?, ?, ?, ?)`,
            {
                replacements: [airport_code, name, city, country, number_of_terminals, airport_type],
                type: sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Airport added successfully', airportCode: result });
    } catch (error) {
        console.error('Error adding airport:', error);
        res.status(500).json({ message: 'Error adding airport' });
    }
});

router.get('/frequent-customer', ensureAuthenticated, async (req, res) => {
    const { airline_name } = req.user;

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
        console.error('Error retrieving frequent customer:', error);
        res.status(500).json({ message: 'Error retrieving frequent customer' });
    }
});

router.get('/customer-flights/:email', ensureAuthenticated, async (req, res) => {
    const { email } = req.params;
    const { airline_name } = req.user;

    try {
        const flights = await sequelize.query(
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
        console.error('Error retrieving customer flights:', error);
        res.status(500).json({ message: 'Error retrieving customer flights' });
    }
});

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
        console.error('Error retrieving earned revenue:', error);
        res.status(500).json({ message: 'Error retrieving earned revenue' });
    }
});

router.get('/airplanes', ensureAuthenticated, async (req, res) => {
    const { airline_name } = req.user;

    try {
        const airplanes = await sequelize.query(
            `SELECT A.airplane_id, A.manufacturing_company, A.model_number 
            FROM Airplane A
            WHERE A.airline_name = ?
            AND NOT EXISTS (
                SELECT 1 FROM MaintenanceProcedure M
                WHERE M.airplane_id = A.airplane_id
                AND M.airline_name = A.airline_name
                AND M.start_datetime <= NOW()
                AND M.end_datetime >= NOW()
            )`,
            {
                replacements: [airline_name],
                type: sequelize.QueryTypes.SELECT
            }
        );

        console.log('Available airplanes:', airplanes);
        res.json(airplanes);
    } catch (error) {
        console.error('Error retrieving airplanes:', error);
        res.status(500).json({ message: 'Error retrieving airplanes' });
    }
});

router.get('/departed-flights', ensureAuthenticated, async (req, res) => {
    const { airline_name } = req.user;

    try {
        const departedFlights = await sequelize.query(
            `SELECT flight_number, departure_datetime 
             FROM Flight 
             WHERE airline_name = ? 
             AND departure_datetime < NOW()`,
            {
                replacements: [airline_name],
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(departedFlights);
    } catch (error) {
        console.error('Error retrieving departed flights:', error);
        res.status(500).json({ message: 'Error retrieving departed flights' });
    }
});

router.get('/monthly-ticket-sales', ensureAuthenticated, async (req, res) => {
    try {
        const monthlySales = await sequelize.query(
            `SELECT 
                DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month,
                COUNT(T.ticket_id) AS tickets_sold
            FROM 
                Ticket T
            WHERE 
                T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
            GROUP BY 
                month
            ORDER BY 
                month`,
            {
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json(monthlySales);
    } catch (error) {
        console.error('Error retrieving monthly ticket sales:', error);
        res.status(500).json({ message: 'Error retrieving monthly ticket sales' });
    }
});

export default router;
