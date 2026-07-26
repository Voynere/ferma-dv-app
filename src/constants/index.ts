import CtalogIcons from "../assets/svg/catalog";
import Icons from "../ui/Icons";
import {FC} from "react";
import {NumberProp} from "react-native-svg";
import {RootStackParamList} from "../RootLayout";

export const WEBSITE_BASE_URL = 'https://ferma-dv.ru';
export const APP_URL_SCHEME = 'burenka';

interface NavItem {
    link: keyof RootStackParamList;
    name: string;
    icon: FC<{ isBold?: boolean; color?: string; width?: NumberProp; height?: NumberProp }>;
}

export const navList: NavItem[] = [
    { link: "home", name: "начало", icon: Icons.Home },
    { link: "favorite", name: "избранное", icon: Icons.Heard },
    { link: "catalog", name: "каталог", icon: Icons.Grid },
    { link: "profile", name: "профиль", icon: Icons.User },
    { link: "cart", name: "корзина", icon: Icons.Cart },
];
export type BannerItem = {
    title: string;
    image: any;
    description: string;
    buttonText?: string;
    atributeId?: string;
    catalogName?: string;
    kilbilActionId?: number;
}

export type KilbilStickerConfig = {
    stickerText: string
    stickerColor: string
    stickerTextColor: string
}

export const KILBIL_ACTION_STICKERS: Record<number, KilbilStickerConfig> = {
    73313: { stickerText: 'Зелёный\nценник',      stickerColor: '#4FBD01', stickerTextColor: '#fff' },
    72267: { stickerText: 'Колбасный\nвторник',   stickerColor: '#E2231A', stickerTextColor: '#fff' },
    62008: { stickerText: 'Мясное\nвоскресенье',  stickerColor: '#8B0000', stickerTextColor: '#fff' },
    74286: { stickerText: 'Клубника\nлето',        stickerColor: '#D63384', stickerTextColor: '#fff' },
    74627: { stickerText: 'Клубника\nлето',        stickerColor: '#D63384', stickerTextColor: '#fff' },
    51043: { stickerText: '5%\nговядина',          stickerColor: '#8B4513', stickerTextColor: '#fff' },
}

export const DEFAULT_KILBIL_STICKER: KilbilStickerConfig = {
    stickerText: 'Акция',
    stickerColor: '#4FBD01',
    stickerTextColor: '#fff',
}

export type Promotion = {
    name: string;
    /** Дни недели (0=вс, 1=пн, …). Если задан dateRange — игнорируется. */
    days?: number[];
    /** Диапазон дат в формате "DD.MM.YYYY". */
    dateRange?: { from: string; to: string };
    stickerText: string;
    stickerColor: string;
    stickerTextColor?: string;
    discountPercent?: number;
    /** Название категории каталога для перехода по баннеру акции */
    catalogName?: string;
}

function parseDDMMYYYY(s: string): Date {
    const [d, m, y] = s.split('.').map(Number)
    return new Date(y, m - 1, d)
}

export const promotions: Promotion[] = [
    {
        name: "Молочный понедельник",
        days: [1],
        stickerText: "Молочный\nпонедельник",
        stickerColor: "#3FA9F5",
        stickerTextColor: "#FFFFFF",
        discountPercent: 10,
        catalogName: "Молочная продукция",
    },
    {
        name: "Колбасный вторник",
        days: [2],
        stickerText: "Колбасный\nвторник",
        stickerColor: "#E2231A",
        stickerTextColor: "#FFFFFF",
        discountPercent: 10,
        catalogName: "Колбасные изделия",
    },
    {
        name: "Мясное воскресенье",
        days: [0],
        stickerText: "Мясное\nвоскресенье",
        stickerColor: "#8B0000",
        stickerTextColor: "#FFFFFF",
        discountPercent: 10,
        catalogName: "Мясные деликатесы",
    },
    // --- Акции с диапазоном дат (добавляйте сюда при запуске новых акций) ---
    // Пример:
    // {
    //     name: "Зеленая неделя",
    //     dateRange: { from: "02.06.2026", to: "08.06.2026" },
    //     stickerText: "Зелёная\nнеделя",
    //     stickerColor: "#4FBD01",
    //     stickerTextColor: "#FFFFFF",
    //     discountPercent: 10,
    // },
]

export function getActivePromos(date: Date = new Date()): Promotion[] {
    const day = date.getDay()
    return promotions.filter(p => {
        if (p.dateRange) {
            const from = parseDDMMYYYY(p.dateRange.from)
            const to = parseDDMMYYYY(p.dateRange.to)
            to.setHours(23, 59, 59, 999)
            return date >= from && date <= to
        }
        if (p.days) return p.days.includes(day)
        return false
    })
}

export function getActivePromoForName(promoName?: string, date: Date = new Date()): Promotion | undefined {
    if (!promoName) return undefined
    const normalized = promoName.trim().toLowerCase()
    return getActivePromos(date).find(p => p.name.trim().toLowerCase() === normalized)
}

export function getActivePromoForProduct(promoName?: string, pathName?: string, date: Date = new Date()): Promotion | undefined {
    const activePromos = getActivePromos(date)
    if (!activePromos.length) return undefined

    if (promoName) {
        const normalized = promoName.trim().toLowerCase()
        const byName = activePromos.find(p => p.name.trim().toLowerCase() === normalized)
        if (byName) return byName
    }

    if (pathName) {
        const normalizedPath = pathName.trim().toLowerCase()
        return activePromos.find(p =>
            p.catalogName && normalizedPath.includes(p.catalogName.trim().toLowerCase())
        )
    }

    return undefined
}

export const bannersList: BannerItem[] = [
    {
        title: "",
        image: require("../assets/images/banners/new_9.jpg"),
        description: "Акция «Молочный понедельник» — скидка 10% на всю молочную продукцию. Действует только по понедельникам.",
        buttonText: "Перейти в категорию",
        catalogName: "Молочная продукция",
    },
    {
        title: "",
        image: require("../assets/images/banners/new_10.jpg"),
        description: "Акция «Мясное воскресенье» — скидка 10% на мясо. Действует только по воскресеньям.",
        buttonText: "Смотреть товары",
        atributeId: "kilbil-meat-sunday",
        kilbilActionId: 62008,
    },
    {
        title: "",
        image: require("../assets/images/banners/new_11.jpg"),
        description: "Акция «Колбасный вторник» — скидка 10% на колбасные изделия. Действует только по вторникам.",
        buttonText: "Смотреть товары",
        atributeId: "kilbil-sausage-tuesday",
        kilbilActionId: 72267,
    },
]

export const categoriesList = [
    { name: "на завтрак", icon: Icons.Eggs, id: "be215107-559a-11f0-0a80-1061002fccc6" },
    { name: "на ужин", icon: Icons.Tea, id: "be215503-559a-11f0-0a80-1061002fccc7" },
    { name: "детям", icon: Icons.Kids, id: "be215658-559a-11f0-0a80-1061002fccc8" },
    { name: "к празднику", icon: Icons.Cake, id: "be215772-559a-11f0-0a80-1061002fccc9" },
    { name: "на пикник", icon: Icons.Picnic, id: "be21588f-559a-11f0-0a80-1061002fccca" },
]

export const catalogLIst = [
    { name: "ЗЕЛЕНЫЕ\nЦЕННИКИ", isGreen: true, icon: CtalogIcons.Discount },
    { name: "Молочная\nпродукция", icon: CtalogIcons.Milk },
    { name: "Домашние\nполуфабрикаты", icon: CtalogIcons.SemiFinished },
    { name: "Мясные\nделикатесы", icon: CtalogIcons.Meat },
    { name: "Колбасные\nизделия", icon: CtalogIcons.Sausage },
    { name: "Овощи, фрукты\nгрибы, ягоды", icon: CtalogIcons.Vegetables },
    { name: "Ремесленные\nсыры", icon: CtalogIcons.Cheese },
    { name: "Яйца", icon: CtalogIcons.Eggs },
    { name: "Домашняя\nконсервация", icon: CtalogIcons.Canning },
    { name: "Мясо и рыба", icon: CtalogIcons.Fish },
    { name: "Ремесленный\nхлеб", icon: CtalogIcons.Bread },
    { name: "Бакалея", icon: CtalogIcons.Grocery },
    { name: "Варенье, соки,\nкомпоты", icon: CtalogIcons.Jam },
    { name: "Чай и дикоросы", icon: CtalogIcons.Tea },
    { name: "Мёд", icon: CtalogIcons.Honey },
    { name: "Кулинария", icon: CtalogIcons.Cooking },
]

export const catalogCatList = [
    { name: "Из козьего молока", icon: Icons.Goat, amount: 45 },
    { name: "Йогурт", icon: Icons.Yogurt, amount: 10 },
    { name: "Кефир и кисломолочные продукты", icon: Icons.Kefir, amount: 9 },
    { name: "Масло сливочное", icon: Icons.Butter, amount: 3 },
    { name: "Молоко и сливки", icon: Icons.Milk, amount: 6 },
    { name: "Молочные десерты, сгущенка", icon: Icons.MilkDesserts, amount: 2 },
    { name: "Мороженое", icon: Icons.IceCream, amount: 35 },
    { name: "Сметана", icon: Icons.SourCream, amount: 2 },
    { name: "Сырники, творожные десерты", icon: Icons.Cheesecakes, amount: 1 },
    { name: "Творог", icon: Icons.CottageCheese, amount: 3 },
]

export const productList = [
    { id: "1", name: "Ацидофилин из козьего молока, 500мл", price: 185, image: require("../assets/images/products/Milk.png") },
    { id: "2", name: "Варенец из козьего молока, 220гр.", price: 170, image: null },
    { id: "3", name: "Зерненый творого из козьего молока в сливках, 200гр.", price: 310, image: null },
    { id: "4", name: "Йогурт греческий с абрикосом Экоферма Николаевская, 200гр.", price: 310, image: null },
    { id: "5", name: "Кефир деревенский Карсаковка, 1л.", price: 310, image: require("../assets/images/products/Kefir.png") },
]

export const historyList = [
    { createdAt: "25.02.2025", id: "261514", type: "Доставка", amount: 5615, bonus: 300 },
    { createdAt: "10.02.2025", id: "261325", type: "Самовывоз", amount: 2300, bonus: -150 },
]

export const promoList = ["№ купона", "Скидка", "Срок действия"]

export const promoData = [
    { id: "2516384", discount: 15, expireDate: "15.03.2025" },
    { id: "6598741", discount: 7, expireDate: "10.04.2025" },
    { id: "9898651", discount: 20, expireDate: "20.04.2025" },
]

export const selfPickupList = [
    {
        city: "Владивосток",
        list: [
            { address: "ул. Верхнепортовая, 41В (Эгершельд)", rating: 5.0, storeId: "7c0dc9ce-ce1e-11ea-0a80-09ca000e5e93" },
    //        { address: "ул. Чкалова, 30 (Заря)", rating: 4.5, storeId: "028e05a7-b4fa-11ee-0a80-1198000442be" },
            { address: "Реми-Сити (ул. Народный пр-т, 20)", rating: 4.5, storeId: "b24e4c35-9609-11eb-0a80-0d0d008550c2" },
            { address: "ул. Тимирязева, 31 ст1 (район Спутник)", rating: 4.5, storeId: "a99d6fdf-0970-11ed-0a80-0ed600075845" },
        ]
    },
    // {
    //     city: "Находка",
    //     list: [
    //         { address: "проспект Мира 65/10, Сити-центр (фермерский мини-рынок)", rating: 4.0 },
    //     ]
    // },
    // {
    //     city: "Уссурийск",
    //     list: [
    //         { address: "ТЦ Москва, 1-й этаж (ул. Суханова, 52)", rating: 4.5 },
    //     ]
    // },
]

export const tagsList = [
    { name: "Зелёные ценники", color: "#4FBD01" },
    { name: "ХИТ", color: "#FFBA34", isBlackText: true },
    { name: "Срок годности до 10 дней", color: "#599BFF" },
]

export const filteredCategories = [
    {
        name: "Молочная продукция",
        position: 1,
        array: ["Йогурт", "Кефир и кисломолочные напитки", "Сметана", "Молочные десерты, сгущенка", "Масло сливочное", "Из козьего молока", "Мороженое", "Сырники, творожные десерты", "Молоко и сливки", "Творог"],
    },
    {
        name: "Полуфабрикаты домашние",
        position: 2,
        array: ["Блинчики", "Сырники", "Готовые блюда", "Рыбные полуфабрикаты", "Котлеты, биточки", "Рулеты", "Полуфабрикаты из мяса, мяса птицы", "Выпечка, лапша", "Пироги для духовки", "Бульоны замороженные", "Пельмени, манты, хинкали", "Вареники", "Полуфабрикаты из овощей", "Фарш"],
    },
    {
        name: "Мясные деликатесы",
        position: 3,
        array: ["Рулеты фермерские", "Копченые, сырокопченые изделия", "Колбасы фермерские", "Холодец, зельц, рулька", "Барбекю", "Вареные, варено-копченые изделия", "Ветчина фермерская", "Сало"],
    },
    {
        name: "Колбасные изделия",
        position: 4,
        array: ["Вареные колбасы", "Сосиски и сардельки", "Паштеты", "Полукопченые колбасы", "Сырокопченые изделия", "Варено-копченые изделия", "Сыровяленые изделия", "Запеченные, жареные изделия"],
    },
    {
        name: "Овощи, фрукты, ягоды, грибы",
        position: 5,
        array: ["Грибы", "Зелень", "Ягода", "Микрозелень"],
    },
    {
        name: "Домашние и ремесленные сыры",
        position: 6,
        array: ["Молодые и рассольные сыры", "Твердые и полутвердые сыры", "Сыры с плесенью", "Творожные сыры", "Сыры из козьего молока"],
    },
    {
        name: "Яйцо домашнее",
        position: 7,
        array: [],
    },
    {
        name: "Домашняя консервация",
        position: 8,
        array: ["Соленья бочковые", "Консервация в банках", "Грибы соленые и консервированные"],
    },
    {
        name: "Мясо и рыба",
        position: 9,
        array: ["Для шашлыка и гриля", "Свинина и говядина", "Мясо кролика", "Рыба и морепродукты", "Мясо птицы"],
    },
    {
        name: "Ремесленный хлеб и выпечка",
        position: 10,
        array: ["Хлеб на закваске", "Собственное производство", "Круассаны", "Хлеб из печи", "Выпечка сдоба", "Безглютеновый хлеб", "Куличи", "Хлебцы галеты"],
    },
    {
        name: "Бакалея",
        position: 11,
        array: ["Масла сыродавленные", "Соусы домашние", "Кофе обжаренный", "Аджика домашняя", "Специи натуральные", "Морс, квас", "Соусы кетчуп майонез", "Мука", "Уксусы натуральные"],
    },
    {
        name: "Варенье, домашние соки и компоты",
        position: 12,
        array: ["Компоты", "Варенье из лепестков роз", "Варенье из сосновой шишки", "Соки домашние", "Сиропы", "Орехи в сиропе", "Варенье, повидло, джемы"],
    },
    {
        name: "Чай, травы и дикоросы",
        position: 13,
        array: ["Чистые травы", "Пряности", "Чай на основе ройбуша", "Китайский чай", "Какао натуральное", "Напитки на основе каркаде", "Иван-чай и напитки на его основе", "Черный чай", "Зеленый чай", "Чай без основы (травяной, ягодный, глинтвейны)", "Ягоды плоды"],
    },
    {
        name: "Мед",
        position: 14,
        array: [],
    },
    {
        name: "Подарки и подарочные сертификаты",
        position: 15,
        array: [],
    },
    {
        name: "Орехи, сухофрукты, снеки",
        position: 16,
        array: ["Цукаты", "Снеки", "Семечки и семена", "Орехи", "Сухофрукты"],
    },
    {
        name: "БАДы",
        position: 17,
        array: [],
    },
    {
        name: "Готовая еда",
        position: 18,
        array: ["Сухие завтраки", "Салаты", "Пирожки пянсе", "Пироги"],
    },
    {
        name: "Товары для красоты",
        position: 19,
        array: ["Для губ", "Для тела", "Для лица", "Для волос", "Для рук", "Для дома и ванны", "Мыло", "Для ног"],
    },
    {
        name: "Тушенки, консервы, каши",
        position: 20,
        array: [],
    },
    {
        name: "Сладости и десерты",
        position: 21,
        array: ["Баранки сушки сухари", "Ферментелла", "Без муки, сахара, лактозы и глютена", "Моти", "Мармелад", "Вафли пряники", "Зефир", "Печенье", "Эклеры", "Халва", "Пастила домашняя", "Безе", "Конфеты", "Торты", "Фруктовые чипсы", "Пирожные и десерты"],
    },
    {
        name: "Товары для дома",
        position: 22,
        array: ["Одноразовая посуда", "Для мытья посуды", "Товары для кухни", "Средства для стирки", "Нужные мелочи", "Бумага и салфетки", "Для готовки и хранения", "Средства для уборки"],
    },
    {
        name: "Подарки по акции",
        isHidden: true,
        array: [],
    },
    {
        name: "Упаковка",
        isHidden: true,
        array: [],
    },
]

export const weightedList = [
    {
        name: "Орехи, сухофрукты, снеки",
        weight: 0.5,
        array: [
            { name: "Цукаты", weight: 0.5 },
            { name: "Снеки", weight: 0.5 },
            { name: "Семечки и семена", weight: 0.5 },
            { name: "Орехи", weight: 0.5 },
            { name: "Сухофрукты", weight: 0.5 },
        ]
    },
    {
        name: "Чай, травы и дикоросы",
        array: [
            { name: "Ягоды плоды", weight: 1 },
        ]
    },
    {
        name: "Сладости и десерты",
        array: [
            { name: "Зефир", weight: 0.5 },
            { name: "Конфеты", weight: 0.5 },
            { name: "Торты", weight: 0.5 },
            { name: "Пирожные и десерты", weight: 0.5 },
        ]
    },
    {
        name: "Домашняя консервация",
        array: [
            { name: "Соленья бочковые", weight: 1 },
        ]
    },
    {
        name: "Колбасные изделия",
        weight: 0.5,
        array: [
            { name: "Вареные колбасы", weight: 0.5 },
            { name: "Сосиски и сардельки", weight: 0.5 },
            { name: "Паштеты", weight: 0.5 },
            { name: "Полукопченые колбасы", weight: 0.5 },
            { name: "Сырокопченые изделия", weight: 0.5 },
            { name: "Варено-копченые изделия", weight: 0.5 },
            { name: "Сыровяленые изделия", weight: 0.5 },
            { name: "Запеченные, жареные изделия", weight: 0.5 },
        ]
    },
    {
        name: "Молочная продукция",
        array: [
            { name: "Масло сливочное", weight: 0.5 },
            { name: "Сырники, творожные десерты", weight: 1 },
        ]
    },
    {
        name: "Овощи, фрукты, ягоды, грибы",
        array: [
            { name: "Ягода", weight: 0.5 },
        ]
    },
    {
        name: "Мясо и рыба",
        weight: 1,
        array: [
            { name: "Для шашлыка и гриля", weight: 1 },
            { name: "Свинина и говядина", weight: 1 },
            { name: "Мясо кролика", weight: 1 },
            { name: "Рыба и морепродукты", weight: 1 },
            { name: "Мясо птицы", weight: 1 },
        ]
    },
    {
        name: "Мясные деликатесы",
        weight: 0.5,
        array: [
            { name: "Рулеты фермерские", weight: 0.5 },
            { name: "Копченые, сырокопченые изделия", weight: 0.5 },
            { name: "Колбасы фермерские", weight: 0.5 },
            { name: "Холодец, зельц, рулька", weight: 0.5 },
            { name: "Барбекю", weight: 0.5 },
            { name: "Вареные, варено-копченые изделия", weight: 0.5 },
            { name: "Ветчина фермерская", weight: 0.5 },
            { name: "Сало", weight: 0.5 },
        ]
    },
    {
        name: "Домашние и ремесленные сыры",
        weight: 0.3,
        array: [
            { name: "Молодые и рассольные сыры", weight: 0.3 },
            { name: "Твердые и полутвердые сыры", weight: 0.3 },
            { name: "Сыры с плесенью", weight: 0.3 },
            { name: "Творожные сыры", weight: 0.3 },
            { name: "Сыры из козьего молока", weight: 0.3 },
        ]
    },
    {
        name: "Полуфабрикаты домашние",
        weight: 1,
        array: [
            { name: "Блинчики", weight: 1 },
            { name: "Сырники", weight: 1 },
            { name: "Готовые блюда", weight: 1 },
            { name: "Рыбные полуфабрикаты", weight: 1 },
            { name: "Котлеты, биточки", weight: 1 },
            { name: "Рулеты", weight: 1 },
            { name: "Полуфабрикаты из мяса, мяса птицы", weight: 1 },
            { name: "Выпечка, лапша", weight: 1 },
            { name: "Пироги для духовки", weight: 1 },
            { name: "Бульоны замороженные", weight: 1 },
            { name: "Пельмени, манты, хинкали", weight: 1 },
            { name: "Вареники", weight: 1 },
            { name: "Полуфабрикаты из овощей", weight: 1 },
            { name: "Фарш", weight: 1 },
        ]
    },
]

export const orderConstants = {
    organization: {
        meta: {
            href: "https://api.moysklad.ru/api/remap/1.2/entity/organization/7c0cf6c0-ce1e-11ea-0a80-09ca000e5e91",
            type: "organization",
            mediaType: "application/json"
        }
    },
    agent: {
        meta: {
            type: "counterparty",
            mediaType: "application/json"
        }
    },
    attributes: {
        orderType: {
            meta: {
                href: "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/attributes/d07a5167-9807-11ee-0a80-1398003690cf",
                type: "attributemetadata",
                mediaType: "application/json"
            },
            valueMeta: {
                type: "customentity",
                mediaType: "application/json"
            }
        },
        deliveryTime: {
            meta: {
                href: "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/attributes/45abb3ca-0837-11ef-0a80-0bcc004efc3f",
                type: "attributemetadata",
                mediaType: "application/json"
            },
            valueMeta: {
                type: "customentity",
                mediaType: "application/json"
            }
        },
        selfPickupTime: {
            meta: {
                href: "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/attributes/45abb540-0837-11ef-0a80-0bcc004efc40",
                type: "attributemetadata",
                mediaType: "application/json"
            },
            valueMeta: {
                type: "customentity",
                mediaType: "application/json"
            }
        },
        orderSource: {
            meta: {
                href: "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/attributes/ORDER_SOURCE_ATTRIBUTE_ID",
                type: "attributemetadata",
                mediaType: "application/json"
            },
            valueMeta: {
                type: "customentity",
                mediaType: "application/json"
            },
            mobileAppValue: "MOBILE_APP_VALUE_ID"
        }
    },
    store: {
        meta: {
            type: "store",
            mediaType: "application/json"
        }
    },
    project: {
        meta: {
            href: "https://api.moysklad.ru/api/remap/1.2/entity/project/02544d53-b93e-11f0-0a80-08450070c327",
            type: "project",
            mediaType: "application/json"
        }
    }
}

export const slotsList = [
    {
        name: "Доставка",
        array: [
            {
                value: "10:00 - 12:00",
                id: "ecc50a96-0836-11ef-0a80-0925004ecd8a"
            },
            {
                value: "13:00 - 16:00",
                id: "f3aa8e72-0836-11ef-0a80-0e45004ec647"
            },
            {
                value: "18:00 - 22:00",
                id: "fee68744-0836-11ef-0a80-0f13004ed5f6"
            },
        ]
    },
    {
        name: "Самовывоз",
        array: [
            {
                value: "10:00 - 12:00",
                id: "9eeed7aa-0836-11ef-0a80-0f13004ecfd7"
            },
            {
                value: "12:00 - 14:00",
                id: "a7fbfed1-0836-11ef-0a80-0c4c005119a6"
            },
            {
                value: "14:00 - 16:00",
                id: "b031841b-0836-11ef-0a80-0e45004ec319"
            },
            {
                value: "16:00 - 18:00",
                id: "b7ba69bd-0836-11ef-0a80-134d004e4aa6"
            },
            {
                value: "18:00 - 22:00",
                id: "beb09fae-0836-11ef-0a80-0e45004ec427"
            },
        ]
    }
]
