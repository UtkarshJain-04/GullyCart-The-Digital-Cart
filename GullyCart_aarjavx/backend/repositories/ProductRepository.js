const Product = require('../models/Product');

function applyQueryOptions(query, options = {}) {
  if (options.populate) query = query.populate(options.populate);
  if (options.select) query = query.select(options.select);
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  return query;
}

function create(data) { return Product.create(data); }
function findById(id, options = {}) { return applyQueryOptions(Product.findById(id), options); }
function findOne(filter, options = {}) { return applyQueryOptions(Product.findOne(filter), options); }
function findMany(filter = {}, options = {}) { return applyQueryOptions(Product.find(filter), options); }
function updateById(id, updates, options = {}) {
  return Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true, ...options });
}
function deleteById(id) { return Product.findByIdAndDelete(id); }
function findByVendor(vendorId, options = {}) { return findMany({ vendorId }, options); }
function findActiveByVendor(vendorId, options = {}) { return findMany({ vendorId, status: 'active' }, options); }
function findByItemName(itemName, options = {}) { return findMany({ itemName: new RegExp(itemName.trim(), 'i') }, options); }
function findByStatus(status, options = {}) { return findMany({ status }, options); }
function updateStatus(productId, status) { return updateById(productId, { status }); }

module.exports = { create, findById, findOne, findMany, updateById, deleteById, findByVendor, findActiveByVendor, findByItemName, findByStatus, updateStatus };