--Customer use cases
-- a. Show all the future flights in the system.
SELECT 
    T.ticket_id,
    F.airline_name,
    F.flight_number,
    F.departure_datetime,
    F.departure_airport,
    F.arrival_airport,
    F.status,
    F.base_price
FROM 
    Ticket T
JOIN 
    Flight F ON T.airline_name = F.airline_name 
    AND T.flight_number = F.flight_number 
    AND T.departure_datetime = F.departure_datetime
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND F.departure_datetime > NOW(); -- Only future flights


--allows users to specify a date range to view their flights.

SELECT 
    T.ticket_id,
    F.airline_name,
    F.flight_number,
    F.departure_datetime,
    F.departure_airport,
    F.arrival_airport,
    F.status,
    F.base_price
FROM 
    Ticket T
JOIN 
    Flight F ON T.airline_name = F.airline_name 
    AND T.flight_number = F.flight_number 
    AND T.departure_datetime = F.departure_datetime
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND F.departure_datetime BETWEEN '2023-11-01' AND '2023-12-31'; -- Replace with desired date range

--allows users to filter flights by a specific source or destination airport.
SELECT 
    T.ticket_id,
    F.airline_name,
    F.flight_number,
    F.departure_datetime,
    F.departure_airport,
    F.arrival_airport,
    F.status,
    F.base_price
FROM 
    Ticket T
JOIN 
    Flight F ON T.airline_name = F.airline_name 
    AND T.flight_number = F.flight_number 
    AND T.departure_datetime = F.departure_datetime
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND (F.departure_airport = 'JFK' OR F.arrival_airport = 'LAX'); -- Replace with desired airport codes


--allows users to filter their flights by a specific city.
    SELECT 
    T.ticket_id,
    F.airline_name,
    F.flight_number,
    F.departure_datetime,
    F.departure_airport,
    F.arrival_airport,
    F.status,
    F.base_price
FROM 
    Ticket T
JOIN 
    Flight F ON T.airline_name = F.airline_name 
    AND T.flight_number = F.flight_number 
    AND T.departure_datetime = F.departure_datetime
JOIN 
    Airport A1 ON F.departure_airport = A1.airport_code
JOIN 
    Airport A2 ON F.arrival_airport = A2.airport_code
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND (A1.city = 'New York' OR A2.city = 'Los Angeles'); -- Replace with desired city names




-- Search for One-Way Flights
SELECT 
    F.airline_name,
    F.flight_number,
    F.departure_datetime,
    A1.name AS departure_airport_name,
    A1.city AS departure_city,
    A2.name AS arrival_airport_name,
    A2.city AS arrival_city,
    F.status,
    F.base_price
FROM 
    Flight F
JOIN 
    Airport A1 ON F.departure_airport = A1.airport_code
JOIN 
    Airport A2 ON F.arrival_airport = A2.airport_code
WHERE 
    F.departure_datetime > NOW() -- Only future flights
    AND (A1.city = 'New York' OR A1.name = 'JFK') -- Replace with source city or airport name
    AND (A2.city = 'Los Angeles' OR A2.name = 'LAX'); -- Replace with destination city or airport name
    

--Search for Round-Trip Flights
-- Outbound flights
SELECT 
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
    F1.departure_datetime > NOW() -- Only future flights
    AND (A1.city = 'New York' OR A1.name = 'JFK') -- Replace with source city or airport name
    AND (A2.city = 'Los Angeles' OR A2.name = 'LAX') -- Replace with destination city or airport name
    AND F1.departure_datetime BETWEEN '2023-11-01' AND '2023-11-30'; -- Replace with desired departure date range

-- Return flights
SELECT 
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
    F2.departure_datetime > NOW() -- Only future flights
    AND (A3.city = 'Los Angeles' OR A3.name = 'LAX') -- Replace with destination city or airport name
    AND (A4.city = 'New York' OR A4.name = 'JFK') -- Replace with source city or airport name
    AND F2.departure_datetime BETWEEN '2023-12-01' AND '2023-12-31'; -- Replace with desired return date range
    

    --Find eligible flights for cancellation
SELECT 
    T.ticket_id,
    F.departure_datetime
FROM 
    Ticket T
JOIN 
    Flight F ON T.airline_name = F.airline_name 
    AND T.flight_number = F.flight_number 
    AND T.departure_datetime = F.departure_datetime
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND F.departure_datetime > NOW() + INTERVAL 1 DAY; -- More than 24 hours in the 
    

--Give Ratings and Comment on previous flights
--dentify Eligible Flights for Rating
SELECT 
    T.ticket_id,
    F.airline_name,
    F.flight_number,
    F.departure_datetime,
    F.departure_airport,
    F.arrival_airport
FROM 
    Ticket T
JOIN 
    Flight F ON T.airline_name = F.airline_name 
    AND T.flight_number = F.flight_number 
    AND T.departure_datetime = F.departure_datetime
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND F.departure_datetime < NOW(); -- Only past flights

--Total Amount Spent in the Past Year
SELECT 
    SUM(T.sold_price) AS total_spent
FROM 
    Ticket T
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR);

--Monthly Spending for the Last 6 Months
SELECT 
    DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month,
    SUM(T.sold_price) AS total_spent
FROM 
    Ticket T
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY 
    month
ORDER BY 
    month;

--This query calculates the total amount spent within a user-specified date range.
SELECT 
    SUM(T.sold_price) AS total_spent
FROM 
    Ticket T
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND T.purchase_datetime BETWEEN '2023-01-01' AND '2023-12-31'; -- Replace with desired date range


--This query calculates the monthly spending within a user-specified date range.
SELECT 
    DATE_FORMAT(T.purchase_datetime, '%Y-%m') AS month,
    SUM(T.sold_price) AS total_spent
FROM 
    Ticket T
WHERE 
    T.email = 'user@example.com' -- Replace with the current user's email
    AND T.purchase_datetime BETWEEN '2023-01-01' AND '2023-12-31' -- Replace with desired date range
GROUP BY 
    month
ORDER BY 
    month;


--Airline Staff use cases
--View Upcoming Flights for the Next 30 Days
SELECT 
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
    AS.username = 'staff_username' -- Replace with the current staff's username
    AND F.departure_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY);


--View Flights Based on Date Range and Airports/Cities
SELECT 
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
JOIN 
    Airport A1 ON F.departure_airport = A1.airport_code
JOIN 
    Airport A2 ON F.arrival_airport = A2.airport_code
WHERE 
    AS.username = 'staff_username' -- Replace with the current staff's username
    AND F.departure_datetime BETWEEN '2023-11-01' AND '2023-12-31' -- Replace with desired date range
    AND (A1.city = 'New York' OR A1.name = 'JFK') -- Replace with source city or airport name
    AND (A2.city = 'Los Angeles' OR A2.name = 'LAX'); -- Replace with destination city or airport name


--View All Customers of a Particular Flight
SELECT 
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
    T.airline_name = 'Airline Name' -- Replace with the airline name
    AND T.flight_number = 'Flight Number' -- Replace with the flight number
    AND T.departure_datetime = '2023-11-15 10:00:00'; -- Replace with the departure datetime


--View Average Ratings and All Comments for a Specific Flight
SELECT 
    R.airline_name,
    R.flight_number,
    R.departure_datetime,
    AVG(R.rating) AS average_rating,
    R.comments,
    R.rating
FROM 
    Rates R
WHERE 
    R.airline_name = 'Airline Name' -- Replace with the specific airline name
    AND R.flight_number = 'Flight Number' -- Replace with the specific flight number
    AND R.departure_datetime = '2023-11-15 10:00:00' -- Replace with the specific departure datetime
GROUP BY 
    R.airline_name, R.flight_number, R.departure_datetime, R.comments, R.rating
ORDER BY 
    R.departure_datetime;


--View All Ratings and Comments for Flights Operated by a Specific Airline
SELECT 
    R.airline_name,
    R.flight_number,
    R.departure_datetime,
    R.rating,
    R.comments
FROM 
    Rates R
JOIN 
    AirlineStaff AS ON R.airline_name = AS.airline_name
WHERE 
    AS.username = 'staff_username' -- Replace with the current staff's username
ORDER BY 
    R.departure_datetime;

--View the Most Frequent Customer in the Last Year
SELECT 
    T.email,
    COUNT(T.ticket_id) AS ticket_count
FROM 
    Ticket T
JOIN 
    Flight F ON T.airline_name = F.airline_name 
    AND T.flight_number = F.flight_number 
    AND T.departure_datetime = F.departure_datetime
WHERE 
    F.airline_name = 'Airline Name' -- Replace with the specific airline name
    AND T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY 
    T.email
ORDER BY 
    ticket_count DESC
LIMIT 1;


-- View All Flights Taken by a Particular Customer on a Specific Airline
SELECT 
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
    T.email = 'customer@example.com' -- Replace with the specific customer's email
    AND F.airline_name = 'Airline Name' -- Replace with the specific airline name
ORDER BY 
    F.departure_datetime;


--Total Revenue Earned in the Last Month
SELECT 
    SUM(T.sold_price) AS total_revenue_last_month
FROM 
    Ticket T
WHERE 
    T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 MONTH);

-- Total Revenue Earned in the Last Year
SELECT 
    SUM(T.sold_price) AS total_revenue_last_year
FROM 
    Ticket T
WHERE 
    T.purchase_datetime >= DATE_SUB(NOW(), INTERVAL 1 YEAR);

