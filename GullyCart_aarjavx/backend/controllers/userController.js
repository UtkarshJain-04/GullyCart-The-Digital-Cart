const { userService } = require('../services');

async function getProfile(request, response) {
  const user = await userService.getUserProfile(request.user.id);
  return response.json({ user });
}

async function updateProfile(request, response) {
  const user = await userService.updateUserProfile(request.user.id, request.body);
  return response.json({ user });
}

async function updateCredentials(request, response) {
  const user = await userService.updateUserCredentials(request.user.id, request.body);
  return response.json({ user, message: 'Account credentials updated successfully.' });
}

module.exports = { getProfile, updateProfile, updateCredentials };