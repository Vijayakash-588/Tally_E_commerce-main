const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Handle Prisma validation error
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
};

module.exports = errorHandler;