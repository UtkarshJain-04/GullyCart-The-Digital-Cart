const Order = require('../models/Order');

function applyQueryOptions(query, options = {}) {
  if (options.populate) query = query.populate(options.populate);
  if (options.select) query = query.select(options.select);
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  return query;
}

function create(data) { return Order.create(data); }
function findById(id, options = {}) { return applyQueryOptions(Order.findById(id), options); }
function findOne(filter, options = {}) { return applyQueryOptions(Order.findOne(filter), options); }
function findMany(filter = {}, options = {}) { return applyQueryOptions(Order.find(filter), options); }
function updateById(id, updates, options = {}) {
  return Order.findByIdAndUpdate(id, updates, { new: true, runValidators: true, ...options });
}
function deleteById(id) { return Order.findByIdAndDelete(id); }
function findByCustomer(customerId, options = {}) { return findMany({ customerId }, { sort: { createdAt: -1 }, ...options }); }
function findByVendor(vendorId, options = {}) { return findMany({ vendorId }, { sort: { createdAt: -1 }, ...options }); }
function findByVendorAndStatus(vendorId, status, options = {}) { return findMany({ vendorId, status }, { sort: { createdAt: -1 }, ...options }); }
function updateStatus(orderId, status) { return updateById(orderId, { status }); }
function findExpiredPendingOrders(now = new Date()) { return findMany({ status: 'pending', expiresAt: { $lte: now } }); }
function countDocuments(filter = {}) { return Order.countDocuments(filter); }

module.exports = { create, findById, findOne, findMany, updateById, deleteById, findByCustomer, findByVendor, findByVendorAndStatus, updateStatus, findExpiredPendingOrders, countDocuments };