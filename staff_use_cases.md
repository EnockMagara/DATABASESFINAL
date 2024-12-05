[View Source Code](https://github.com/EnockMagara/DATABASESFINAL/blob/master/routes/staff.mjs)

1. **Manage Flights**
   - **Endpoint**: `/staff/manage-flights`
   - **Explanation**: Renders the page for managing flights.

2. **View Analytics**
   - **Endpoint**: `/staff/analytics`
   - **Explanation**: Renders the analytics page for staff.

3. **View Maintenance**
   - **Endpoint**: `/staff/maintenance`
   - **Explanation**: Renders the maintenance management page.

4. **View Revenue**
   - **Endpoint**: `/staff/revenue`
   - **Explanation**: Renders the revenue overview page.

5. **Create Flight**
   - **Endpoint**: `/staff/create-flight`
   - **Query**: 
     ```sql
     SELECT * FROM MaintenanceProcedure 
     WHERE airplane_id = ? 
     AND airline_name = ? 
     AND start_datetime <= ? 
     AND end_datetime >= ?
     ```
     ```sql
     INSERT INTO Flight (airline_name, flight_number, departure_datetime, arrival_datetime, departure_airport, arrival_airport, base_price, status, airplane_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ```
   - **Explanation**: Checks if the airplane is under maintenance before creating a new flight.

6. **Update Flight**
   - **Endpoint**: `/staff/update-flight/:flight_number/:departure_datetime`
   - **Query**: 
     ```sql
     SELECT * FROM MaintenanceProcedure 
     WHERE airplane_id = ? 
     AND airline_name = ? 
     AND start_datetime <= ? 
     AND end_datetime >= ?
     ```
     ```sql
     UPDATE Flight
     SET departure_airport = ?, arrival_airport = ?, base_price = ?, status = ?, airplane_id = ?
     WHERE flight_number = ? AND departure_datetime = ? AND airline_name = ?
     ```
   - **Explanation**: Updates flight details after checking for maintenance conflicts.

7. **View Flight Ratings**
   - **Endpoint**: `/staff/flight-ratings/:flight_number/:departure_datetime`
   - **Query**: 
     ```sql
     SELECT R.airline_name, R.flight_number, R.departure_datetime, AVG(R.rating) AS average_rating, R.comments, R.rating
     FROM Rates R
     WHERE R.airline_name = ? AND R.flight_number = ? AND R.departure_datetime = ?
     GROUP BY R.airline_name, R.flight_number, R.departure_datetime, R.comments, R.rating
     ORDER BY R.departure_datetime
     ```
   - **Explanation**: Retrieves and displays ratings for a specific flight.

8. **Schedule Maintenance**
   - **Endpoint**: `/staff/schedule-maintenance`
   - **Query**: 
     ```sql
     SELECT * FROM MaintenanceProcedure 
     WHERE airplane_id = ? 
     AND airline_name = ? 
     AND ((start_datetime <= ? AND end_datetime >= ?) OR (start_datetime <= ? AND end_datetime >= ?))
     ```
     ```sql
     INSERT INTO MaintenanceProcedure (airline_name, airplane_id, start_datetime, end_datetime)
     VALUES (?, ?, ?, ?)
     ```
   - **Explanation**: Schedules maintenance for an airplane, ensuring no conflicts.

9. **View Flights**
   - **Endpoint**: `/staff/view-flights`
   - **Query**: 
     ```sql
     SELECT airline_name AS "Airline", flight_number AS "Flight Number", departure_datetime AS "Departure Date & Time", departure_airport AS "Departure Airport", arrival_airport AS "Arrival Airport", base_price AS "Base Price", status AS "Status"
     FROM Flight
     WHERE (departure_airport = ? AND arrival_airport = ? AND DATE(departure_datetime) = ?)
     OR (departure_airport = ? AND arrival_airport = ? AND DATE(departure_datetime) = ?)
     ORDER BY departure_datetime
     ```
   - **Explanation**: Retrieves flights based on search criteria.

10. **View Flight Customers**
    - **Endpoint**: `/staff/flight-customers/:flight_number/:departure_datetime`
    - **Query**: 
      ```sql
      SELECT C.email, C.first_name, C.last_name, T.ticket_id, T.sold_price, T.purchase_datetime
      FROM Ticket T
      JOIN Customer C ON T.email = C.email
      WHERE T.flight_number = ? AND T.departure_datetime = ?
      ```
    - **Explanation**: Retrieves customer details for a specific flight.

11. **Change Flight Status**
    - **Endpoint**: `/staff/change-flight-status/:flight_number/:departure_datetime/:arrival_datetime`
    - **Query**: 
      ```sql
      UPDATE Flight
      SET status = ?
      WHERE airline_name = ? AND flight_number = ? AND departure_datetime = ? AND arrival_datetime = ?
      ```
    - **Explanation**: Updates the status of a flight.

12. **Add Airplane**
    - **Endpoint**: `/staff/add-airplane`
    - **Query**: 
      ```sql
      INSERT INTO Airplane (airline_name, airplane_id, number_of_seats, manufacturing_company, model_number, manufacturing_date)
      VALUES (?, ?, ?, ?, ?, ?)
      ```
    - **Explanation**: Adds a new airplane to the airline's fleet.

13. **View Airplanes**
    - **Endpoint**: `/staff/view-airplanes`
    - **Query**: 
      ```sql
      SELECT * FROM Airplane WHERE airline_name = ?
      ```
    - **Explanation**: Retrieves all airplanes for the airline.

14. **Add Airport**
    - **Endpoint**: `/staff/add-airport`
    - **Query**: 
      ```sql
      INSERT INTO Airport (airport_code, name, city, country, number_of_terminals, airport_type)
      VALUES (?, ?, ?, ?, ?, ?)
      ```
    - **Explanation**: Adds a new airport to the system.

15. **View Frequent Customer**
    - **Endpoint**: `/staff/frequent-customer`
    - **Query**: 
      ```sql
      SELECT T.email, COUNT(T.ticket_id) AS ticket_count
      FROM Ticket T
      JOIN Flight F ON T.airline_name = F.airline_name AND T.flight_number = F.flight_number AND T.departure_datetime = F.departure_datetime
      WHERE F.airline_name = ? AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY T.email
      ORDER BY ticket_count DESC
      LIMIT 1
      ```
    - **Explanation**: Retrieves the most frequent customer based on ticket purchases in the last year.

16. **View Customer Flights**
    - **Endpoint**: `/staff/customer-flights/:email`
    - **Query**: 
      ```sql
      SELECT F.airline_name, F.flight_number, F.departure_datetime, F.departure_airport, F.arrival_airport, F.status
      FROM Ticket T
      JOIN Flight F ON T.airline_name = F.airline_name AND T.flight_number = F.flight_number AND T.departure_datetime = F.departure_datetime
      WHERE T.email = ? AND F.airline_name = ?
      ORDER BY F.departure_datetime
      ```
    - **Explanation**: Retrieves all flights associated with a specific customer email.

17. **Earned Revenue**
    - **Endpoint**: `/staff/earned-revenue`
    - **Query**: 
      ```sql
      SELECT SUM(T.sold_price) AS total_revenue_last_month
      FROM Ticket T
      WHERE T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      ```
      ```sql
      SELECT SUM(T.sold_price) AS total_revenue_last_year
      FROM Ticket T
      WHERE T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      ```
    - **Explanation**: Retrieves total revenue earned in the last month and year.

18. **Available Airplanes**
    - **Endpoint**: `/staff/airplanes`
    - **Query**: 
      ```sql
      SELECT A.airplane_id, A.manufacturing_company, A.model_number 
      FROM Airplane A
      WHERE A.airline_name = ?
      AND NOT EXISTS (
          SELECT 1 FROM MaintenanceProcedure M
          WHERE M.airplane_id = A.airplane_id
          AND M.airline_name = A.airline_name
          AND M.start_datetime <= NOW()
          AND M.end_datetime >= NOW()
      )
      ```
    - **Explanation**: Retrieves airplanes that are not currently under maintenance.

19. **Departed Flights**
    - **Endpoint**: `/staff/departed-flights`
    - **Query**: 
      ```sql
      SELECT flight_number, departure_datetime 
      FROM Flight 
      WHERE airline_name = ? 
      AND departure_datetime < NOW()
      ```
    - **Explanation**: Retrieves flights that have already departed.

20. **Monthly Ticket Sales**
    - **Endpoint**: `/staff/monthly-ticket-sales`
    - **Query**: 
      ```sql
      SELECT DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month, COUNT(T.ticket_id) AS tickets_sold
      FROM Ticket T
      WHERE T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
      GROUP BY month
      ORDER BY month
      ```
    - **Explanation**: Retrieves the number of tickets sold each month for the past year.

21. **All Flights**
    - **Endpoint**: `/staff/all-flights`
    - **Query**: 
      ```sql
      SELECT airline_name, flight_number, departure_datetime
      FROM Flight
      ```
    - **Explanation**: Retrieves all flights for populating dropdowns or other selection elements.
