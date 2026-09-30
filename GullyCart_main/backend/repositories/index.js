const UserRepository = require('./UserRepository');
const VendorRepository = require('./VendorRepository');
const ProductRepository = require('./ProductRepository');
const OrderRepository = require('./OrderRepository');

module.exports = {
  userRepository: UserRepository,
  vendorRepository: VendorRepository,
  productRepository: ProductRepository,
  orderRepository: OrderRepository,
};