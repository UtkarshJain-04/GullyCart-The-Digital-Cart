const { userRepository } = require('../repositories');
const bcrypt = require('bcrypt');
const { normalizePoint } = require('../utils/geo');

const PROFILE_FIELDS = ['name', 'phone', 'email', 'location'];

function pickProfileUpdates(updates = {}) {
  return PROFILE_FIELDS.reduce((profile, field) => {
    if (updates[field] !== undefined) profile[field] = updates[field];
    return profile;
  }, {});
}

async function getUserProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error('User profile not found.');
  return user;
}

async function updateUserProfile(userId, updates) {
  const profileUpdates = pickProfileUpdates(updates);
  if (profileUpdates.location) profileUpdates.location = normalizePoint(profileUpdates.location);
  const user = await userRepository.updateById(userId, profileUpdates);
  if (!user) throw new Error('User profile not found.');
  return user;
}

async function updateUserCredentials(userId, { currentPassword, phone, newPassword }) {
  if (!currentPassword || (!phone && !newPassword)) {
    throw new Error('Current password and a phone or new password are required.');
  }

  const user = await userRepository.findById(userId, { select: '+passwordHash' });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new Error('Current password is incorrect.');
  }

  const updates = {};
  if (phone) updates.phone = phone.trim();
  if (newPassword) {
    if (newPassword.length < 8) throw new Error('New password must be at least 8 characters.');
    updates.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await userRepository.updateById(userId, updates);
  return getUserProfile(userId);
}

module.exports = { getUserProfile, updateUserProfile, updateUserCredentials };