#!/usr/bin/env node
/**
 * Kilbil-акции Интернет-магазина → actions.json для мобильного приложения.
 *
 * Цепочка: MoySklad (артикулы) → Эвотор (UUID) → Kilbil processsale.
 *   • Зелёные ценники   — скидка с цены (discounted_price < price), для всех.
 *   • Мясное воскресенье / Колбасный вторник — кешбэк бонусами (bonus_in > 0),
 *     для авторизованных, по дню недели.
 *
 * Запуск (РФ-сервер, Node 18+, без зависимостей):
 *   node kilbil-actions.js
 *
 * Cron-пример (каждый час, время Владивостока):
 *   TZ=Asia/Vladivostok  0 * * * *  cd /var/www && node kilbil-actions.js >> /var/log/kilbil.log 2>&1
 */

const fs = require('fs');

const MS_TOKEN     = process.env.MOYSKLAD_TOKEN || '';
const EVOTOR_KEY   = process.env.EVOTOR_KEY || '';
const KILBIL_KEY   = process.env.KILBIL_KEY || '';
const CLIENT_ID    = process.env.CLIENT_ID || '31117526'; // авторизованный клиент (0% перс. скидки) — чтобы ловить бонусные акции
const TRADE_OBJECT = 1051821;                              // Интернет-магазин
const OUT_FILE     = process.env.OUT_FILE || '/var/www/actions.json';

// Бонусные акции по дню недели (JS getDay: 0=вс … 6=сб)
const BONUS_ACTION_BY_DAY = {
  0: 'Мясное воскресенье',
  2: 'Колбасный вторник',
};
const DISCOUNT_ACTION = 'Зеленые ценники';

const MS_BASE  = 'https://api.moysklad.ru/api/remap/1.2';
const EVO_BASE = 'https://api.evotor.ru';
const KIL_BASE = 'https://bonus.kilbil.ru/load';

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
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) { if (i === tries - 1) throw e; await sleep(1500); }
  }
}

async function buildEvotorMap() {
  const EH = { Authorization: 'Bearer ' + EVOTOR_KEY, Accept: 'application/vnd.evotor.v2+json' };
  const stores = await jget(EVO_BASE + '/stores', EH);
  const codeToUuid = {};
  let total = 0;
  for (const store of stores.items) {
    let cursor = ''; let pages = 0;
    do {
      let url = EVO_BASE + '/stores/' + store.id + '/products?limit=500';
      if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
      const data = await jget(url, EH);
      for (const it of (data.items || [])) {
        total++;
        if (it.code) codeToUuid[String(it.code).trim()] = it.id;
        if (it.article_number) codeToUuid[String(it.article_number).trim()] = it.id;
      }
      cursor = data.paging && data.paging.next_cursor ? data.paging.next_cursor : '';
      pages++;
    } while (cursor && pages < 100);
  }
  console.log('[evotor] товаров:', total, '| кодов:', Object.keys(codeToUuid).length);
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
  console.log('[moysklad] товаров:', rows.length);
  return rows.map((r) => {
    let price = 0;
    if (Array.isArray(r.salePrices) && r.salePrices[0]) price = (r.salePrices[0].value || 0) / 100;
    return {
      article: r.article ? String(r.article).trim() : '',
      name: r.name || '', folder: r.pathName || '',
      price: price > 0 ? price : 500,
    };
  }).filter((r) => r.article);
}

function dateStr() {
  if (process.env.FORCE_DATE) return process.env.FORCE_DATE + ' 12:00:00';
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' +
         p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

// processsale маленькими чеками → по каждому товару: скидка% и бонус%
async function processsale(items) {
  const result = {};   // uuid → { discountPct, bonusPct }
  const CHUNK = 10;    // маленький чек: иначе Kilbil режет число акционных позиций
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = items.slice(i, i + CHUNK);
    const goods_data = batch.map((x) => ({
      code: x.uuid, vendor_code: '', name: '', price: x.price, quantity: 1,
      total: x.price, discounted_price: x.price, discounted_total: x.price,
    }));
    const body = {
      client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0,
      goods_data, move_id: 'app-' + Date.now() + '-b' + i,
      doc_open_dt: dateStr(), pos_discounts_are_used: 1, is_reserved: true, trade_object_id: TRADE_OBJECT,
    };
    let resp;
    try { resp = await jpost(KIL_BASE + '/processsale?h=' + KILBIL_KEY, body); }
    catch (e) { console.log('[processsale] batch', i, 'err', e.message); continue; }

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
    process.stdout.write('.');
  }
  console.log('');
  return result;
}

(async () => {
  const day = process.env.FORCE_DAY !== undefined ? Number(process.env.FORCE_DAY) : new Date().getDay();
  const bonusAction = BONUS_ACTION_BY_DAY[day] || null;
  console.log('=== Kilbil-акции Интернет-магазина ===');
  console.log('День недели:', day, '| бонусная акция дня:', bonusAction || 'нет', '\n');

  const [evoMap, msRows] = await Promise.all([buildEvotorMap(), loadMoySklad()]);

  const matched = []; let noUuid = 0;
  for (const r of msRows) {
    const uuid = evoMap[r.article];
    if (uuid) matched.push({ ...r, uuid }); else noUuid++;
  }
  console.log('[match] с UUID:', matched.length, '| без UUID:', noUuid, '\n');

  const uuidToProduct = {};
  for (const m of matched) uuidToProduct[m.uuid] = m;

  console.log('[processsale] обрабатываем (чеки по 10)...');
  const res = await processsale(matched);

  const items = [];
  for (const [uuid, v] of Object.entries(res)) {
    const p = uuidToProduct[uuid] || { article: '?', name: '?', folder: '?' };
    if (v.discountPct) {
      items.push({ article: p.article, name: p.name, folder: p.folder, type: 'discount', action: DISCOUNT_ACTION, value: v.discountPct });
    }
    if (v.bonusPct && bonusAction) {
      items.push({ article: p.article, name: p.name, folder: p.folder, type: 'bonus', action: bonusAction, value: v.bonusPct });
    }
  }

  // Группировка для отчёта
  const byAction = {};
  for (const it of items) (byAction[it.action] = byAction[it.action] || []).push(it);

  console.log('\n=== РЕЗУЛЬТАТ ===');
  for (const [action, list] of Object.entries(byAction)) {
    console.log('\n● ' + action + ' (' + list.length + ') — ' + (list[0].type === 'discount' ? 'скидка' : 'бонусы') + ':');
    list.sort((a, b) => a.folder.localeCompare(b.folder));
    list.slice(0, 50).forEach((p) => console.log('  ' + (p.type === 'discount' ? '-' : '+') + p.value + '% | ' + p.article + ' | ' + p.folder + ' | ' + p.name));
  }

  const out = {
    generated_at: new Date().toISOString(),
    day_of_week: day,
    bonus_action_today: bonusAction,
    count: items.length,
    items,
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('\n[ok] записано в', OUT_FILE, '(' + items.length + ' записей)');
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
