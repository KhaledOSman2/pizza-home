/* eslint-disable no-console */
const ApiError = require('../utils/ApiError');

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ApiError(message, 400);
}

function handleDuplicateFieldsDB(err) {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(message, 400);
}

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(message, 400);
}

const errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  let error = { ...err, message: err.message, name: err.name };
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  return res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || 'Something went wrong',
  });
};

module.exports = { errorHandler };
