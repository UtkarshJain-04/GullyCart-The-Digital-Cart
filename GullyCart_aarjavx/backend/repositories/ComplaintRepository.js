const Complaint = require('../models/Complaint');

function applyQueryOptions(query, options = {}) {
  if (options.populate) query = query.populate(options.populate);
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  return query;
}

function create(data) { return Complaint.create(data); }
function findById(id, options = {}) { return applyQueryOptions(Complaint.findById(id), options); }
function findMany(filter = {}, options = {}) { return applyQueryOptions(Complaint.find(filter), options); }
function countDocuments(filter = {}) { return Complaint.countDocuments(filter); }
function updateById(id, updates) { return Complaint.findByIdAndUpdate(id, updates, { new: true, runValidators: true }); }

module.exports = { create, findById, findMany, countDocuments, updateById };