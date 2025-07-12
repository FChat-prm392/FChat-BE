class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

const validateDto = (dto) => {
  const errors = dto.validate();
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  return true;
};

const handleValidationError = (error, res) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors
    });
  }
  
  // For other errors, return generic server error
  console.error(error);
  return res.status(500).json({
    message: error.message || 'Internal server error'
  });
};

module.exports = {
  ValidationError,
  validateDto,
  handleValidationError
};
