const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

module.exports = (validations) => async (req, _res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => (e.path ? `${e.path}: ${e.msg}` : e.msg))
      .join(', ');
    return next(new ApiError(message, 400));
  }
  return next();
};
