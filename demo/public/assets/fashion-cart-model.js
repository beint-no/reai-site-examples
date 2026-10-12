// Fixture-only variants. Real checkout must revalidate with the backend.
export function fashionStock(product, color, size) {
  if (!product?.colors.some((c) => c.key === color) || !product.sizes.includes(size)) return 'OUT_OF_STOCK';
  return product.backorder[color]?.includes(size) ? 'BACKORDER' : product.soldOut[color]?.includes(size) ? 'OUT_OF_STOCK' : 'AVAILABLE';
}
export function editFashionVariant(cart, index, product, color, size) {
  const line = cart[index];
  if (!line || line.handle !== product?.handle || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20 || fashionStock(product, color, size) === 'OUT_OF_STOCK') return null;
  const duplicate = cart.findIndex((x, i) => i !== index && x.handle === product.handle && x.color === color && x.size === size);
  if (duplicate >= 0 && cart[duplicate].quantity + line.quantity > 20) return null;
  return cart.flatMap((x, i) => {
    if (i === index) return duplicate >= 0 ? [] : [{ ...x, color, size }];
    return [{ ...x, quantity: i === duplicate ? x.quantity + line.quantity : x.quantity }];
  });
}
