#!/usr/bin/env node
/**
 * Зелёные ценники: MoySklad → Эвотор UUID → Kilbil processsale.
 *
 * Логика:
 *   1. Эвотор → карта артикул → UUID
 *   2. MoySklad → ассортимент (артикул, имя, папка, цена)
 *   3. Kilbil processsale (trade_object_id=1051821) → скидка по каждому товару
 *      + applied_actions подтверждает акцию «Зеленые ценники»
 *   4. Результат → green-prices.json
 *
 * Запуск на РФ-сервере: node kilbil-chain-test.js
 * Node 18+ (встроенный fetch). Зависимостей нет.
 */

const fs = require('fs');

const MS_TOKEN     = process.env.MOYSKLAD_TOKEN || '';
const EVOTOR_KEY   = process.env.EVOTOR_KEY || '';
const KILBIL_KEY   = process.env.KILBIL_KEY || '';
// trade_object_id: по умолчанию 1051821 (Интернет-магазин); TRADE_OBJECT=null — как на сайте
const TRADE_OBJECT = process.env.TRADE_OBJECT !== undefined
  ? (process.env.TRADE_OBJECT === 'null' ? null : Number(process.env.TRADE_OBJECT))
  : 1051821;
const GREEN_NAME   = 'Зеленые ценники';  // имя акции в applied_actions
const OUT_FILE     = '/var/www/green-prices.json';
const CLIENT_ID    = process.env.CLIENT_ID || null;  // авторизованный клиент → авторизованные акции

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) { if (i === tries - 1) throw e; await sleep(1500); }
  }
}

// ── 1. Эвотор: карта артикул → UUID ───────────────────────────────────────────
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

// ── 2. MoySklad: ассортимент ──────────────────────────────────────────────────
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
      name: r.name || '',
      folder: r.pathName || '',
      price: price > 0 ? price : 500,
    };
  }).filter((r) => r.article);
}

// ── 3. Kilbil processsale ─────────────────────────────────────────────────────
function dateStr() {
  if (process.env.FORCE_DATE) return process.env.FORCE_DATE + ' 12:00:00';  // dd.mm.yyyy
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' +
         p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

async function processsale(items) {
  const discounted = {};          // uuid → pct
  const allActions = new Set();   // все применённые акции (для контроля)
  const CHUNK = 10;               // маленький чек — иначе Kilbil режет число акционных позиций
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = items.slice(i, i + CHUNK);
    const goods_data = batch.map((x) => ({
      code: x.uuid, vendor_code: '', name: '', price: x.price, quantity: 1,
      total: x.price, discounted_price: x.price, discounted_total: x.price,
    }));
    const body = {
      client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0,
      goods_data, move_id: 'apptest-' + Date.now() + '-b' + i,
      doc_open_dt: dateStr(), pos_discounts_are_used: 1,
      is_reserved: true, trade_object_id: TRADE_OBJECT,
    };
    let resp;
    try { resp = await jpost(KIL_BASE + '/processsale?h=' + KILBIL_KEY, body); }
    catch (e) { console.log('[processsale] batch', i, 'error', e.message); continue; }

    // applied_actions приходит как JSON-строка с массивом имён
    let acts = resp.applied_actions;
    if (typeof acts === 'string') { try { acts = JSON.parse(acts); } catch { acts = []; } }
    if (Array.isArray(acts)) acts.forEach((a) => allActions.add(a));

    const billItems = resp._bill_data && resp._bill_data.items ? resp._bill_data.items : [];
    billItems.forEach((it, idx) => {
      const old = Number(it.price), nw = Number(it.discounted_price);
      if (old > 0 && nw < old) {
        const pct = Math.round(((old - nw) / old) * 100);
        const sent = batch[idx];
        if (sent && pct > 0) discounted[sent.uuid] = pct;
      }
    });
    process.stdout.write('.');
  }
  console.log('');
  return { discounted, allActions: [...allActions] };
}

// Уточняем акцию для одного товара: одиночный processsale → applied_actions[0]
async function refineAction(uuid, price) {
  const body = {
    client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0,
    goods_data: [{
      code: uuid, vendor_code: '', name: '', price, quantity: 1,
      total: price, discounted_price: price, discounted_total: price,
    }],
    move_id: 'refine-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    doc_open_dt: dateStr(), pos_discounts_are_used: 1,
    is_reserved: true, trade_object_id: TRADE_OBJECT,
  };
  let resp;
  try { resp = await jpost(KIL_BASE + '/processsale?h=' + KILBIL_KEY, body); }
  catch (e) { return null; }
  let acts = resp.applied_actions;
  if (typeof acts === 'string') { try { acts = JSON.parse(acts); } catch { acts = []; } }
  return Array.isArray(acts) && acts.length ? acts[0] : null;
}

// ── main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('=== Акции Интернет-магазина: MoySklad → Эвотор → Kilbil ===\n');

  const [evoMap, msRows] = await Promise.all([buildEvotorMap(), loadMoySklad()]);

  const matched = []; let noUuid = 0;
  for (const r of msRows) {
    const uuid = evoMap[r.article];
    if (uuid) matched.push({ ...r, uuid }); else noUuid++;
  }
  console.log('[match] с UUID:', matched.length, '| без UUID:', noUuid, '\n');

  const uuidToProduct = {};
  for (const m of matched) uuidToProduct[m.uuid] = m;

  // ── ДИАГНОСТИКА: почему не применяется Мясное воскресенье / Колбасный вторник ──
  if (process.env.DIAG) {
    const re = new RegExp(process.env.DIAG_FOLDER || 'Мяс|Свинин|Говядин|Колбас', 'i');
    const sample = matched.filter((m) => re.test(m.folder)).slice(0, 6);
    console.log('\n[diag] пробиваем по одному (client_id=' + CLIENT_ID + ', дата=' + dateStr() + '):');
    for (const m of sample) {
      const body = {
        client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0,
        goods_data: [{ code: m.uuid, vendor_code: '', name: '', price: m.price, quantity: 1,
          total: m.price, discounted_price: m.price, discounted_total: m.price }],
        move_id: 'diag-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        doc_open_dt: dateStr(), pos_discounts_are_used: 1, is_reserved: true, trade_object_id: TRADE_OBJECT,
      };
      let resp;
      try { resp = await jpost(KIL_BASE + '/processsale?h=' + KILBIL_KEY, body); }
      catch (e) { console.log('  ', m.article, 'ERR', e.message); continue; }
      const it = resp._bill_data && resp._bill_data.items ? resp._bill_data.items[0] : {};
      console.log('\n  •', m.article, '|', m.folder, '|', m.name);
      console.log('    discount:', it && it.discount, '| bonus_in:', it && it.bonus_in, '| applied_actions:', JSON.stringify(resp.applied_actions));
      console.log('    _bill_data bonus_in:', resp._bill_data && resp._bill_data.bonus_in, '| total bonus_out:', resp._bill_data && resp._bill_data.bonus_out);
      console.log('    cashier_messages:', JSON.stringify(resp.cashier_messages));
      console.log('    _responds_quantities_rests_messages:', JSON.stringify(resp._responds_quantities_rests_messages));
      console.log('    possible_action_payment:', JSON.stringify(resp.possible_action_payment));
      // getactionslist по этому же UUID — видит ли акцию на товаре
      try {
        const ga = await jpost(KIL_BASE + '/getactionslist?h=' + KILBIL_KEY,
          { trade_object_id: TRADE_OBJECT, goods: [{ article: m.uuid, price: m.price, count: 1 }] });
        console.log('    getactionslist.goods:', JSON.stringify(ga.goods));
        console.log('    getactionslist.actions:', (ga.actions || []).map((a) => a.id + '=' + a.action).join(' | '));
      } catch (e) { console.log('    getactionslist err:', e.message); }
      // Первый товар с bonus_in — полный дамп всех полей ответа (ищем имя бонусной акции)
      if ((it && it.bonus_in > 0) && !global._bdump) {
        global._bdump = true;
        console.log('\n    [FULL DUMP] все ключи ответа:', Object.keys(resp).join(', '));
        for (const k of Object.keys(resp)) {
          const v = resp[k];
          const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
          if (s && s !== 'null' && s !== '[]' && s !== '{}') console.log('      ' + k + ':', s.slice(0, 400));
        }
      }
    }
    console.log('\n[diag] конец диагностики\n');
  }

  console.log('[processsale] пробиваем чек (chunks по 200)...');
  const { discounted, allActions } = await processsale(matched);
  console.log('Применённые акции (все батчи):', allActions.join(' | ') || 'нет');

  // Уточняем акцию для каждого скидочного товара (одиночный processsale)
  const discUuids = Object.keys(discounted);
  console.log('\n[refine] уточняем акцию по каждому товару (' + discUuids.length + ')...');
  const list = [];
  for (const uuid of discUuids) {
    const p = uuidToProduct[uuid] || { name: '?', article: '?', folder: '?', price: 500 };
    const action = await refineAction(uuid, p.price) || '?';
    list.push({ article: p.article, name: p.name, folder: p.folder, discount: discounted[uuid], action });
    process.stdout.write('.');
  }
  console.log('');

  // Группируем по акции
  const byAction = {};
  for (const it of list) {
    if (!byAction[it.action]) byAction[it.action] = [];
    byAction[it.action].push(it);
  }

  console.log('\n=== РЕЗУЛЬТАТ ПО АКЦИЯМ ===');
  for (const [action, items] of Object.entries(byAction)) {
    console.log('\n● ' + action + ' (' + items.length + '):');
    items.sort((a, b) => a.folder.localeCompare(b.folder));
    items.forEach((p) => console.log('  -' + p.discount + '% |', p.article, '|', p.folder, '|', p.name));
  }

  // Записываем JSON для эндпоинта
  const out = {
    generated_at: new Date().toISOString(),
    applied_actions: allActions,
    count: list.length,
    actions: Object.keys(byAction),
    items: list,   // каждый товар: {article, name, folder, discount, action}
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('\n[ok] записано в', OUT_FILE);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
