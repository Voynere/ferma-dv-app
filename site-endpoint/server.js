#!/usr/bin/env node
/**
 * Kilbil-акции: сервис для мобильного приложения.
 *
 *   • Раз в час САМ генерирует список акций (MoySklad → Эвотор → Kilbil processsale).
 *   • Раздаёт результат по HTTP:  GET /actions.json
 *
 * Запуск через pm2 (держит процесс живым и поднимает после перезагрузки):
 *   pm2 start server.js --name kilbil
 *   pm2 save
 *
 * Проверка:  curl http://localhost:8080/actions.json
 * Снаружи:   http://77.222.47.128:8080/actions.json
 *
 * Node 18+ (встроенный fetch). Зависимостей нет.
 */

const http = require('http');

const MS_TOKEN     = process.env.MOYSKLAD_TOKEN || '';
const EVOTOR_KEY   = process.env.EVOTOR_KEY || '';
const KILBIL_KEY   = process.env.KILBIL_KEY || '';
const CLIENT_ID    = process.env.CLIENT_ID || '31117526'; // авторизованный клиент (для бонусных акций)
const TRADE_OBJECT = 1051821;                              // Интернет-магазин
const PORT         = Number(process.env.PORT) || 8080;
const REFRESH_MS   = 60 * 60 * 1000;                       // раз в час

const DISCOUNT_ACTION = 'Зеленые ценники';

// Определение акции по проценту скидки и дню недели (имя из Kilbil не приходит).
//   −7%            → Зелёные ценники (все дни)
//   −10% вс (day 0)→ Мясное воскресенье
//   −10% вт (day 2)→ Колбасный вторник
function classifyDiscount(pct, day) {
  if (pct >= 9 && day === 0) return 'Мясное воскресенье';
  if (pct >= 9 && day === 2) return 'Колбасный вторник';
  return DISCOUNT_ACTION;
}

const MS_BASE  = 'https://api.moysklad.ru/api/remap/1.2';
const EVO_BASE = 'https://api.evotor.ru';
const KIL_BASE = 'https://bonus.kilbil.ru/load';

let cache = { generated_at: null, count: 0, items: [], status: 'starting' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jget(url, headers, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) { if (i === tries - 1) throw e; await sleep(1500); }
  }
}
async function jpost(url, body, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) { if (i === tries - 1) throw e; await sleep(1500); }
  }
}

async function buildEvotorMap() {
  const EH = { Authorization: 'Bearer ' + EVOTOR_KEY, Accept: 'application/vnd.evotor.v2+json' };
  const stores = await jget(EVO_BASE + '/stores', EH);
  const codeToUuid = {};
  for (const store of stores.items) {
    let cursor = ''; let pages = 0;
    do {
      let url = EVO_BASE + '/stores/' + store.id + '/products?limit=500';
      if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
      const data = await jget(url, EH);
      for (const it of (data.items || [])) {
        if (it.code) codeToUuid[String(it.code).trim()] = it.id;
        if (it.article_number) codeToUuid[String(it.article_number).trim()] = it.id;
      }
      cursor = data.paging && data.paging.next_cursor ? data.paging.next_cursor : '';
      pages++;
    } while (cursor && pages < 100);
  }
  return codeToUuid;
}

async function loadMoySklad() {
  const AUTH = { Authorization: 'Bearer ' + MS_TOKEN };
  const rows = [];
  let offset = 0;
  while (true) {
    const data = await jget(MS_BASE + '/entity/assortment?limit=1000&offset=' + offset, AUTH);
    rows.push(...(data.rows || []));
    if (rows.length >= data.meta.size) break;
    offset += 1000;
  }
  return rows.map((r) => {
    let price = 0;
    if (Array.isArray(r.salePrices) && r.salePrices[0]) price = (r.salePrices[0].value || 0) / 100;
    return { article: r.article ? String(r.article).trim() : '', name: r.name || '', folder: r.pathName || '', price: price > 0 ? price : 500 };
  }).filter((r) => r.article);
}

function dateStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

async function processsale(items) {
  const result = {};
  const CHUNK = 10;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = items.slice(i, i + CHUNK);
    const goods_data = batch.map((x) => ({ code: x.uuid, vendor_code: '', name: '', price: x.price, quantity: 1, total: x.price, discounted_price: x.price, discounted_total: x.price }));
    const body = { client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0, goods_data, move_id: 'svc-' + Date.now() + '-b' + i, doc_open_dt: dateStr(), pos_discounts_are_used: 1, is_reserved: true, trade_object_id: TRADE_OBJECT };
    let resp;
    try { resp = await jpost(KIL_BASE + '/processsale?h=' + KILBIL_KEY, body); }
    catch (e) { continue; }
    const billItems = resp._bill_data && resp._bill_data.items ? resp._bill_data.items : [];
    billItems.forEach((it, idx) => {
      const sent = batch[idx];
      if (!sent) return;
      const price = Number(it.price) || sent.price;
      const disc = Number(it.discounted_price);
      const bonus = Number(it.bonus_in) || 0;
      const out = {};
      if (price > 0 && disc < price) out.discountPct = Math.round(((price - disc) / price) * 100);
      if (bonus > 0 && price > 0) out.bonusPct = Math.round((bonus / price) * 100);
      if (out.discountPct || out.bonusPct) result[sent.uuid] = out;
    });
  }
  return result;
}

async function generate() {
  const t0 = Date.now();
  try {
    const day = new Date().getDay();

    const [evoMap, msRows] = await Promise.all([buildEvotorMap(), loadMoySklad()]);
    const matched = [];
    for (const r of msRows) {
      const uuid = evoMap[r.article];
      if (uuid) matched.push({ ...r, uuid });
    }
    const uuidToProduct = {};
    for (const m of matched) uuidToProduct[m.uuid] = m;

    const res = await processsale(matched);
    const items = [];
    for (const [uuid, v] of Object.entries(res)) {
      const p = uuidToProduct[uuid] || { article: '?', name: '?', folder: '?' };
      // Учитываем только скидки. bonus_in — это базовая программа лояльности (5% на всё), не акция.
      if (v.discountPct) {
        // "Зелёные ценники" — всегда, независимо от дня и процента, чтобы категория не пустела.
        items.push({ article: p.article, name: p.name, folder: p.folder, type: 'discount', action: DISCOUNT_ACTION, value: v.discountPct });
        // День-специфичная акция — дополнительный тег поверх (не замена).
        const dayAction = classifyDiscount(v.discountPct, day);
        if (dayAction !== DISCOUNT_ACTION) {
          items.push({ article: p.article, name: p.name, folder: p.folder, type: 'discount', action: dayAction, value: v.discountPct });
        }
      }
    }

    cache = { generated_at: new Date().toISOString(), day_of_week: day, count: items.length, items, status: 'ok' };
    console.log('[generate] ok:', items.length, 'позиций за', ((Date.now() - t0) / 1000).toFixed(0) + 'с');
  } catch (e) {
    console.error('[generate] FAIL:', e.message, '(оставляю прошлый результат)');
    cache.status = 'error: ' + e.message;
  }
}

// HTTP-сервер
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.url === '/actions.json' || req.url === '/') {
    res.end(JSON.stringify(cache));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not found' }));
  }
}).listen(PORT, () => console.log('[server] слушает порт', PORT));

// Генерируем при старте и далее раз в час
generate();
setInterval(generate, REFRESH_MS);
