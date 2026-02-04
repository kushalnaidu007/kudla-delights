import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return stripeClient;
};
