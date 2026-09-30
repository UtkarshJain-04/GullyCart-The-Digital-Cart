const { orderService } = require('../services');

async function create(request, response) {
  const order = await orderService.createOrder({
    ...request.body,
    customerId: request.user.id,
  });
  return response.status(201).json({ order });
}

async function listCustomerOrders(request, response) {
  const orders = await orderService.findCustomerOrders(request.user.id);
  return response.json({ orders });
}

async function listVendorOrders(request, response) {
  const orders = await orderService.findVendorOrders(request.params.vendorId);
  return response.json({ orders });
}

async function updateStatus(request, response) {
  const order = await orderService.updateOrderStatus(request.params.orderId, request.body.status);
  return response.json({ order });
}

module.exports = { create, listCustomerOrders, listVendorOrders, updateStatus };