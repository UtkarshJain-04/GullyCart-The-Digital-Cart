const { productService } = require('../services');

async function create(request, response) {
  const product = await productService.createProduct({
    ...request.body,
    vendorId: request.params.vendorId,
  }, request.file?.buffer);
  return response.status(201).json({ product });
}

async function listByVendor(request, response) {
  const products = request.query.active === 'true'
    ? await productService.findActiveProducts(request.params.vendorId)
    : await productService.findProductsByVendor(request.params.vendorId);
  return response.json({ products });
}

async function update(request, response) {
  const product = await productService.updateProduct(request.params.productId, request.body, request.file?.buffer);
  return response.json({ product });
}

async function markSoldOut(request, response) {
  const product = await productService.markProductSoldOut(request.params.productId);
  return response.json({ product });
}

async function remove(request, response) {
  const product = await productService.removeProduct(request.params.productId);
  if (!product) return response.status(404).json({ message: 'Product not found.' });
  return response.status(204).send();
}

module.exports = { create, listByVendor, update, markSoldOut, remove };