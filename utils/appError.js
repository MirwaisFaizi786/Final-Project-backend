class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // isOperational = true; Means that this error is operational error Like invalid input, search for id that does not exist
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}


module.exports = AppError
