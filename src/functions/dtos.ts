import { ICategory, OrderItemType, OrderType, ProductType } from "../types";
import { fillIconForCategory } from ".";
import { SvgProps } from "react-native-svg";
import api from "../api";
import { getActivePromos } from "../constants";

type CategoryNode = ICategory & {
  icon: React.FC<SvgProps> | null;
  subCategory: CategoryNode[];
};

export function CategoryDTO(data: ICategory[]) {
  const pathMap = new Map<string, CategoryNode>();

  data.forEach((category) => {
    pathMap.set(category.name, {
      ...category,
      icon: fillIconForCategory(category.id) as any,
      subCategory: [],
    });
  });

  const tree: CategoryNode[] = [];

  pathMap.forEach((node) => {
    if (!node.pathName) {
      tree.push(node);
    } else {
      const parentName = node.pathName.split("/").slice(-1)[0];
      const parent = pathMap.get(parentName);

      if (parent) {
        parent.subCategory.push(node);
      } else {
        tree.push(node);
      }
    }
  });

  const sortFn = (a: CategoryNode, b: CategoryNode) => {
    const nameCompare = a.name.localeCompare(b.name, "ru");
    if (a.icon && !b.icon) return -1;
    if (!a.icon && b.icon) return 1;
    return nameCompare;
  };

  const sortTree = (nodes: CategoryNode[]): CategoryNode[] =>
    nodes.sort(sortFn).map((node) => ({
      ...node,
      subCategory: sortTree(node.subCategory),
    }));

  return sortTree(tree);
}

// ===================== ProductDTO =====================
type ProductDTOOptions = {
  stockByStore?: Record<string, Record<string, number>>;
  storePriority?: string[];
};

function extractIdFromHref(hrefOrId?: string | null): string | null {
  if (!hrefOrId) return null;

  const s0 = String(hrefOrId).trim();
  const s = s0.split("?")[0].split("#")[0];
  const parts = s.split("/");
  const last = parts[parts.length - 1];

  return last ? last : null;
}

function normalizeNumber(v: any): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function getPrice(product: any): number {
  const sale = product?.salePrices;
  if (Array.isArray(sale) && sale.length > 0) {
    const val = sale[0]?.value;
    return val ? normalizeNumber(val) / 100 : 0;
  }
  return 0;
}

const PROMO_ATTR_NAMES = ["акция", "акция дня", "промо", "промо-акция", "promo"]

function extractPromoName(product: any): string | undefined {
  const attrs = product?.attributes
  if (!Array.isArray(attrs)) return undefined

  for (const a of attrs) {
    const attrName = String(a?.name ?? "").trim().toLowerCase()
    if (!PROMO_ATTR_NAMES.includes(attrName)) continue

    const raw = a?.value
    if (raw == null) continue

    if (typeof raw === "boolean") {
      if (!raw) continue
      const todayPromo = getActivePromos()[0]
      return todayPromo?.name
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim()
      return trimmed || undefined
    }

    if (typeof raw === "object") {
      const named = String(raw?.name ?? "").trim()
      if (named) return named
    }
  }

  return undefined
}

function resolveAssortmentKeyCandidates(product: any): string[] {

  const candidates = [
    extractIdFromHref(product?.meta?.href),          // обычно это оно (assortment/variant/bundle id)
    product?.id,                                    // иногда совпадает
    extractIdFromHref(product?.assortment?.meta?.href),
    extractIdFromHref(product?.product?.meta?.href) // запасной вариант
  ]
    .filter(Boolean)
    .map(String);

  // уникализируем, чтобы не перебирать дубли
  return Array.from(new Set(candidates));
}

function pickStockFromStockMap(
  stockMapForItem: Record<string, number> | undefined,
  storePriority: string[]
): { stock: number; storeId?: string; stockByStore?: Record<string, number> } {
  if (!stockMapForItem) return { stock: 0, storeId: undefined, stockByStore: undefined };

  // 1) по приоритету
  for (const sid of storePriority) {
    const v = normalizeNumber(stockMapForItem[sid]);
    if (v > 0) return { stock: v, storeId: sid, stockByStore: stockMapForItem };
  }

  // 2) любой склад > 0
  for (const [sid, raw] of Object.entries(stockMapForItem)) {
    const v = normalizeNumber(raw);
    if (v > 0) return { stock: v, storeId: sid, stockByStore: stockMapForItem };
  }

  // 3) иначе 0, но stockByStore оставим (полезно для дебага/отображения)
  return { stock: 0, storeId: undefined, stockByStore: stockMapForItem };
}

export function ProductDTO(data: any, options?: ProductDTOOptions) {
  if (!Array.isArray(data)) return [];

  const stockByStore = options?.stockByStore || {};
  const storePriority =
    options?.storePriority && options.storePriority.length > 0
      ? options.storePriority
      : [];

  const formattedArray: ProductType[] = data
    .filter((product) => product && (product?.meta?.href || product?.id))
    .map((product: any): ProductType | null => {
      try {
        // id продукта в приложении (оставляем как у тебя — product.id, если есть)
        const productId: string =
          product?.id || extractIdFromHref(product?.meta?.href) || "";

        if (!productId) return null;

        const candidates = resolveAssortmentKeyCandidates(product);

        // ищем правильный ключ в stockByStore
        let usedKey: string | undefined;
        let stockMapForItem: Record<string, number> | undefined;

        for (const key of candidates) {
          const m = stockByStore[key];
          if (m) {
            usedKey = key;
            stockMapForItem = m;
            break;
          }
        }

        if (!stockMapForItem) {
          console.log(
            "NO stockMap for:",
            product?.name,
            "product.id:",
            productId,
            "triedKeys:",
            candidates,
            "available keys:",
            Object.keys(stockByStore).slice(0, 3)
          );
        }

        const picked = pickStockFromStockMap(stockMapForItem, storePriority);

        // fallback: если вдруг API уже вернул stock в продукте
        let fallbackStock = normalizeNumber(
          product?.stock ?? product?.quantity ?? product?.stockStore ?? 0
        );
        const promoName = extractPromoName(product)

        if (picked.stock === 0 && fallbackStock > 0) {
          // если по карте не нашли, но в продукте есть остаток
          // storeId возьмём первым приоритетным, если есть
          return {
            image: productId,
            price: getPrice(product),
            name: product?.name || "Без названия",
            id: productId,
            description: product?.description || "",
            pathName: product?.pathName || "",
            country: product?.country?.meta?.href || "",
            volume: product?.volume || 0,
            weight: product?.weight || 0,
            weighed: product?.weighed || false,
            stock: fallbackStock,
            stockByStore: stockMapForItem,
            storeId: storePriority[0],
            promoName,
          } as ProductType;
        }

        const formattedProduct = {
          image: productId,
          price: getPrice(product),
          name: product?.name || "Без названия",
          id: productId,
          description: product?.description || "",
          pathName: product?.pathName || "",
          country: product?.country?.meta?.href || "",
          volume: product?.volume || 0,
          weight: product?.weight || 0,
          weighed: product?.weighed || false,
          stock: picked.stock,
          stockByStore: picked.stockByStore,
          storeId: picked.storeId,
          promoName,
          // Если нужно дебажить совпадение ключей — раскомментируй и добавь в тип при желании:
          // _stockKey: usedKey,
          // _metaHref: product?.meta?.href,
        } as ProductType;

        return formattedProduct;
      } catch {
        return null;
      }
    })
    .filter((item: ProductType | null): item is ProductType => item !== null);

  return formattedArray;
}

// ===================== Orders DTO =====================
export function postitionsDTO(items: OrderItemType[]) {
  const deliveryServiceId = "bca82cda-cfaa-11ee-0a80-0d920004a1bb";

  const formattedArray = items.map((i) => ({
    quantity: i.amount,
    price: i.price * 100,
    assortment: {
      meta: {
        href: `https://api.moysklad.ru/api/remap/1.2/entity/${
          i.productId === deliveryServiceId ? "service" : "product"
        }/${i.productId}`,
        type: i.productId === deliveryServiceId ? "service" : "product",
        mediaType: "application/json",
      },
    },
  }));

  return formattedArray;
}

export async function ordersDTO(items: any[]): Promise<OrderType[]> {
  const formattedArray = await Promise.all(
    items.map(async (i): Promise<OrderType> => {
      const bonusMatch = i.description?.split(`"`)[1]?.split(" ")[0];
      const bonus = bonusMatch || 0;

      const deliveryAttr = i.attributes.find((item: any) => item.name === "Тип заказа");
      const deliveryType = deliveryAttr?.value?.name || "Не указан";

      const statusResponse = await api.order.getDataFromURL(i.state.meta.href);
      const status = statusResponse?.data?.name || "Неизвестный статус";

      const name = i.name.split("-")[1];

      return {
        bonus: bonus,
        created: i.created,
        deliveryType: deliveryType,
        id: i.id,
        name: name,
        positions: i.positions.meta.href,
        status: status,
        store: i.store.meta.href,
        sum: Number(i.sum) / 100,
      };
    })
  );

  return formattedArray;
}