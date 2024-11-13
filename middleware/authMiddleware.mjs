// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    // Check if user is authenticated
    if (req.isAuthenticated()) {
        return next(); // Proceed if authenticated
    }
    // Redirect to login if not authenticated
    res.redirect('/login');
}

export default ensureAuthenticated;
