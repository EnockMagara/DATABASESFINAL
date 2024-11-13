import express from 'express';
import session from 'express-session';
import passport from './config/auth.mjs';
import authRoutes from './routes/auth.mjs';
import errorHandler from './middleware/errorHandler.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET, // Use secret from .env
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', authRoutes);

// Error handling
app.use(errorHandler);

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
