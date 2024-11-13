import express from 'express';
import session from 'express-session';
import passport from './config/auth.mjs';
import flash from 'connect-flash';
import authRoutes from './routes/auth.mjs';
import staffRoutes from './routes/staff.mjs';
import customerRoutes from './routes/customer.mjs';
import publicRoutes from './routes/public.mjs';
import errorHandler from './middleware/errorHandler.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

app.set('view engine', 'ejs');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET, // Use secret from .env
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', authRoutes);
app.use('/staff', staffRoutes);
app.use('/customer', customerRoutes);
app.use('/public', publicRoutes);

// Error handling
app.use(errorHandler);

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
