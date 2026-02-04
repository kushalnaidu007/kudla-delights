export const formatCurrency = (valuePence: number, currency = 'GBP') => {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  });
  return formatter.format(valuePence / 100);
};
