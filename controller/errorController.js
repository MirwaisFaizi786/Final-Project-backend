const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJsonWebTokenError = () => new AppError('Invalid token. Please log in again!', 401);
const handleTokenExpiredError = () => new AppError('Your token has expired. Please log in again!', 401);

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client like : invalid input data, search for id that does not exist
    console.log("Error Status Check wererer:", err.isOperational);
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        })
    }
}

module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        // sendErrorDev(err, res) 
        res.status(statusCode).json({
            status,
            message: err.message,
            error: err,
            stack: err.stack
            
        })
        
    }
    if( process.env.NODE_ENV === 'production') {
        let error = { ...err, message: err.message, name : err.name, stack: err.stack, 
            statusCode: err.statusCode, status: err.status, isOperational: err.isOperational, errmsg: err.errmsg };
           
        if( error.name === 'CastError') error = handleCastErrorDB(error);
        if( error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJsonWebTokenError(error);
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredError(error);
        sendErrorProd(error, res)
    }

}