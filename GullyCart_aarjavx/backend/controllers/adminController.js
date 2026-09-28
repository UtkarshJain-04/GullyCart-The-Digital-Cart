const { adminService } = require('../services');

async function dashboard(request, response) {
  return response.json({ dashboard: await adminService.getDashboard() });
}

async function vendorRequests(request, response) {
  return response.json({ vendors: await adminService.listVendorRequests(request.query.status) });
}

async function approveVendor(request, response) {
  return response.json({ vendor: await adminService.approveVendor(request.params.vendorId) });
}

async function rejectVendor(request, response) {
  return response.json({ vendor: await adminService.rejectVendor(request.params.vendorId, request.body.reason) });
}

async function suspendVendor(request, response) {
  return response.json({ vendor: await adminService.suspendVendor(request.params.vendorId, request.body.reason) });
}

async function restoreVendor(request, response) {
  return response.json({ vendor: await adminService.restoreVendor(request.params.vendorId) });
}

async function complaints(request, response) {
  return response.json({ complaints: await adminService.listComplaints(request.query.status) });
}

async function reviewComplaint(request, response) {
  const complaint = await adminService.reviewComplaint(
    request.params.complaintId,
    request.user.id,
    request.body.status,
    request.body.adminNote
  );
  return response.json({ complaint });
}

module.exports = { dashboard, vendorRequests, approveVendor, rejectVendor, suspendVendor, restoreVendor, complaints, reviewComplaint };