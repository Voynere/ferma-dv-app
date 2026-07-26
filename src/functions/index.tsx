import CtalogIcons from "../assets/svg/catalog";
import { orderConstants, slotsList, weightedList } from "../constants";
import "react-native-get-random-values";
import * as turf from "@turf/turf";
import zoneData from "../constants/geojson.json";
import { deliveryDataObj } from "../constants/delivery";
import { postitionsDTO } from "./dtos";
import { IOrder, SlotType } from "../types";

export function formatPrice(price: number): string {
  return price.toFixed(2).replace(/\.00$/, "");
}

export function generateCode(length = 4) {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
}

export function normalizePhoneNumber(input: string): string {
  return input.replace(/\D/g, "").replace(/^8/, "7").replace(/^7?/, "7");
}

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
};

export function fillIconForCategory(id: string) {
  switch (id) {
    case "762d57da-1191-11ee-0a80-043600051b3e":
      return <CtalogIcons.Discount />;

    case "36470fc3-6225-11ec-0a80-069f0004f61c":
      return <CtalogIcons.Tea />;
    case "555ff02d-eeb6-11eb-0a80-05240007b3e0":
      return <CtalogIcons.Eggs />;
    case "57cfcab4-622b-11ec-0a80-00c400062ea7":
      return <CtalogIcons.Bread />;
    case "70464031-8ac6-11eb-0a80-07610022336d":
      return <CtalogIcons.Honey />;
    case "710be1b1-9283-11eb-0a80-080500020eea":
      return <CtalogIcons.Jam />;
    case "7b1f0bed-6226-11ec-0a80-069f00051ff1":
      return <CtalogIcons.Canning />;
    case "9a16bb8a-b7f9-11ed-0a80-073500036911":
      return <CtalogIcons.ReadyEat />;
    case "bd0f8fce-61e8-11ec-0a80-02aa00030ab6":
      return <CtalogIcons.Sausage />;
    case "e395744c-d3e7-11ea-0a80-09fa0067dd95":
      return <CtalogIcons.Milk />;
    case "e3da0fd5-d3e7-11ea-0a80-09fa0067de07":
      return <CtalogIcons.Vegetables />;
    case "e3fe816c-d3e7-11ea-0a80-09fa0067de48":
      return <CtalogIcons.Fish />;
    case "e46baf13-d3e7-11ea-0a80-09fa0067df0e":
      return <CtalogIcons.Meat />;
    case "e4811803-d3e7-11ea-0a80-09fa0067df38":
      return <CtalogIcons.Cheese />;
    case "e49d43fa-d3e7-11ea-0a80-09fa0067df6d":
      return <CtalogIcons.SemiFinished />;
    case "f21df40d-fba7-11ea-0a80-02c5001e1090":
      return <CtalogIcons.Grocery />;
    case "9310164a-bb48-11ee-0a80-11a90005919e":
      return <CtalogIcons.Suppliments />;
    case "2db1439e-de19-11ef-0a80-0cb40007a651":
      return <CtalogIcons.Snacks />;
    case "21d58cf2-660b-11ec-0a80-05b70069c7ab":
      return <CtalogIcons.Cetificate />;
    case "bf9ef63c-dabf-11ef-0a80-0d2f0013c530":
      return <CtalogIcons.ForBeauty />;
    case "d1ae86d6-a342-11eb-0a80-04620006c3d5":
      return <CtalogIcons.StewedMeats />;
    case "4054d32a-b802-11ed-0a80-03260004ff0b":
      return <CtalogIcons.Cake />;
    case "c5617139-32c4-11ef-0a80-139000070727":
      return <CtalogIcons.ForHome />;
    default:
      return null;
  }
}

export function formatDate(value: string | Date, returnString?: boolean) {
  if (returnString && typeof value === "object") {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${day}.${month}.${year}`;
  }

  const splitedValue = String(value).split(".");
  if (splitedValue.length !== 3) return new Date();

  return new Date(`${splitedValue[2]}-${splitedValue[1]}-${splitedValue[0]}`);
}

export function fillWeighed(isWeighted: boolean, path: string) {
  const normalizedPath = path.toLowerCase();

  for (const category of weightedList) {
    const categoryName = category.name.toLowerCase();

    if (normalizedPath.includes(categoryName)) {
      if (category.array) {
        for (const sub of category.array) {
          const subName = sub.name.toLowerCase();
          if (normalizedPath.includes(subName)) {
            return sub.weight === 1
              ? { sign: "кг", weight: 1 }
              : { sign: "г", weight: sub.weight };
          }
        }
      }

      if (category.weight) {
        return category.weight === 1
          ? { sign: "кг", weight: 1 }
          : { sign: "г", weight: category.weight };
      }
    }
  }

  return { sign: "шт", weight: null };
}

type NamedSlot = {
  time: string;
  name: string;
  order: { from: number; to: number; price: number }[];
};

function isNamedSlot(slot: any): slot is NamedSlot {
  return "time" in slot && "name" in slot && "order" in slot;
}

export function calculateDeliveryPrice(
  totalPrice: number,
  zoneName: string,
  express?: boolean,
  selectedSlotTime?: string
): number {
  const zone = deliveryDataObj.zones.find((z) => z.zone.name === zoneName);
  if (!zone) {
    throw new Error("Зона не найдена");
  }

  if (express) {
    return zone.express;
  }

  const slots = zone.slots;

  if (!slots || slots.length === 0) {
    throw new Error("No delivery slots available for this zone");
  }

  if (isNamedSlot(slots[0])) {
    const namedSlots = slots as NamedSlot[];

    let selectedSlot: NamedSlot | undefined;

    if (selectedSlotTime) {
      selectedSlot = namedSlots.find((slot) => slot.time === selectedSlotTime);
    }

    if (!selectedSlot) {
      const now = new Date();
      const vladHours = (now.getUTCHours() + 10 + 24) % 24;
      const currentMinutes = vladHours * 60 + now.getUTCMinutes();

      const timeToMinutes = (timeRange: string) => {
        const [start] = timeRange.split(" - ");
        const [hours, minutes] = start.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const sortedSlots = namedSlots
        .slice()
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

      selectedSlot =
        sortedSlots.find((slot) => timeToMinutes(slot.time) > currentMinutes) ||
        sortedSlots[0];
    }

    const priceBracket = selectedSlot.order.find(
      (bracket) => totalPrice >= bracket.from && totalPrice <= bracket.to
    );

    return priceBracket?.price ?? 0;
  }

  const priceBracket: any = slots.find(
    (slot: any) => totalPrice >= slot.from && totalPrice <= slot.to
  );

  return priceBracket?.price ?? 0;
}

export const getZoneForLocation = (latitude: number, longitude: number) => {
  const point = turf.point([longitude, latitude]);

  for (const feature of zoneData.features) {
    const polygon = feature.geometry;
    if (turf.booleanPointInPolygon(point, polygon as any)) {
      return feature.properties;
    }
  }

  return null;
};

export function orderPayload(data: IOrder) {
  const organization = orderConstants.organization;

  const agent = {
    meta: {
      ...orderConstants.agent.meta,
      href: `https://api.moysklad.ru/api/remap/1.2/entity/counterparty/${data.customerId}`,
    },
  };

  const attributes =
    data.delivery.type === 0
      ? [
          {
            meta: {
              ...orderConstants.attributes.orderType.meta,
            },
            value: {
              meta: {
                ...orderConstants.attributes.orderType.valueMeta,
                href: "https://api.moysklad.ru/api/remap/1.2/entity/customentity/8864b5ac-9806-11ee-0a80-11fb003800a6/7d785dc9-9807-11ee-0a80-0cca0036d646",
              },
            },
          },
          {
            meta: {
              ...orderConstants.attributes.deliveryTime.meta,
            },
            value: {
              meta: {
                ...orderConstants.attributes.deliveryTime.valueMeta,
                href: `https://api.moysklad.ru/api/remap/1.2/entity/customentity/d133041a-0836-11ef-0a80-10de004fb76e/${data.delivery.time}`,
              },
            },
          },
        ]
      : [
          {
            meta: {
              ...orderConstants.attributes.orderType.meta,
            },
            value: {
              meta: {
                ...orderConstants.attributes.orderType.valueMeta,
                href: "https://api.moysklad.ru/api/remap/1.2/entity/customentity/8864b5ac-9806-11ee-0a80-11fb003800a6/83334031-9807-11ee-0a80-017900363eaf",
              },
            },
          },
          {
            meta: {
              ...orderConstants.attributes.selfPickupTime.meta,
            },
            value: {
              meta: {
                ...orderConstants.attributes.selfPickupTime.valueMeta,
                href: `https://api.moysklad.ru/api/remap/1.2/entity/customentity/52f5aab7-0836-11ef-0a80-0bcc004eec9d/${data.delivery.time}`,
              },
            },
          },
        ];

  const store = {
    meta: {
      ...orderConstants.store.meta,
      href: `https://api.moysklad.ru/api/remap/1.2/entity/store/${data.storeId}`,
    },
  };

  const positions = postitionsDTO(data.items);

  const descriptionParts = [
    `${data.bonuses.type === 0 ? "-" : "+"}${data.bonuses.amount} Бонусов`,
  ];

  if (data.promoCode) {
    descriptionParts.push(
      `Промокод: ${data.promoCode.code} (скидка ${data.promoCode.discount} руб.)`
    );
  }

    return {
      name: `ПРИЛ-${data.orderNumber}`,
      organization,
      agent,
      attributes,
      store,
      description: descriptionParts.join(", "),
      shipmentAddress: data.delivery.address,
      positions,
      tags: ["Мобильное приложение"],
      project: orderConstants.project,
      salesChannel: {
        meta: {
          href: "https://api.moysklad.ru/api/remap/1.2/entity/saleschannel/4f1e185d-1e53-11f1-0a80-07f5000181c7",
          type: "saleschannel",
          mediaType: "application/json",
        },
      },
    };
}

export function getSlots(
  type: number,
  isPersonalDelivery: boolean = false
): { name: string; array: SlotType[] } {
  const now = new Date();
  const vladHours = (now.getUTCHours() + 10 + 24) % 24;
  const vladMinutes = now.getUTCMinutes();
  const currentVladMinutes = vladHours * 60 + vladMinutes;

  if (type === 0 && isPersonalDelivery) {
    const windowStart = 16 * 60 + 30;
    const firstSlotClose = 18 * 60 + 30;
    const secondSlotClose = 19 * 60 + 30;

    const personalSlots: SlotType[] = [];
    const tomorrowPersonalSlots: SlotType[] = [
      { id: "personal-tomorrow-19-20", value: "Завтра, 19:00 - 20:00" },
      { id: "personal-tomorrow-20-22", value: "Завтра, 20:00 - 22:00" },
    ];

    if (currentVladMinutes < windowStart) {
      personalSlots.push(
        { id: "personal-19-20", value: "Сегодня, 19:00 - 20:00" },
        { id: "personal-20-22", value: "Сегодня, 20:00 - 22:00" }
      );
    } else {
      if (currentVladMinutes < firstSlotClose) {
        personalSlots.push({
          id: "personal-19-20",
          value: "Сегодня, 19:00 - 20:00",
        });
      }

      if (currentVladMinutes < secondSlotClose) {
        personalSlots.push({
          id: "personal-20-22",
          value: "Сегодня, 20:00 - 22:00",
        });
      }
    }

    if (personalSlots.length > 0) {
      return {
        name: "Персональная доставка",
        array: personalSlots,
      };
    }

    return {
      name: "Персональная доставка",
      array: tomorrowPersonalSlots,
    };
  }

  const selected = slotsList[type];
  const cutoffTime = 16 * 60 + 30;

  const todaySlots: SlotType[] = [];
  const tomorrowSlots: SlotType[] = [];

  selected.array.forEach((slot) => {
    const [start] = slot.value.split(" - ");
    const [startHour, startMinute] = start.split(":").map(Number);
    const slotStartMinutes = startHour * 60 + startMinute;

    const isEveningSlot = slot.value.includes("18:00");
    const isAfterCutoff = currentVladMinutes >= cutoffTime;

    if (isEveningSlot && isAfterCutoff && !isPersonalDelivery) {
      tomorrowSlots.push({
        ...slot,
        value: `Завтра, ${slot.value}`,
      });
    } else if (slotStartMinutes <= currentVladMinutes) {
      tomorrowSlots.push({
        ...slot,
        value: `Завтра, ${slot.value}`,
      });
    } else {
      todaySlots.push({
        ...slot,
        value: `Сегодня, ${slot.value}`,
      });
    }
  });

  return {
    name: selected.name,
    array: [...todaySlots, ...tomorrowSlots],
  };
}