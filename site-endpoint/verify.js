#!/usr/bin/env node
/**
 * Проверка полноты: прогоняет весь каталог через processsale заданным размером чека
 * и считает товары по акциям. Сравни результат при разных CHUNK — если число растёт
 * при уменьшении чека, значит Kilbil режет акционные позиции на чек.
 *
 * Запуск:  CHUNK=3 node verify.js     (по умолчанию 3)
 */
const MS_TOKEN   = process.env.MOYSKLAD_TOKEN || '';
const EVOTOR_KEY = process.env.EVOTOR_KEY || '';
const KILBIL_KEY = process.env.KILBIL_KEY || '';
const CLIENT_ID  = '31117526';
const TRADE_OBJECT = 1051821;
const CHUNK = Number(process.env.CHUNK) || 3;

const MS_BASE  = 'https://api.moysklad.ru/api/remap/1.2';
const EVO_BASE = 'https://api.evotor.ru';
const KIL = 'https://bonus.kilbil.ru/load';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jget(url, headers, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { headers }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
    catch (e) { if (i === tries - 1) throw e; await sleep(1200); }
  }
}
async function jpost(url, body, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
    catch (e) { if (i === tries - 1) throw e; await sleep(1200); }
  }
}

async function evotorMap() {
  const EH = { Authorization: 'Bearer ' + EVOTOR_KEY, Accept: 'application/vnd.evotor.v2+json' };
  const stores = await jget(EVO_BASE + '/stores', EH);
  const m = {};
  for (const s of stores.items) {
    let cursor = '', pages = 0;
    do {
      let url = EVO_BASE + '/stores/' + s.id + '/products?limit=500';
      if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
      const d = await jget(url, EH);
      for (const it of (d.items || [])) {
        if (it.code) m[String(it.code).trim()] = it.id;
        if (it.article_number) m[String(it.article_number).trim()] = it.id;
      }
      cursor = d.paging && d.paging.next_cursor ? d.paging.next_cursor : '';
      pages++;
    } while (cursor && pages < 100);
  }
  return m;
}
async function loadMS() {
  const AUTH = { Authorization: 'Bearer ' + MS_TOKEN };
  const rows = []; let offset = 0;
  while (true) {
    const d = await jget(MS_BASE + '/entity/assortment?limit=1000&offset=' + offset, AUTH);
    rows.push(...(d.rows || []));
    if (rows.length >= d.meta.size) break;
    offset += 1000;
  }
  return rows.map((r) => ({ article: r.article ? String(r.article).trim() : '', name: r.name || '', folder: r.pathName || '' })).filter((r) => r.article);
}
function dstr() { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); }

(async () => {
  console.log('CHUNK =', CHUNK, '\n');
  const [evo, ms] = await Promise.all([evotorMap(), loadMS()]);
  const matched = [];
  for (const r of ms) { const u = evo[r.article]; if (u) matched.push({ ...r, uuid: u }); }
  console.log('товаров с UUID:', matched.length, 'из', ms.length);

  const byPct = {}; // процент → count
  let processed = 0;
  for (let i = 0; i < matched.length; i += CHUNK) {
    const batch = matched.slice(i, i + CHUNK);
    const goods_data = batch.map((x) => ({ code: x.uuid, vendor_code: '', name: '', price: 500, quantity: 1, total: 500, discounted_price: 500, discounted_total: 500 }));
    let resp;
    try { resp = await jpost(KIL + '/processsale?h=' + KILBIL_KEY, { client_id: CLIENT_ID, type: 0, bonus_out: 0, max_bonus_out: 0, goods_data, move_id: 'v' + Date.now() + '-' + i, doc_open_dt: dstr(), pos_discounts_are_used: 1, is_reserved: true, trade_object_id: TRADE_OBJECT }); }
    catch (e) { continue; }
    const items = resp._bill_data?.items || [];
    items.forEach((it) => {
      const pct = it.price > 0 && it.discounted_price < it.price ? Math.round(((it.price - it.discounted_price) / it.price) * 100) : 0;
      if (pct > 0) byPct[pct] = (byPct[pct] || 0) + 1;
    });
    processed += batch.length;
    if (i % 300 === 0) process.stdout.write('.');
  }
  console.log('\n\nобработано:', processed);
  console.log('товаров со скидкой по проценту:');
  for (const [pct, n] of Object.entries(byPct).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log('  -' + pct + '%: ' + n + ' товаров');
  }
})().catch((e) => console.log('FATAL', e.message));
