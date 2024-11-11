-- a.Show all the future flights in the system.
SELECT * FROM Flight
WHERE departure_datetime > NOW();

-- b. Show all of the delayed flights in the system.
SELECT * FROM Flight
WHERE status = 'delayed';

--c. Show the customer names who bought the tickets.
SELECT DISTINCT first_name, last_name FROM Customer
JOIN Ticket ON Customer.email = Ticket.email;

--d. Show all the airplanes owned by the airline Jet Blue.
SELECT * FROM Airplane
WHERE airline_name = 'Jet Blue';

