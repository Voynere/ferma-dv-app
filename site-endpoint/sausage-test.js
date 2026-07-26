#!/usr/bin/env node
// Проверка «Колбасного вторника» (72267) с датой вторника (16.06.2026).
// Берём колбасные товары, ищем их UUID в Эвоторе, пробиваем processsale.
const EVOTOR_KEY = process.env.EVOTOR_KEY || '';
const KILBIL_KEY = process.env.KILBIL_KEY || '';
const CLIENT_ID  = '31117526';
const TRADE_OBJECT = 1051821;
const TUESDAY = '16.06.2026 12:00:00';
// Колбасные изделия (артикулы из каталога)
const ARTICLES = ['01218', '525828', '01236', '01206', '01827', '01271', '01858'];

const EVO_BASE = 'https://api.evotor.ru';
const KIL = 'https://bonus.kilbil.ru/load';

async function evotorUuids(want) {
  const EH = { Authorization: 'Bearer ' + EVOTOR_KEY, Accept: 'application/vnd.evotor.v2+json' };
  const stores = await (await fetch(EVO_BASE + '/stores', { headers: EH })).json();
  const set = new Set(want.map(String));
  const found = {};
  for (const store of stores.items) {
    let cursor = '';
    do {
      let url = EVO_BASE + '/stores/' + store.id + '/products?limit=500';
      if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
      const data = await (await fetch(url, { headers: EH })).json();
      for (const it of (data.items || [])) {
        const code = String(it.code || it.article_number || '').trim();
        if (set.has(code) && !found[code]) found[code] = { uuid: it.id, name: it.name };
      }
      cursor = data.paging && data.paging.next_cursor ? data.paging.next_cursor : '';
      if (Object.keys(found).length === set.size) return found;
    } while (cursor);
  }
  return found;
}

async function run() {
  console.log('Ищем UUID колбасных товаров...');
  const map = await evotorUuids(ARTICLES);
  const entries = Object.entries(map);
  if (!entries.length) { console.log('UUID не найдены'); return; }

  const goods_data = entries.map(([art, v]) => ({
    code: v.uuid, vendor_code: '', name: '', price: 500, quantity: 1,
    total: 500, discounted_price: 500, discounted_total: 500,
  }));
  const body = {
    client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0,
    goods_data, move_id: 's' + Date.now(), doc_open_dt: TUESDAY,
    pos_discounts_are_used: 1, is_reserved: true, trade_object_id: TRADE_OBJECT,
  };
  const r = await (await fetch(KIL + '/processsale?h=' + KILBIL_KEY, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })).json();

  console.log('Дата чека:', TUESDAY, '(вторник)');
  console.log('applied_actions:', JSON.stringify(r.applied_actions));
  const items = r._bill_data?.items || [];
  items.forEach((it, i) => {
    const [art, v] = entries[i] || ['?', { name: '?' }];
    console.log('  ' + art + ' | disc:', it.discount, '| bonus:', it.bonus_in, '|', v.name);
  });
}
run().catch((e) => console.log('err', e.message));
