const { vendorRepository } = require('../repositories');
const { normalizePoint } = require('../utils/geo');

const PROFILE_FIELDS = ['businessName', 'categories', 'procurementTime'];

function validateCoordinates(longitude, latitude) {
  if (
    !Number.isFinite(Number(longitude)) ||
    !Number.isFinite(Number(latitude)) ||
    Number(longitude) < -180 ||
    Number(longitude) > 180 ||
    Number(latitude) < -90 ||
    Number(latitude) > 90
  ) {
    throw new Error('Valid longitude and latitude are required.');
  }
}

function findNearbyVendors(longitude, latitude, maxDistance = 2000) {
  validateCoordinates(longitude, latitude);
  return vendorRepository.findNearby({
    longitude: Number(longitude),
    latitude: Number(latitude),
    maxDistance: Number(maxDistance),
  });
}

function updateVendorLocation(vendorId, longitude, latitude) {
  validateCoordinates(longitude, latitude);
  const point = normalizePoint([latitude, longitude]);
  return vendorRepository.updateLocation(vendorId, point.coordinates[0], point.coordinates[1]);
}

function setVendorSellingStatus(vendorId, isActive) {
  return vendorRepository.setSellingStatus(vendorId, Boolean(isActive));
}

function pickProfileUpdates(updates = {}) {
  return PROFILE_FIELDS.reduce((profile, field) => {
    if (updates[field] !== undefined) profile[field] = updates[field];
    return profile;
  }, {});
}

async function getVendorProfile(vendorId) {
  const vendor = await vendorRepository.findById(vendorId);
  if (!vendor) throw new Error('Vendor profile not found.');
  return vendor;
}

async function getVendorProfileForUser(userId) {
  const vendor = await vendorRepository.findByUserId(userId);
  if (!vendor) throw new Error('Vendor profile not found.');
  return vendor;
}

async function updateVendorProfile(vendorId, updates) {
  const profileUpdates = pickProfileUpdates(updates);
  if (profileUpdates.currentLocation) profileUpdates.currentLocation = normalizePoint(profileUpdates.currentLocation);
  const vendor = await vendorRepository.updateById(vendorId, profileUpdates);
  if (!vendor) throw new Error('Vendor profile not found.');
  return vendor;
}

module.exports = {
  findNearbyVendors,
  updateVendorLocation,
  setVendorSellingStatus,
  getVendorProfile,
  getVendorProfileForUser,
  updateVendorProfile,
};