// Custom middleware to save user ID globally
module.exports = (req: any, res: any, next: any) => {
    // Assuming the user ID is available in the req.user property
    /* const userId = req.user.id; */
    // Attach the user ID to the request object
    req.myId = "646c717807b8f6e95d42ae59";
    next();
};