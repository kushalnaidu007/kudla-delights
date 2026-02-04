export type CartItem = {
  productId: string;
  name: string;
  pricePence: number;
  quantity: number;
  imageUrl?: string | null;
};

export type CartState = {
  items: CartItem[];
};

export const CART_STORAGE_KEY = 'kudla_cart';

export const mapServerItems = (items: Array<{ productId: string; name: string; pricePence: number; quantity: number }>) =>
  items.map((item) => ({
    productId: item.productId,
    name: item.name,
    pricePence: item.pricePence,
    quantity: item.quantity,
  }));
