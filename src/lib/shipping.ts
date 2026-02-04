export const SHIPPING_CONFIG = {
  flatRatePence: 499,
  freeShippingThresholdPence: 4000,
  currency: 'GBP',
} as const;

export const calculateShippingPence = (subtotalPence: number) => {
  if (subtotalPence >= SHIPPING_CONFIG.freeShippingThresholdPence) return 0;
  return SHIPPING_CONFIG.flatRatePence;
};
