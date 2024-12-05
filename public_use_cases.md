
[View Source Code](https://github.com/EnockMagara/DATABASESFINAL/blob/master/routes/public.mjs)
1. **Search Flights**
   - **Endpoint**: `/public/search-flights`
   - **Query**:      ```sql
     SELECT airline_name AS "Airline", flight_number AS "Flight Number", departure_datetime AS "Departure Date & Time", arrival_datetime AS "Arrival Date & Time", departure_airport AS "Departure Airport", arrival_airport AS "Arrival Airport", base_price AS "Base Price", status AS "Status"
     FROM Flight
     WHERE (departure_airport = ? AND arrival_airport = ? AND DATE(departure_datetime) = ?)
     OR (departure_airport = ? AND arrival_airport = ? AND DATE(departure_datetime) = ?)
     ORDER BY departure_datetime     ```
   - **Explanation**: Allows users to search for flights based on departure and arrival airports and dates.

2. **Check Flight Status**
   - **Endpoint**: `/public/flight-status`
   - **Query**:      ```sql
     SELECT airline_name AS "Airline", flight_number AS "Flight Number", departure_datetime AS "Departure Date & Time", arrival_datetime AS "Arrival Date & Time", arrival_airport AS "Arrival Airport", departure_airport AS "Departure Airport", status AS "Flight Status"
     FROM Flight
     WHERE airline_name = ? AND flight_number = ? AND DATE(departure_datetime) = ?     ```
   - **Explanation**: Allows users to check the status of a specific flight by providing the airline, flight number, and date.
