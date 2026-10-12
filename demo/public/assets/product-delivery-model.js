import { decisionTotals } from './product-lab-model.js';

// Fictional teaching rules, never carrier quotes or live checkout inputs.
export const deliveryThreshold = 300;
export function productDelivery(lines, code = '', destination = 'oslo', method = 'shipping') {
  const amounts = decisionTotals(lines, code);
  const covered = ['oslo', 'mainland'].includes(destination);
  const pickupAvailable = destination === 'oslo';
  const selectedMethod = method === 'pickup' && pickupAvailable ? 'pickup' : 'shipping';
  const hasItems = amounts.subtotal > 0;
  const qualifies = hasItems && covered && amounts.total >= deliveryThreshold;
  const shipping = !hasItems ? 0 : !covered ? null : selectedMethod === 'pickup' || qualifies ? 0 : 49;
  return { ...amounts, merchandise: amounts.total, covered, pickupAvailable, selectedMethod,
    hasItems, qualifies, remaining: covered ? Math.max(0, Math.round((deliveryThreshold - amounts.total) * 100) / 100) : null,
    shipping, total: shipping === null ? null : Math.round((amounts.total + shipping) * 100) / 100 };
}
