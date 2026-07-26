export const KOSMOS_STORE_ID = 'a99d6fdf-0970-11ed-0a80-0ed600075845';

export const DEFAULT_MIN_ORDER = 1000;

const MIN_ORDER_BY_STORE: Record<string, number> = {
  [KOSMOS_STORE_ID]: 2000,
};

export const getMinOrderAmount = (storeId?: string | null): number => {
  if (!storeId) return DEFAULT_MIN_ORDER;
  return MIN_ORDER_BY_STORE[storeId] ?? DEFAULT_MIN_ORDER;
};
