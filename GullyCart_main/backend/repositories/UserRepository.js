const User = require('../models/User');

function applyQueryOptions(query, options = {}) {
  if (options.populate) query = query.populate(options.populate);
  if (options.select) query = query.select(options.select);
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  return query;
}

function create(data) { return User.create(data); }
function findById(id, options = {}) { return applyQueryOptions(User.findById(id), options); }
function findOne(filter, options = {}) { return applyQueryOptions(User.findOne(filter), options); }
function findMany(filter = {}, options = {}) { return applyQueryOptions(User.find(filter), options); }
function updateById(id, updates, options = {}) {
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true, ...options });
}
function deleteById(id) { return User.findByIdAndDelete(id); }
function findByEmail(email) { return findOne({ email: email.toLowerCase() }, { select: '+passwordHash' }); }
function findByPhone(phone) { return findOne({ phone }, { select: '+passwordHash' }); }
function findByRole(role, options = {}) { return findMany({ role }, options); }
function countDocuments(filter = {}) { return User.countDocuments(filter); }

module.exports = { create, findById, findOne, findMany, updateById, deleteById, findByEmail, findByPhone, findByRole, countDocuments };