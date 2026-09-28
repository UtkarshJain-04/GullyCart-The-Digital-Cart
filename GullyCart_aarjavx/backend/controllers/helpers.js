function asyncHandler(controller) {
  return (request, response, next) => {
    Promise.resolve(controller(request, response, next)).catch(next);
  };
}

function sendError(error, response) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
    return response.status(409).json({ message: `${field} is already registered.` });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(' ') });
  }

  const message = error.message || 'Internal server error.';
  const statusCode = /required|invalid|incorrect|password|coordinates/i.test(message)
    ? 400
    : /not found/i.test(message)
      ? 404
      : 500;

  return response.status(statusCode).json({ message });
}

module.exports = { asyncHandler, sendError };