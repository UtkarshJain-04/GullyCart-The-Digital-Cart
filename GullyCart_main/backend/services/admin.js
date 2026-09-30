const { userRepository, vendorRepository, orderRepository } = require('../repositories');
const complaintRepository = require('../repositories/ComplaintRepository');

async function getDashboard() {
  const [pendingVendors, approvedVendors, suspendedVendors, openComplaints, users, orders] = await Promise.all([
    vendorRepository.countDocuments({ verificationStatus: 'pending' }),
    vendorRepository.countDocuments({ verificationStatus: 'approved' }),
    vendorRepository.countDocuments({ verificationStatus: 'suspended' }),
    complaintRepository.countDocuments({ status: { $in: ['open', 'reviewing'] } }),
    userRepository.countDocuments(),
    orderRepository.countDocuments(),
  ]);

  return { pendingVendors, approvedVendors, suspendedVendors, openComplaints, users, orders };
}

function listVendorRequests(status = 'pending') {
  return vendorRepository.findMany({ verificationStatus: status }, { populate: 'userId', sort: { createdAt: -1 } });
}

function approveVendor(vendorId) {
  return vendorRepository.updateById(vendorId, {
    verificationStatus: 'approved',
    suspensionReason: undefined,
    suspendedAt: undefined,
  });
}

function rejectVendor(vendorId, reason) {
  return vendorRepository.updateById(vendorId, {
    verificationStatus: 'rejected',
    isActive: false,
    suspensionReason: reason,
  });
}

async function suspendVendor(vendorId, reason) {
  if (!reason?.trim()) throw new Error('A suspension reason is required.');
  return vendorRepository.updateById(vendorId, {
    verificationStatus: 'suspended',
    isActive: false,
    suspensionReason: reason.trim(),
    suspendedAt: new Date(),
  });
}

function restoreVendor(vendorId) {
  return vendorRepository.updateById(vendorId, {
    verificationStatus: 'approved',
    suspensionReason: undefined,
    suspendedAt: undefined,
  });
}

function listComplaints(status) {
  return complaintRepository.findMany(status ? { status } : {}, {
    populate: 'reporterId vendorId orderId',
    sort: { createdAt: -1 },
  });
}

async function createComplaint(reporterId, data) {
  if (!data.vendorId || !data.reason || !data.description) {
    throw new Error('Vendor, reason, and description are required.');
  }
  return complaintRepository.create({ ...data, reporterId });
}

async function reviewComplaint(complaintId, adminId, status, adminNote) {
  if (!['reviewing', 'resolved', 'dismissed'].includes(status)) {
    throw new Error('Invalid complaint status.');
  }
  const complaint = await complaintRepository.updateById(complaintId, {
    status,
    adminNote,
    reviewedBy: adminId,
    reviewedAt: new Date(),
  });
  if (!complaint) throw new Error('Complaint not found.');
  return complaint;
}

module.exports = {
  getDashboard,
  listVendorRequests,
  approveVendor,
  rejectVendor,
  suspendVendor,
  restoreVendor,
  listComplaints,
  createComplaint,
  reviewComplaint,
};