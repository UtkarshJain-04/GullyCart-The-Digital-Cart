const { productRepository } = require('../repositories');
const { uploadProductImage, deleteProductImage } = require('./cloudinary');

async function createProduct({ vendorId, itemName, description, quantity, unit, price, procurementTime, status = 'active' }, imageBuffer) {
  if (!itemName?.trim() || quantity === undefined || quantity === null || !unit || price === undefined || price === null) {
    throw new Error('Item name, quantity, unit, and price are required.');
  }

  const image = imageBuffer ? await uploadProductImage(imageBuffer) : {};
  try {
    return await productRepository.create({ vendorId, itemName: itemName.trim(), description: description?.trim(), quantity: String(quantity).trim(), unit, price: Number(price), procurementTime, status, ...image });
  } catch (error) {
    if (image.imagePublicId) await deleteProductImage(image.imagePublicId);
    throw error;
  }
}

async function updateProduct(productId, updates, imageBuffer) {
  const existingProduct = await productRepository.findById(productId);
  if (!existingProduct) throw new Error('Product not found.');
  const productUpdates = { ...updates };
  if (productUpdates.itemName !== undefined) {
    productUpdates.itemName = productUpdates.itemName.trim();
  }
  if (productUpdates.quantity !== undefined) {
    productUpdates.quantity = String(productUpdates.quantity).trim();
  }
  if (productUpdates.description !== undefined) {
    productUpdates.description = productUpdates.description.trim();
  }
  if (productUpdates.price !== undefined) {
    productUpdates.price = Number(productUpdates.price);
  }
  const image = imageBuffer ? await uploadProductImage(imageBuffer) : {};
  Object.assign(productUpdates, image);

  try {
    const product = await productRepository.updateById(productId, productUpdates);
    if (image.imagePublicId && existingProduct.imagePublicId) await deleteProductImage(existingProduct.imagePublicId);
    return product;
  } catch (error) {
    if (image.imagePublicId) await deleteProductImage(image.imagePublicId);
    throw error;
  }
}

async function removeProduct(productId) {
  const product = await productRepository.deleteById(productId);
  if (product?.imagePublicId) await deleteProductImage(product.imagePublicId);
  return product;
}

async function markProductSoldOut(productId) {
  const product = await productRepository.updateStatus(productId, 'sold_out');
  if (!product) {
    throw new Error('Product not found.');
  }
  return product;
}

function getFreshnessLevel(procurementTime) {
  const ageHours = (Date.now() - new Date(procurementTime).getTime()) / 36e5;
  if (ageHours <= 6) return 'Very Fresh';
  if (ageHours <= 12) return 'Fresh';
  if (ageHours <= 24) return 'Same Day';
  return 'Older Stock';
}

module.exports = {
  createProduct,
  updateProduct,
  removeProduct,
  markProductSoldOut,
  getFreshnessLevel,
  findProductsByVendor: (vendorId, options) => productRepository.findByVendor(vendorId, options),
  findActiveProducts: (vendorId, options) => productRepository.findActiveByVendor(vendorId, options),
  findProductsByItemName: (itemName, options) => productRepository.findByItemName(itemName, options),
};