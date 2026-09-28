const { vendorService } = require('../services');

function findNearby(request, response) {
  const { longitude, latitude, maxDistance } = request.query;
  return vendorService.findNearbyVendors(longitude, latitude, maxDistance)
    .then((vendors) => response.json({ vendors }));
}

async function updateLocation(request, response) {
  const { longitude, latitude } = request.body;
  const vendor = await vendorService.updateVendorLocation(request.params.vendorId, longitude, latitude);
  return response.json({ vendor });
}

async function updateSellingStatus(request, response) {
  const vendor = await vendorService.setVendorSellingStatus(
    request.params.vendorId,
    request.body.isActive
  );
  return response.json({ vendor });
}

async function getProfile(request, response) {
  const vendor = request.params.vendorId === 'me'
    ? await vendorService.getVendorProfileForUser(request.user.id)
    : await vendorService.getVendorProfile(request.params.vendorId);
  return response.json({ vendor });
}

async function updateProfile(request, response) {
  const vendor = await vendorService.getVendorProfileForUser(request.user.id);
  const updatedVendor = await vendorService.updateVendorProfile(vendor._id, request.body);
  return response.json({ vendor: updatedVendor });
}

module.exports = { findNearby, updateLocation, updateSellingStatus, getProfile, updateProfile };