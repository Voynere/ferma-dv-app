#!/usr/bin/env node
/**
 * Тест активации промокодовой акции (Мясное воскресенье, группа 5830)
 * без реального промокода — перебор вариантов promo_codes в processsale.
 *
 * Товар 21288 (Борщевой набор говяжий) точно в списке акции 62008.
 * Запуск: node promo-test.js
 */
const EVOTOR_KEY = process.env.EVOTOR_KEY || '';
const KILBIL_KEY = process.env.KILBIL_KEY || '';
const CLIENT_ID  = '31117526';
const TRADE_OBJECT = 1051821;
const TEST_ARTICLES = ['21288', '525690', '525692']; // товары из акции «Мясное воскресенье»

const EVO_BASE = 'https://api.evotor.ru';
const KIL = 'https://bonus.kilbil.ru/load';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jpost(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}

async function evotorUuids(articles) {
  const EH = { Authorization: 'Bearer ' + EVOTOR_KEY, Accept: 'application/vnd.evotor.v2+json' };
  const stores = await (await fetch(EVO_BASE + '/stores', { headers: EH })).json();
  const want = new Set(articles.map(String));
  const found = {};
  for (const store of stores.items) {
    let cursor = '';
    do {
      let url = EVO_BASE + '/stores/' + store.id + '/products?limit=500';
      if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
      const data = await (await fetch(url, { headers: EH })).json();
      for (const it of (data.items || [])) {
        const code = String(it.code || it.article_number || '').trim();
        if (want.has(code) && !found[code]) found[code] = it.id;
      }
      cursor = data.paging && data.paging.next_cursor ? data.paging.next_cursor : '';
      if (Object.keys(found).length === want.size) return found;
    } while (cursor);
  }
  return found;
}

function baseSale(uuid, price, extra) {
  return Object.assign({
    client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0,
    goods_data: [{ code: uuid, vendor_code: '', name: '', price, quantity: 1, total: price, discounted_price: price, discounted_total: price }],
    move_id: 'promotest-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    doc_open_dt: '14.06.2026 12:00:00', pos_discounts_are_used: 1, is_reserved: true, trade_object_id: TRADE_OBJECT,
  }, extra);
}

async function run() {
  console.log('[evotor] ищем UUID для', TEST_ARTICLES.join(', '), '...');
  const map = await evotorUuids(TEST_ARTICLES);
  console.log('[evotor] найдено:', JSON.stringify(map), '\n');

  const uuid = map['21288'] || Object.values(map)[0];
  if (!uuid) { console.log('UUID не найден'); return; }
  const price = 500;

  // searchpromocode — пробуем форматы и значения
  console.log('=== searchpromocode ===');
  for (const body of [
    { promocode: '0' }, { promo_code: '0' }, { code: '0' },
    { search_value: '0', search_mode: 0 }, { promocode: '5830' },
  ]) {
    try {
      const r = await jpost(KIL + '/searchpromocode?h=' + KILBIL_KEY, body);
      console.log(JSON.stringify(body), '→', r.result_code, r.result_text || '');
    } catch (e) { console.log(JSON.stringify(body), 'err', e.message); }
    await sleep(300);
  }

  // processsale — перебор promo_codes
  console.log('\n=== processsale, товар 21288 (price ' + price + ') ===');
  const variants = [
    ['baseline (без promo_codes)', {}],
    ['promo_codes: []', { promo_codes: [] }],
    ['promo_codes: ["0"]', { promo_codes: ['0'] }],
    ['promo_codes: [0]', { promo_codes: [0] }],
    ['promo_codes: ["5830"]', { promo_codes: ['5830'] }],
    ['promo_codes: [5830]', { promo_codes: [5830] }],
    ['promo_codes: [{group_id:5830}]', { promo_codes: [{ group_id: 5830 }] }],
    ['prom: "0"', { prom: '0' }],
    ['promocode: "0"', { promocode: '0' }],
  ];
  for (const [label, extra] of variants) {
    try {
      const r = await jpost(KIL + '/processsale?h=' + KILBIL_KEY, baseSale(uuid, price, extra));
      const it = r._bill_data && r._bill_data.items ? r._bill_data.items[0] : {};
      console.log(label.padEnd(34), '→ disc:', (it && it.discount) || 0, '| applied:', JSON.stringify(r.applied_actions), '| rc:', r.result_code, r.result_text || '');
    } catch (e) { console.log(label, 'err', e.message); }
    await sleep(400);
  }
}
run().catch((e) => console.error('FATAL', e.message));
