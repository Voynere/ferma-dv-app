#!/usr/bin/env node
// Проверка: учитывает ли Kilbil doc_open_dt для дня недели акции.
// Шлём дату ВТОРНИКА (16.06.2026). Сегодня реально воскресенье.
//   • Мясной товар (акция = вс): если скидка ЕСТЬ → Kilbil смотрит реальную дату (вс), не doc_open_dt.
//                                 если скидки НЕТ → Kilbil смотрит doc_open_dt (вт).
//   • Колбасный товар (акция = вт): если скидка ЕСТЬ → doc_open_dt учитывается, колбасный работает.
const EVOTOR_KEY = process.env.EVOTOR_KEY || '';
const KILBIL_KEY = process.env.KILBIL_KEY || '';
const CLIENT_ID  = '31117526';
const TRADE_OBJECT = 1051821;
const DATE = '16.06.2026 12:00:00'; // вторник
const TESTS = [
  { art: '21288', label: 'МЯСНОЙ (акция вс) — Борщевой набор' },
  { art: '525828', label: 'КОЛБАСНЫЙ (акция вт) — Ветчина для завтрака' },
  { art: '01236', label: 'КОЛБАСНЫЙ (акция вт) — Ветчина в оболочке' },
];

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
        if (set.has(code) && !found[code]) found[code] = it.id;
      }
      cursor = data.paging && data.paging.next_cursor ? data.paging.next_cursor : '';
      if (Object.keys(found).length === set.size) return found;
    } while (cursor);
  }
  return found;
}

async function probe(uuid, date) {
  const body = {
    client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0,
    goods_data: [{ code: uuid, vendor_code: '', name: '', price: 500, quantity: 1, total: 500, discounted_price: 500, discounted_total: 500 }],
    move_id: 'd' + Date.now() + Math.random().toString(36).slice(2, 5), doc_open_dt: date,
    pos_discounts_are_used: 1, is_reserved: true, trade_object_id: TRADE_OBJECT,
  };
  const r = await (await fetch(KIL + '/processsale?h=' + KILBIL_KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
  const it = r._bill_data?.items?.[0] || {};
  return { disc: it.discount, applied: r.applied_actions };
}

async function run() {
  const map = await evotorUuids(TESTS.map((t) => t.art));
  console.log('Дата чека:', DATE, '(вторник). Сегодня реально — воскресенье.\n');
  for (const t of TESTS) {
    const uuid = map[t.art];
    if (!uuid) { console.log(t.label, '— UUID не найден'); continue; }
    const r = await probe(uuid, DATE);
    console.log(t.label + ':\n  disc:', r.disc, '| applied:', JSON.stringify(r.applied), '\n');
  }
}
run().catch((e) => console.log('err', e.message));
