// Clean price - remove currency symbols and convert to number
export const cleanPrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  // Remove any non-numeric characters except decimal point and minus sign
  const cleaned = String(price).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};