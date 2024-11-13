// Middleware to handle errors
function errorHandler(err, req, res, next) {
    // Log the error for debugging
    console.error(err.stack);
    // Send a generic error message to the client
    res.status(500).send('Something went wrong!');
}

export default errorHandler;
