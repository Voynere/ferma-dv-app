import axios from 'axios';

const WP_BASE = 'https://ferma-dv.ru';

export const registerDevice = async (data: {
  token: string;
  platform: string;
  phone?: string;
  user_id?: number;
  app_version?: string;
}) => {
  return axios.post(`${WP_BASE}/wp-json/ferma/v1/push/register`, data);
};

export const syncCart = async (data: {
  phone?: string;
  user_id?: number;
  items: Array<{
    productId: string;
    amount: number;
    weight?: number | null;
    price?: number;
    name?: string;
  }>;
}) => {
  return axios.post(`${WP_BASE}/wp-json/ferma/v1/push/cart-sync`, data);
};