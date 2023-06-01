const { ErrorType } = require("./ErrorType.enum");

module.exports = (error: any, req: any, res: any, next: any) => {
    if (error) {
        let statusCode = error.statusCode || 500;
        let errorMessage = error.message || 'Internal Server Error';
        res.status(statusCode).json({ error: errorMessage });
    } else {
        next();
    }
};