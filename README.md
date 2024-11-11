/project-root
│
├── /config
│   ├── db.mjs                # Database configuration
│   └── auth.mjs              # Authentication configuration
│
├── /models
│   ├── Airline.mjs           # Airline model
│   ├── Airplane.mjs          # Airplane model
│   ├── Airport.mjs           # Airport model
│   ├── Flight.mjs            # Flight model
│   ├── Customer.mjs          # Customer model
│   ├── Ticket.mjs            # Ticket model
│   ├── Rates.mjs             # Rates model
│   ├── AirlineStaff.mjs      # AirlineStaff model
│   └── MaintenanceProcedure.mjs # MaintenanceProcedure model
│
├── /views
│   ├── /public               # Public views
│   │   ├── index.ejs         # Home page view
│   │   ├── login.ejs         # Login page view
│   │   └── register.ejs      # Registration page view
│   ├── /customer             # Customer views
│   │   ├── dashboard.ejs     # Customer dashboard
│   │   ├── flights.ejs       # View flights
│   │   ├── purchase.ejs      # Purchase tickets
│   │   └── spending.ejs      # Track spending
│   └── /staff                # Airline staff views
│       ├── dashboard.ejs     # Staff dashboard
│       ├── manageFlights.ejs # Manage flights
│       ├── maintenance.ejs   # Schedule maintenance
│       └── revenue.ejs       # View revenue
│
├── /routes
│   ├── index.mjs             # Main routes file
│   ├── auth.mjs              # Authentication routes and logic
│   ├── customer.mjs          # Customer-specific routes and logic
│   ├── staff.mjs             # Airline staff-specific routes and logic
│   └── public.mjs            # Public routes and logic
│
├── /public
│   ├── /css                  # Stylesheets
│   ├── /js                   # Client-side JavaScript
│   └── /images               # Images and assets
│
├── /middleware
│   ├── authMiddleware.mjs    # Authentication middleware
│   └── errorHandler.mjs      # Error handling middleware
│
├── package.json              # Project metadata and dependencies
├── server.mjs                # Main server file
└── README.md                 # Project documentation