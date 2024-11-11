-- Insert into Airline table
INSERT INTO Airline (airline_name) VALUES ('Jet Blue');

-- Insert into Airport table
INSERT INTO Airport (airport_code, name, city, country, number_of_terminals, airport_type) VALUES
('JFK', 'John F. Kennedy International Airport', 'New York City', 'USA', 6, 'both'),
('PVG', 'Shanghai Pudong International Airport', 'Shanghai', 'China', 4, 'international');

-- Insert into Customer table
INSERT INTO Customer (email, password, first_name, last_name, date_of_birth, building_number, street, apartment_number, city, state, zip_code, passport_number, passport_expiration, passport_country) VALUES
('john.doe@example.com', 'password123', 'John', 'Doe', '1985-06-15', '123', 'Main St', '1A', 'New York', 'NY', '10001', 'A12345678', '2027-12-31', 'USA'),
('jane.smith@example.com', 'securepass', 'Jane', 'Smith', '1990-08-22', '456', 'Broadway', '2B', 'New York', 'NY', '10002', 'B98765432', '2026-11-30', 'USA'),
('alice.jones@example.com', 'alicepass', 'Alice', 'Jones', '1992-03-10', '789', '5th Ave', '3C', 'New York', 'NY', '10003', 'C87654321', '2025-10-15', 'USA'),
('bob.brown@example.com', 'bobsecure', 'Bob', 'Brown', '1980-12-01', '101', 'Elm St', '4D', 'Los Angeles', 'CA', '90001', 'D12345678', '2028-01-01', 'USA'),
('carol.white@example.com', 'carolpass', 'Carol', 'White', '1975-07-20', '202', 'Pine St', '5E', 'Chicago', 'IL', '60601', 'E98765432', '2029-02-15', 'USA'),
('dave.green@example.com', 'davepass', 'Dave', 'Green', '1995-11-11', '303', 'Oak St', '6F', 'Houston', 'TX', '77001', 'F87654321', '2030-03-20', 'USA'),
('eve.black@example.com', 'evepass', 'Eve', 'Black', '1988-04-04', '404', 'Maple St', '7G', 'Phoenix', 'AZ', '85001', 'G76543210', '2031-04-25', 'USA');

-- Insert into Airplane table
INSERT INTO Airplane (airline_name, airplane_id, number_of_seats, manufacturing_company, model_number, manufacturing_date) VALUES
('Jet Blue', 1, 150, 'Boeing', '737', '2010-05-20'), 
('Jet Blue', 2, 180, 'Airbus', 'A320', '2012-07-15'), 
('Jet Blue', 3, 200, 'Boeing', '747', '2015-09-10'), 
('Jet Blue', 4, 220, 'Boeing', '787', '2018-03-25'), 
('Jet Blue', 5, 250, 'Airbus', 'A350', '2020-08-30'); 

-- Insert multiple staff members for Jet Blue into AirlineStaff table
INSERT INTO AirlineStaff (username, password, first_name, last_name, date_of_birth, airline_name) VALUES
('jblue_staff1', 'staffpass1', 'Emily', 'Brown', '1988-01-25', 'Jet Blue'),
('jblue_staff2', 'staffpass2', 'Michael', 'Smith', '1990-02-15', 'Jet Blue'),
('jblue_staff3', 'staffpass3', 'Sarah', 'Johnson', '1985-07-30', 'Jet Blue');

-- Insert into Flight table
INSERT INTO Flight (airline_name, flight_number, departure_datetime, departure_airport, arrival_airport, base_price, status) VALUES
-- Flight JB101 from JFK to PVG on-time
('Jet Blue', 'JB101', '2024-11-01 08:00:00', 'JFK', 'PVG', 500.00, 'on-time'),
-- Flight JB102 from PVG to JFK delayed
('Jet Blue', 'JB102', '2024-11-02 09:00:00', 'PVG', 'JFK', 550.00, 'delayed'),
-- Flight JB103 from JFK to PVG on-time
('Jet Blue', 'JB103', '2024-11-03 10:00:00', 'JFK', 'PVG', 600.00, 'on-time'),
-- Flight JB104 from PVG to JFK delayed
('Jet Blue', 'JB104', '2024-11-04 11:00:00', 'PVG', 'JFK', 650.00, 'delayed'),
-- Flight JB105 from JFK to PVG on-time
('Jet Blue', 'JB105', '2024-11-05 12:00:00', 'JFK', 'PVG', 700.00, 'on-time'),
-- Flight JB106 from PVG to JFK delayed
('Jet Blue', 'JB106', '2024-11-06 13:00:00', 'PVG', 'JFK', 750.00, 'delayed'),
-- Flight JB107 from JFK to PVG on-time in January 2025
('Jet Blue', 'JB107', '2025-01-15 14:00:00', 'JFK', 'PVG', 800.00, 'on-time');

-- Insert into Ticket table
INSERT INTO Ticket (ticket_id, airline_name, flight_number, departure_datetime, email, sold_price, purchase_datetime, card_number, name_on_card, card_expiration_date, passenger_first_name, passenger_last_name, passenger_dob) VALUES
-- Ticket for Flight JB101
(1, 'Jet Blue', 'JB101', '2024-11-01 08:00:00', 'john.doe@example.com', 500.00, '2024-10-01 10:00:00', '1234567890123456', 'John Doe', '2024-01-01', 'John', 'Doe', '1985-06-15'),
-- Ticket for Flight JB102
(2, 'Jet Blue', 'JB102', '2024-11-02 09:00:00', 'jane.smith@example.com', 550.00, '2024-10-02 11:00:00', '2345678901234567', 'Jane Smith', '2025-02-01', 'Jane', 'Smith', '1990-08-22'),
-- Ticket for Flight JB103
(3, 'Jet Blue', 'JB103', '2024-11-03 10:00:00', 'alice.jones@example.com', 600.00, '2024-10-03 12:00:00', '3456789012345678', 'Alice Jones', '2026-03-01', 'Alice', 'Jones', '1992-03-10'),
-- Ticket for Flight JB104
(4, 'Jet Blue', 'JB104', '2024-11-04 11:00:00', 'bob.brown@example.com', 650.00, '2024-10-04 13:00:00', '4567890123456789', 'Bob Brown', '2027-04-01', 'Bob', 'Brown', '1980-12-01'),
-- Ticket for Flight JB105
(5, 'Jet Blue', 'JB105', '2024-11-05 12:00:00', 'carol.white@example.com', 700.00, '2024-10-05 14:00:00', '5678901234567890', 'Carol White', '2028-05-01', 'Carol', 'White', '1975-07-20'),
-- Ticket for Flight JB106
(6, 'Jet Blue', 'JB106', '2024-11-06 13:00:00', 'dave.green@example.com', 750.00, '2024-10-06 15:00:00', '6789012345678901', 'Dave Green', '2029-06-01', 'Dave', 'Green', '1995-11-11'),
-- Ticket for Flight JB107
(7, 'Jet Blue', 'JB107', '2025-01-15 14:00:00', 'eve.black@example.com', 800.00, '2024-12-15 16:00:00', '7890123456789012', 'Eve Black', '2030-07-01', 'Eve', 'Black', '1988-04-04');

-- Insert into Rates table
INSERT INTO Rates (email, airline_name, flight_number, departure_datetime, rating, comments) VALUES
-- Rating for Flight JB101
('john.doe@example.com', 'Jet Blue', 'JB101', '2024-11-01 08:00:00', 5, 'Great flight, very comfortable.'),
-- Rating for Flight JB102
('jane.smith@example.com', 'Jet Blue', 'JB102', '2024-11-02 09:00:00', 4, 'Good service, but delayed.'),
-- Rating for Flight JB103
('alice.jones@example.com', 'Jet Blue', 'JB103', '2024-11-03 10:00:00', 5, 'Excellent experience.'),
-- Rating for Flight JB104
('bob.brown@example.com', 'Jet Blue', 'JB104', '2024-11-04 11:00:00', 3, 'Average, flight was delayed.'),
-- Rating for Flight JB105
('carol.white@example.com', 'Jet Blue', 'JB105', '2024-11-05 12:00:00', 5, 'Very smooth flight.'),
-- Rating for Flight JB106
('dave.green@example.com', 'Jet Blue', 'JB106', '2024-11-06 13:00:00', 4, 'Good, but could improve timing.');

-- Insert into MaintenanceProcedure table
INSERT INTO MaintenanceProcedure (procedure_id, airline_name, airplane_id, start_datetime, end_datetime) VALUES
-- Maintenance for Airplane 1
(1, 'Jet Blue', 1, '2024-10-01 08:00:00', '2024-10-01 16:00:00'),
-- Maintenance for Airplane 2
(2, 'Jet Blue', 2, '2024-10-02 09:00:00', '2024-10-02 17:00:00'),
-- Maintenance for Airplane 3
(3, 'Jet Blue', 3, '2024-10-03 10:00:00', '2024-10-03 18:00:00'),
-- Maintenance for Airplane 4
(4, 'Jet Blue', 4, '2024-10-04 11:00:00', '2024-10-04 19:00:00'),
-- Maintenance for Airplane 5
(5, 'Jet Blue', 5, '2024-10-05 12:00:00', '2024-10-05 20:00:00');
