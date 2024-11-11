-- Create Airline table
CREATE TABLE Airline (
    airline_name VARCHAR(100) PRIMARY KEY -- Primary key for Airline
);

-- Create Airplane table, a weak entity of Airline
CREATE TABLE Airplane (
    airline_name VARCHAR(100), -- Foreign key referencing Airline
    airplane_id INT, -- Unique identifier for each airplane
    number_of_seats INT, -- Number of seats in the airplane
    manufacturing_company VARCHAR(100), -- Company that manufactured the airplane
    model_number VARCHAR(50), -- Model number of the airplane
    manufacturing_date DATE, -- Date when the airplane was manufactured
    PRIMARY KEY (airline_name, airplane_id), -- Composite primary key
    FOREIGN KEY (airline_name) REFERENCES Airline(airline_name) -- Foreign key constraint
);

-- Create Airport table
CREATE TABLE Airport (
    airport_code CHAR(3) PRIMARY KEY, -- Primary key for Airport
    name VARCHAR(100), -- Name of the airport
    city VARCHAR(100), -- City where the airport is located
    country VARCHAR(100), -- Country where the airport is located
    number_of_terminals INT, -- Number of terminals in the airport
    airport_type ENUM('domestic', 'international', 'both') -- Type of airport
);

-- Create Flight table, a weak entity of Airline
CREATE TABLE Flight (
    airline_name VARCHAR(100), -- Foreign key referencing Airline
    flight_number VARCHAR(10), -- Unique flight number
    departure_datetime DATETIME, -- Date and time of departure
    departure_airport CHAR(3), -- Foreign key referencing Airport
    arrival_airport CHAR(3), -- Foreign key referencing Airport
    base_price DECIMAL(10, 2), -- Base price of the flight
    status ENUM('on-time', 'delayed', 'canceled'), -- Status of the flight
    PRIMARY KEY (airline_name, flight_number, departure_datetime), -- Composite primary key
    FOREIGN KEY (airline_name) REFERENCES Airline(airline_name), -- Foreign key constraint
    FOREIGN KEY (departure_airport) REFERENCES Airport(airport_code), -- Foreign key constraint
    FOREIGN KEY (arrival_airport) REFERENCES Airport(airport_code) -- Foreign key constraint
);

-- Create Customer table
CREATE TABLE Customer (
    email VARCHAR(100) PRIMARY KEY, -- Primary key for Customer
    password VARCHAR(100), -- Password for customer account
    first_name VARCHAR(50), -- First name of the customer
    last_name VARCHAR(50), -- Last name of the customer
    date_of_birth DATE, -- Date of birth of the customer
    building_number VARCHAR(10), -- Building number of the customer's address
    street VARCHAR(100), -- Street of the customer's address
    apartment_number VARCHAR(10), -- Apartment number of the customer's address
    city VARCHAR(100), -- City of the customer's address
    state VARCHAR(100), -- State of the customer's address
    zip_code VARCHAR(10), -- Zip code of the customer's address
    passport_number VARCHAR(20), -- Passport number of the customer
    passport_expiration DATE, -- Expiration date of the passport
    passport_country VARCHAR(100) -- Country of the passport
);

-- Create Ticket table
CREATE TABLE Ticket (
    ticket_id INT PRIMARY KEY, -- Primary key for Ticket
    airline_name VARCHAR(100), -- Foreign key referencing Flight
    flight_number VARCHAR(10), -- Foreign key referencing Flight
    departure_datetime DATETIME, -- Foreign key referencing Flight
    email VARCHAR(100), -- Foreign key referencing Customer
    sold_price DECIMAL(10, 2), -- Sold price of the ticket
    purchase_datetime DATETIME, -- Date and time of purchase
    card_number VARCHAR(20), -- Card number used for purchase
    name_on_card VARCHAR(100), -- Name on the card used for purchase
    card_expiration_date DATE, -- Expiration date of the card
    passenger_first_name VARCHAR(50), -- First name of the passenger
    passenger_last_name VARCHAR(50), -- Last name of the passenger
    passenger_dob DATE, -- Date of birth of the passenger
    FOREIGN KEY (airline_name, flight_number, departure_datetime) REFERENCES Flight(airline_name, flight_number, departure_datetime), -- Foreign key constraint
    FOREIGN KEY (email) REFERENCES Customer(email) -- Foreign key constraint
);

-- Create Rates table, relationship between Customer and Flight
CREATE TABLE Rates (
    email VARCHAR(100), -- Foreign key referencing Customer
    airline_name VARCHAR(100), -- Foreign key referencing Flight
    flight_number VARCHAR(10), -- Foreign key referencing Flight
    departure_datetime DATETIME, -- Foreign key referencing Flight
    rating INT CHECK (rating BETWEEN 1 AND 5), -- Rating given by the customer
    comments TEXT, -- Comments given by the customer
    PRIMARY KEY (email, airline_name, flight_number, departure_datetime), -- Composite primary key
    FOREIGN KEY (email) REFERENCES Customer(email), -- Foreign key constraint
    FOREIGN KEY (airline_name, flight_number, departure_datetime) REFERENCES Flight(airline_name, flight_number, departure_datetime) -- Foreign key constraint
);

-- Create AirlineStaff table
CREATE TABLE AirlineStaff (
    username VARCHAR(50) PRIMARY KEY, -- Primary key for AirlineStaff
    password VARCHAR(100), -- Password for staff account
    first_name VARCHAR(50), -- First name of the staff
    last_name VARCHAR(50), -- Last name of the staff
    date_of_birth DATE, -- Date of birth of the staff
    airline_name VARCHAR(100), -- Foreign key referencing Airline
    FOREIGN KEY (airline_name) REFERENCES Airline(airline_name) -- Foreign key constraint
);

-- Create MaintenanceProcedure table
CREATE TABLE MaintenanceProcedure (
    procedure_id INT PRIMARY KEY, -- Primary key for MaintenanceProcedure
    airline_name VARCHAR(100), -- Foreign key referencing Airplane
    airplane_id INT, -- Foreign key referencing Airplane
    start_datetime DATETIME, -- Start date and time of the procedure
    end_datetime DATETIME, -- End date and time of the procedure
    FOREIGN KEY (airline_name, airplane_id) REFERENCES Airplane(airline_name, airplane_id) -- Foreign key constraint
);
