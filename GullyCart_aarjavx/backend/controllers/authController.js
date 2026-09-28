const { authService } = require('../services');

async function register(request, response) {
  const result = await authService.registerUser(request.body);
  return response.status(201).json(result);
}

async function login(request, response) {
  const result = await authService.loginUser(request.body);
  return response.json(result);
}

function currentUser(request, response) {
  return response.json({ user: request.user });
}

module.exports = { register, login, currentUser };