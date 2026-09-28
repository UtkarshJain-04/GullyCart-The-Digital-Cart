const { adminService } = require('../services');

async function create(request, response) {
  const complaint = await adminService.createComplaint(request.user.id, request.body);
  return response.status(201).json({ complaint });
}

module.exports = { create };