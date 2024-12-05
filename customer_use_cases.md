
[View Source Code](https://github.com/EnockMagara/DATABASESFINAL/blob/master/routes/customer.mjs)
1. **View Ratings Page**
   - **Endpoint**: `/customer/ratings`
   - **Explanation**: Renders the ratings page for customers.

2. **View Flights Page**
   - **Endpoint**: `/customer/flights`
   - **Explanation**: Renders the flights page for customers.

3. **View Purchase Page**
   - **Endpoint**: `/customer/purchase`
   - **Explanation**: Renders the purchase page for customers.

4. **View Spending Page**
   - **Endpoint**: `/customer/spending`
   - **Explanation**: Renders the spending page for customers.

5. **Search Flights**
   - **Endpoint**: `/customer/search-flights`
   - **Query**: 
     ```sql
     SELECT airline_name AS "Airline", flight_number AS "Flight Number", departure_datetime AS "Departure Date & Time", arrival_datetime AS "Arrival Date & Time", departure_airport AS "Departure Airport", arrival_airport AS "Arrival Airport", base_price AS "Base Price", status AS "Status"
     FROM Flight
     WHERE (departure_airport = ? AND arrival_airport = ? AND DATE(departure_datetime) = ?)
     OR (departure_airport = ? AND arrival_airport = ? AND DATE(departure_datetime) = ?)
     ORDER BY departure_datetime
     ```
   - **Explanation**: Searches for flights based on departure and arrival airports and dates.

6. **Purchase Ticket**
   - **Endpoint**: `/customer/purchase-ticket`
   - **Query**: 
     ```sql
     SELECT * FROM Flight WHERE airline_name = ? AND flight_number = ? AND departure_datetime = ?
     ```
     ```sql
     INSERT INTO Ticket (airline_name, flight_number, departure_datetime, email, sold_price, purchase_datetime, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ```
   - **Explanation**: Purchases a ticket for a specified flight, adjusting price based on seat availability.

7. **Cancel Trip**
   - **Endpoint**: `/customer/cancel-trip`
   - **Query**: 
     ```sql
     DELETE FROM Ticket WHERE ticket_id = ? AND email = ? AND departure_datetime > NOW() + INTERVAL 1 DAY
     ```
   - **Explanation**: Cancels a trip if the departure is more than one day away.

8. **Give Feedback**
   - **Endpoint**: `/customer/give-feedback`
   - **Query**: 
     ```sql
     SELECT * FROM Ticket WHERE email = ? AND flight_number = ? AND departure_datetime = ?
     ```
     ```sql
     INSERT INTO Rates (email, airline_name, flight_number, departure_datetime, rating, comments)
     VALUES (?, ?, ?, ?, ?, ?)
     ```
   - **Explanation**: Allows customers to give feedback on a flight they have taken.

9. **Total Spending for the Year**
   - **Endpoint**: `/customer/spending/total-year`
   - **Query**: 
     ```sql
     SELECT SUM(T.sold_price) AS total_spent FROM Ticket T JOIN Customer C ON T.email = C.email WHERE T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR) AND C.email = ?
     ```
   - **Explanation**: Retrieves the total amount spent by the customer in the past year.

10. **Monthly Spending for Last 6 Months**
    - **Endpoint**: `/customer/spending/monthly-last-6-months`
    - **Query**: 
      ```sql
      SELECT DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month, SUM(T.sold_price) AS total_spent FROM Ticket T WHERE T.email = ? AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month DESC
      ```
    - **Explanation**: Retrieves monthly spending for the last six months.

11. **Total Spending for a Date Range**
    - **Endpoint**: `/customer/spending/total-range`
    - **Query**: 
      ```sql
      SELECT SUM(T.sold_price) AS total_spent FROM Ticket T WHERE T.email = ? AND T.purchase_datetime BETWEEN ? AND ?
      ```
      ```sql
      SELECT DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month, SUM(T.sold_price) AS total_spent FROM Ticket T WHERE T.email = ? AND T.purchase_datetime BETWEEN ? AND ? GROUP BY month ORDER BY month
      ```
    - **Explanation**: Retrieves total and monthly spending for a specified date range.

12. **View Future Tickets**
    - **Endpoint**: `/customer/tickets/future`
    - **Query**: 
      ```sql
      SELECT ticket_id, flight_number, departure_datetime FROM Ticket WHERE email = :email AND departure_datetime > NOW() + INTERVAL 1 DAY
      ```
    - **Explanation**: Retrieves future tickets for the customer.
