// api/catalog/index.ts
import "react-native-get-random-values";
import axios, { AxiosError } from "axios";

import { CategoryDTO, ProductDTO } from "../../functions/dtos";
import useCatalogStore from "../../store/catalog";
import { getCDNImageUrl } from "../../config/cdnMapping";
import { ProductType } from "../../types";
import { getDefaultStoreQueue } from "../../utils/storePriority";
import { getActionsForArticles, KilbilActionsResult } from "./bonus";
import { KILBIL_ACTION_STICKERS, DEFAULT_KILBIL_STICKER } from "../../constants";
import { MOYSKLAD_TOKEN } from "../../config/secrets";

export { MOYSKLAD_TOKEN };
const AUTH = { Authorization: `Bearer ${MOYSKLAD_TOKEN}` };

const MS_BASE = "https://api.moysklad.ru/api/remap/1.2";

const WP_BASE = "https://ferma-dv.ru";
const WP_STOCKS_BY_SKUS_URL = `${WP_BASE}/wp-json/ferma/v1/stocks-by-skus`;

// ---------- types ----------
type WPStockResp = {
  product_id: number;
  sku: string; // на сервере может быть пусто, но мы используем ключом именно то, что запросили
  manage_stock: boolean;
  stock_total: number;
  stores: { id: string; name: string; stock: number }[];
};

// ---------- helpers ----------
function hasImage(productId: string): boolean {
  return getCDNImageUrl(productId, 0) !== "";
}

function sortProductsByImageAvailabilityList(items: ProductType[]): ProductType[] {
  const withImages = items.filter((i) => hasImage(i.id));
  const withoutImages = items.filter((i) => !hasImage(i.id));
  return [...withImages, ...withoutImages];
}

function extractIdFromHref(hrefOrId?: string | null): string | null {
  if (!hrefOrId) return null;
  const s0 = String(hrefOrId).trim();
  const s = s0.split("?")[0].split("#")[0];
  const parts = s.split("/");
  const last = parts[parts.length - 1];
  return last ? last : null;
}

function normalizeStockValue(v: any): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function splitProductsByAvailability(products: ProductType[]) {
  const inStock = products.filter((p) => {
    if (p.stockByStore) {
      return Object.values(p.stockByStore).some(qty => qty > 0);
    }
    return false;
  });
  const outOfStock = products.filter((p) => {
    if (p.stockByStore) {
      return !Object.values(p.stockByStore).some(qty => qty > 0);
    }
    return true;
  });
  return { inStock, outOfStock };
}

function axiosErrorInfo(e: unknown) {
  const err = e as AxiosError<any>;
  return {
    message: err?.message,
    status: err?.response?.status,
    data: err?.response?.data,
    url: err?.config?.url,
    method: err?.config?.method,
    params: err?.config?.params,
  };
}

/**
 * Достаём "sku" для WP.
 *
 * Важно: в твоём случае "525264 — это sku".
 * Часто такие значения живут в МойСклад как externalCode (или code/article).
 * Поэтому делаем расширенный fallback.
 */
function extractSkuFromRow(r: any): string | null {
  const fromAttrs =
    Array.isArray(r?.attributes)
      ? r.attributes.find((a: any) =>
          String(a?.name ?? "").toLowerCase().includes("sku") ||
          String(a?.name ?? "").toLowerCase().includes("артикул")
        )?.value
      : null;

  const raw =
    r?.article ??
    r?.code ??
    r?.sku ??
    r?.externalCode ??
    fromAttrs ??
    null;

  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  return s.length ? s : null;
}

// ---------- WP stocks batching + small cache ----------
type StockMapBySku = Record<string, { total: number; byStore: Record<string, number> }>;

// кэш на время работы приложения (чтобы не долбить WP повторно при возвратах на экран)
const wpSkuCache = new Map<string, { total: number; byStore: Record<string, number> }>();

async function fetchWpStockMapBySkus(
  skus: string[],
  opts?: { batchSize?: number; debug?: boolean; timeoutMs?: number }
): Promise<StockMapBySku> {
  const batchSize = Math.max(opts?.batchSize ?? 400, 1);
  const debug = !!opts?.debug;
  const timeout = Math.max(opts?.timeoutMs ?? 20000, 1);

  const uniq = [...new Set(skus.filter(Boolean))];

  const result: StockMapBySku = {};

  // 1) сразу отдаём из кэша
  const toFetch: string[] = [];
  for (const sku of uniq) {
    const cached = wpSkuCache.get(sku);
    if (cached) {
      result[sku] = cached;
    } else {
      toFetch.push(sku);
    }
  }

  // 2) батчами дотягиваем остальное
  for (let i = 0; i < toFetch.length; i += batchSize) {
    const batch = toFetch.slice(i, i + batchSize);

    try {
      const resp = await axios.get<any>(WP_STOCKS_BY_SKUS_URL, {
        params: { skus: batch.join(",") },
        timeout,
      });

      const dataAny: any = resp.data;
      const map: Record<string, WPStockResp> =
      dataAny && !Array.isArray(dataAny) ? dataAny : {};

      for (const requestedSku of batch) {
        const data = map[requestedSku];
        if (!data) continue;

        const byStore: Record<string, number> = {};
        for (const s of data.stores || []) byStore[s.id] = normalizeStockValue(s.stock);

        const packed = {
          total: normalizeStockValue(data.stock_total),
          byStore,
        };

        result[requestedSku] = packed;
        wpSkuCache.set(requestedSku, packed);
      }
    } catch (e) {
      if (debug) console.log("[wp/stocks-by-skus] ERROR", axiosErrorInfo(e));
      // если батч упал — просто пропускаем (внизу всё равно проставим нули)
    }
  }

  return result;
}

/**
 * Формируем stockByStore для ProductDTO.
 *
 * Ключевая идея:
 * 1) Даже если по sku нет данных — кладём НУЛИ, чтобы DTO/UI не подхватывали stock из МойСклад.
 * 2) Кладём по нескольким возможным ключам (assortment/product/variant), чтобы совпало с тем,
 *    что реально использует ProductDTO внутри.
 */
function buildStockByStoreForDTO(
  rows: any[],
  wpStockBySku: StockMapBySku,
  storePriority: string[]
): Record<string, Record<string, number>> {
  const stockByStore: Record<string, Record<string, number>> = {};

  const mkMap = (s?: { byStore: Record<string, number> }) => {
    const map: Record<string, number> = {};
    for (const storeId of storePriority) {
      map[storeId] = Math.max(0, normalizeStockValue(s?.byStore?.[storeId] ?? 0));
    }
    return map;
  };

  for (const r of rows) {
    const sku = extractSkuFromRow(r);
    const s = sku ? wpStockBySku[sku] : undefined;

    // даже если sku нет/не найден — нули
    const map = mkMap(s);

    const keys = new Set<string>();

    const k1 = extractIdFromHref(r?.meta?.href) || r?.id;
    if (k1) keys.add(k1);

    const k2 = extractIdFromHref(r?.assortment?.meta?.href);
    if (k2) keys.add(k2);

    const k3 = extractIdFromHref(r?.product?.meta?.href);
    if (k3) keys.add(k3);

    const k4 = extractIdFromHref(r?.variant?.meta?.href);
    if (k4) keys.add(k4);

    if (typeof r?.product?.id === "string") keys.add(r.product.id);
    if (typeof r?.variant?.id === "string") keys.add(r.variant.id);
    if (typeof r?.id === "string") keys.add(r.id);

    for (const key of keys) stockByStore[key] = map;
  }

  return stockByStore;
}

/**
 * ВАЖНО:
 * ProductDTO может оставлять p.stock из МойСклад.
 * Мы принудительно делаем p.stock = остаток выбранного склада (первый в очереди).
 * Тогда:
 * - кнопка "В корзину" не будет активна при 0
 * - степпер не даст добавлять больше, чем реально доступно в выбранном магазине
 */
function forceStockFromStockByStore(products: ProductType[], storePriority: string[]): ProductType[] {
  const storeId = storePriority[0];

  return products.map((p: any) => {
    const byStore =
      (p?.stockByStore ?? p?.stocksByStore ?? p?.stock_by_store ?? {}) as Record<string, number>;

    const qty = Math.max(0, normalizeStockValue(byStore?.[storeId] ?? 0));
    return { ...p, stock: qty, stockByStore: byStore };
  });
}
// -------------------- Kilbil helpers --------------------
function buildKilbilPromoMap(
    rows: any[],
    kilbilResult: KilbilActionsResult
): Record<string, ProductType['kilbilPromo']> {
    const articleToPromo: Record<string, ProductType['kilbilPromo']> = {}
    for (const [article, actionRefs] of Object.entries(kilbilResult.goods || {})) {
        if (!actionRefs.length) continue
        const actionId = actionRefs[0].action
        const action = kilbilResult.actions?.find(a => a.id === actionId)
        if (!action) continue
        const respond = action.responds?.[0]
        const discountPercent = respond?.unit_type === '%' ? respond.value : undefined
        const sticker = KILBIL_ACTION_STICKERS[actionId] ?? DEFAULT_KILBIL_STICKER
        articleToPromo[article] = { id: actionId, name: action.action, discountPercent, ...sticker }
    }

    const productIdToPromo: Record<string, ProductType['kilbilPromo']> = {}
    for (const r of rows) {
        const sku = extractSkuFromRow(r)
        const id = extractIdFromHref(r?.meta?.href) || r?.id
        if (sku && id && articleToPromo[sku]) {
            productIdToPromo[id] = articleToPromo[sku]
        }
    }
    return productIdToPromo
}

function attachKilbilPromo(products: ProductType[], promoMap: Record<string, ProductType['kilbilPromo']>): ProductType[] {
    return products.map(p => {
        const kilbilPromo = promoMap[p.id]
        return kilbilPromo ? { ...p, kilbilPromo } : p
    })
}

// -------------------- API --------------------
export async function getProducts(offset: number, category: string, storeQueue?: string[]) {
  try {
    const { changeIsPagination } = useCatalogStore.getState();

    const productFolderHref = `${MS_BASE}/entity/productfolder/${category}`;
    const assortmentUrl = `${MS_BASE}/entity/assortment?filter=productFolder=${productFolderHref}&limit=1000&expand=attributes`;

    changeIsPagination(false, 0);

    const priority = storeQueue && storeQueue.length ? storeQueue : getDefaultStoreQueue();
    console.log('priority:', priority)

    // 1) ассортимент папки (МойСклад)
    const assortmentResponse = await axios.get(assortmentUrl, { headers: AUTH });
    const rows = assortmentResponse.data?.rows?.filter(Boolean) || [];

    // 2) собрать SKU
    const skus: string[] = [];
    for (const r of rows) {
      const sku = extractSkuFromRow(r);
      if (sku) skus.push(sku);
    }
    if (rows.length > 0) {
      const r0 = rows[0]
      console.log('[getProducts] first row: article=%s code=%s sku=%s externalCode=%s name=%s',
        r0.article, r0.code, r0.sku, r0.externalCode, r0.name)
    }
    console.log('[getProducts] total skus:', skus.length, 'sample:', skus.slice(0, 5))

    // 3) параллельно: остатки WP + акции Килбил
    const [wpStockMap, kilbilResult] = await Promise.all([
      fetchWpStockMapBySkus(skus, { batchSize: 400, timeoutMs: 20000 }),
      getActionsForArticles(skus).catch(() => ({ goods: {}, actions: [] } as KilbilActionsResult)),
    ]);

    // 4) stockByStore
    const stockByStore = buildStockByStoreForDTO(rows, wpStockMap, priority);

    // 5) DTO + stock + kilbilPromo
    const productsRaw = ProductDTO(rows, { stockByStore, storePriority: priority });
    const productsFixed = forceStockFromStockByStore(productsRaw, priority);
    const promoMap = buildKilbilPromoMap(rows, kilbilResult);
    const products = attachKilbilPromo(productsFixed, promoMap);

    const { inStock, outOfStock } = splitProductsByAvailability(products);
    const sorted = [
      ...sortProductsByImageAvailabilityList(inStock),
      ...sortProductsByImageAvailabilityList(outOfStock),
    ];
    if (sorted.length > 20) changeIsPagination(true, sorted.length);
    return sorted.slice(offset, offset + 20);
  } catch {
    return [];
  }
}

export async function getCategories() {
  const resp = await axios.get(`${MS_BASE}/entity/productfolder?expand=path`, { headers: AUTH });
  return CategoryDTO(resp.data.rows);
}

export function getImage(productId: string, index: number = 0): string {
  return getCDNImageUrl(productId, index);
}

export async function searchProduct(name: string, storeQueue?: string[]) {
  try {
    const url = `${MS_BASE}/entity/assortment?filter=name~${encodeURIComponent(
      name
    )}&limit=100&expand=attributes`;

    const resp = await axios.get(url, { headers: AUTH });
    const rows = resp.data?.rows?.filter(Boolean) || [];

    const priority = storeQueue && storeQueue.length ? storeQueue : getDefaultStoreQueue();

    const skus: string[] = [];
    for (const r of rows) {
      const sku = extractSkuFromRow(r);
      if (sku) skus.push(sku);
    }

    const wpStockMap = await fetchWpStockMapBySkus(skus, { batchSize: 400, timeoutMs: 20000 });
    const stockByStore = buildStockByStoreForDTO(rows, wpStockMap, priority);

    const productsRaw = ProductDTO(rows, { stockByStore, storePriority: priority });
    const products = forceStockFromStockByStore(productsRaw, priority);

    const { inStock } = splitProductsByAvailability(products);
    return sortProductsByImageAvailabilityList(inStock);
  } catch {
    return [];
  }
}

export async function getProduct(id: string, storeQueue?: string[]) {
  const priority = storeQueue && storeQueue.length ? storeQueue : getDefaultStoreQueue();

  try {
    const resp = await axios.get(`${MS_BASE}/entity/assortment/${id}?expand=attributes`, {
      headers: AUTH,
    });

    const row = resp.data;
    const sku = extractSkuFromRow(row);

    const wpStockMap = sku
      ? await fetchWpStockMapBySkus([sku], { batchSize: 1, timeoutMs: 20000 })
      : {};

    const stockByStore = buildStockByStoreForDTO([row], wpStockMap, priority);

    const productsRaw = ProductDTO([row], { stockByStore, storePriority: priority });
    const products = forceStockFromStockByStore(productsRaw, priority);

    return products[0];
  } catch {
      const direct = await axios.get(`${MS_BASE}/entity/product/${id}?expand=attributes`, {
        headers: AUTH,
      });

      const row = direct.data;
      const sku = extractSkuFromRow(row);

      const wpStockMap = sku
        ? await fetchWpStockMapBySkus([sku], { batchSize: 1, timeoutMs: 20000 })
        : {};

      const stockByStore = buildStockByStoreForDTO([row], wpStockMap, priority);

      const productsRaw = ProductDTO([row], { stockByStore, storePriority: priority });
      const products = forceStockFromStockByStore(productsRaw, priority);

      return products[0];
    }
}
const GREEN_PRICES_ATTRIBUTE_ID = "762d57da-1191-11ee-0a80-043600051b3e";

// Источник акций Kilbil — actions.json, который раз в час формирует сервис на РФ-VPS
// (MoySklad → Эвотор UUID → Kilbil processsale). См. site-endpoint/kilbil-actions.js.
const KILBIL_ACTIONS_URL = "http://77.222.47.128:8474/actions.json";
const GREEN_PRICE_ACTION = "Зеленые ценники";

/** Тянет товары акции из actions.json: Map артикул → процент скидки. */
async function fetchKilbilActionArticles(actionName: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const r = await axios.get<any>(KILBIL_ACTIONS_URL, { timeout: 10000 });
    const items: any[] = Array.isArray(r.data?.items) ? r.data.items : [];
    for (const it of items) {
      if (it?.action === actionName && it?.article) {
        map.set(String(it.article).trim(), Number(it.value) || 0);
      }
    }
  } catch (e: any) {
    console.log('[kilbilActions] fetch error:', e?.message);
  }
  return map;
}

/** Товары ассортимента MoySklad по списку артикулов (батчами, фильтр article=…;…=OR). */
async function fetchAssortmentByArticles(articles: string[]): Promise<any[]> {
  const rows: any[] = [];
  const BATCH = 100;
  for (let i = 0; i < articles.length; i += BATCH) {
    const batch = articles.slice(i, i + BATCH);
    const filter = batch.map((a) => `article=${a}`).join(';');
    try {
      const resp = await axios.get<any>(
        `${MS_BASE}/entity/assortment?filter=${encodeURIComponent(filter)}&limit=1000`,
        { headers: AUTH }
      );
      rows.push(...(resp.data?.rows?.filter(Boolean) || []));
    } catch (e: any) {
      console.log('[greenPrice] assortment batch error:', e?.message);
    }
  }
  return rows;
}

// Идентификаторы экранов акций → имя акции в actions.json.
// GREEN_PRICES_ATTRIBUTE_ID оставлен как ID экрана «Зелёные ценники» (исторический).
export const KILBIL_MEAT_SUNDAY_ID = "kilbil-meat-sunday";
export const KILBIL_SAUSAGE_TUESDAY_ID = "kilbil-sausage-tuesday";
const ACTION_BY_SCREEN_ID: Record<string, string> = {
  [GREEN_PRICES_ATTRIBUTE_ID]: GREEN_PRICE_ACTION,      // "Зеленые ценники"
  [KILBIL_MEAT_SUNDAY_ID]: "Мясное воскресенье",
  [KILBIL_SAUSAGE_TUESDAY_ID]: "Колбасный вторник",
};

async function getActionProducts(actionName: string, priority: string[]): Promise<ProductType[]> {
  const articles = await fetchKilbilActionArticles(actionName);
  if (articles.size === 0) return [];

  const rows = await fetchAssortmentByArticles([...articles.keys()]);
  if (rows.length === 0) return [];

  // MoySklad id товара → процент скидки из actions.json
  const idToPct: Record<string, number> = {};
  for (const r of rows) {
    const art = r?.article ? String(r.article).trim() : '';
    const pct = art ? articles.get(art) : undefined;
    if (pct && r?.id) idToPct[r.id] = pct;
  }

  const skus = rows.map((r: any) => extractSkuFromRow(r)).filter(Boolean) as string[];
  const [wpStockMap, kilbilResult] = await Promise.all([
    fetchWpStockMapBySkus(skus, { batchSize: 400, timeoutMs: 20000 }),
    getActionsForArticles(skus).catch(() => ({ goods: {}, actions: [] } as KilbilActionsResult)),
  ]);
  const stockByStore = buildStockByStoreForDTO(rows, wpStockMap, priority);
  const productsRaw = ProductDTO(rows, { stockByStore, storePriority: priority });
  const productsFixed = forceStockFromStockByStore(productsRaw, priority);
  const promoMap = buildKilbilPromoMap(rows, kilbilResult);
  // isGreenPrice=true → UI рисует перечёркнутую цену; actionDiscountPercent → бейдж -N% и расчёт скидки.
  const products = attachKilbilPromo(productsFixed, promoMap).map(p => ({
    ...p,
    isGreenPrice: true,
    actionName,
    actionDiscountPercent: idToPct[p.id],
  }));

  const { inStock, outOfStock } = splitProductsByAvailability(products);
  return [
    ...sortProductsByImageAvailabilityList(inStock),
    ...sortProductsByImageAvailabilityList(outOfStock),
  ];
}

export async function getProductFromAtributes(id: string, storeQueue?: string[]) {
  const priority = storeQueue && storeQueue.length ? storeQueue : getDefaultStoreQueue();

  const actionName = ACTION_BY_SCREEN_ID[id];
  if (actionName) {
    try {
      return await getActionProducts(actionName, priority);
    } catch (e: any) {
      console.log('[kilbilAction] ERROR for', actionName, ':', e?.message, e?.response?.status);
      return [];
    }
  }

  try {
    const url = `${MS_BASE}/entity/assortment?filter=${MS_BASE}/entity/product/metadata/attributes/${id}=true&expand=attributes&limit=1000`;
    const response = await axios.get(url, { headers: AUTH });
    const rows = response.data?.rows?.filter(Boolean) || [];

    const skus: string[] = [];
    for (const r of rows) {
      const sku = extractSkuFromRow(r);
      if (sku) skus.push(sku);
    }

    const [wpStockMap, kilbilResult] = await Promise.all([
      fetchWpStockMapBySkus(skus, { batchSize: 400, timeoutMs: 20000 }),
      getActionsForArticles(skus).catch(() => ({ goods: {}, actions: [] } as KilbilActionsResult)),
    ]);

    const stockByStore = buildStockByStoreForDTO(rows, wpStockMap, priority);
    const productsRaw = ProductDTO(rows, { stockByStore, storePriority: priority });
    const productsFixed = forceStockFromStockByStore(productsRaw, priority);
    const promoMap = buildKilbilPromoMap(rows, kilbilResult);
    const products = attachKilbilPromo(productsFixed, promoMap);

    const { inStock, outOfStock } = splitProductsByAvailability(products);
    return [
      ...sortProductsByImageAvailabilityList(inStock),
      ...sortProductsByImageAvailabilityList(outOfStock),
    ];
  } catch {
    return [];
  }
}

