const { ErrorType } = require("./ErrorType.enum");

module.exports = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let errorMessage = error.message || 'Internal Server Error';
    res.status(statusCode).json({ error: errorMessage });
};