const Vendor = require('../models/Vendor');

function applyQueryOptions(query, options = {}) {
  if (options.populate) query = query.populate(options.populate);
  if (options.select) query = query.select(options.select);
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  return query;
}

function create(data) { return Vendor.create(data); }
function findById(id, options = {}) { return applyQueryOptions(Vendor.findById(id), options); }
function findOne(filter, options = {}) { return applyQueryOptions(Vendor.findOne(filter), options); }
function findMany(filter = {}, options = {}) { return applyQueryOptions(Vendor.find(filter), options); }
function updateById(id, updates, options = {}) {
  return Vendor.findByIdAndUpdate(id, updates, { new: true, runValidators: true, ...options });
}
function deleteById(id) { return Vendor.findByIdAndDelete(id); }
function findByUserId(userId) { return Vendor.findOne({ userId }); }
function findNearby({ longitude, latitude, maxDistance = 2000 } = {}) {
  return Vendor.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [longitude, latitude] }, $maxDistance: maxDistance } }, isActive: true, verificationStatus: 'approved' });
}
function updateLocation(vendorId, longitude, latitude) {
  return Vendor.findByIdAndUpdate(vendorId, { location: { type: 'Point', coordinates: [longitude, latitude] }, lastLocationUpdate: new Date() }, { new: true, runValidators: true });
}
function setSellingStatus(vendorId, isActive) {
  return Vendor.findByIdAndUpdate(vendorId, { isActive }, { new: true, runValidators: true });
}

function countDocuments(filter = {}) { return Vendor.countDocuments(filter); }

module.exports = { create, findById, findOne, findMany, updateById, deleteById, findByUserId, findNearby, updateLocation, setSellingStatus, countDocuments };