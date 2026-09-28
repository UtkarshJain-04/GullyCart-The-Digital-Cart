const { productRepository, orderRepository } = require('../repositories');
const { normalizePoint } = require('../utils/geo');

const STATUS_TRANSITIONS = {
  pending: ['accepted', 'cancelled', 'expired'],
  accepted: ['ready', 'cancelled'],
  ready: ['collected', 'cancelled'],
  collected: [],
  cancelled: [],
  expired: [],
};

async function createOrder({ customerId, vendorId, items, pickupLocation, expiresAt }) {
  if (!customerId || !vendorId || !Array.isArray(items) || items.length === 0) {
    throw new Error('Customer, vendor, and at least one item are required.');
  }

  const orderItems = [];
  for (const item of items) {
    const product = await productRepository.findById(item.productId);
    if (!product || product.vendorId.toString() !== vendorId.toString() || product.status !== 'active') {
      throw new Error(`Product ${item.productId} is unavailable.`);
    }

    const quantity = Number(item.quantity);
    const availableQuantity = Number.parseFloat(product.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || (Number.isFinite(availableQuantity) && quantity > availableQuantity)) {
      throw new Error(`Invalid quantity for ${product.itemName}.`);
    }

    const amount = Math.round(quantity * product.price * 100) / 100;
    orderItems.push({
      productId: product._id,
      itemName: product.itemName,
      productDescription: product.description,
      quantity,
      unitPrice: product.price,
      unit: product.unit,
      amount,
    });
  }

  const totalAmount = orderItems.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );

  return orderRepository.create({
    customerId,
    vendorId,
    items: orderItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
    pickupLocation: normalizePoint(pickupLocation),
    expiresAt: expiresAt || new Date(Date.now() + 30 * 60 * 1000),
  });
}

async function updateOrderStatus(orderId, status) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  if (!STATUS_TRANSITIONS[order.status]?.includes(status)) {
    throw new Error(`Cannot change order status from ${order.status} to ${status}.`);
  }

  return orderRepository.updateStatus(orderId, status);
}

module.exports = {
  STATUS_TRANSITIONS,
  createOrder,
  updateOrderStatus,
  findCustomerOrders: (customerId, options) => orderRepository.findByCustomer(customerId, options),
  findVendorOrders: (vendorId, options) => orderRepository.findByVendor(vendorId, options),
};