#!/usr/bin/env node
// Быстрая проверка: применяется ли «Мясное воскресенье» после удаления промокода-условия.
const KEY = process.env.KILBIL_KEY || '';
const uuids = [
  'c4857d36-d482-482a-87f5-7c1d0f9997b3', // 21288 Борщевой набор говяжий
  '51e7a514-e174-45fb-90f4-dbbf525fd846', // 525690 Кости сахарные говяжьи
  'cc6fdf3c-f560-43d3-a7fc-ad95715efe84', // 525692 Язык говяжий
];
const goods_data = uuids.map((u) => ({
  code: u, vendor_code: '', name: '', price: 500, quantity: 1,
  total: 500, discounted_price: 500, discounted_total: 500,
}));
const body = {
  client_id: '31117526', type: 0, bonus_out: 0, max_bonus_out: 0,
  goods_data, move_id: 't' + Date.now(), doc_open_dt: '14.06.2026 12:00:00',
  pos_discounts_are_used: 1, is_reserved: true, trade_object_id: 1051821,
};
fetch('https://bonus.kilbil.ru/load/processsale?h=' + KEY, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}).then((r) => r.json()).then((d) => {
  console.log('applied_actions:', JSON.stringify(d.applied_actions));
  console.log('_applied_actions:', JSON.stringify(d._applied_actions));
  console.log('cashier_messages:', JSON.stringify(d.cashier_messages));
  console.log('_bill_body:', JSON.stringify(d._bill_body));
  (d._bill_data?.items || []).forEach((it) =>
    console.log(it.code.slice(0, 8), '| disc:', it.discount, '| bonus_in:', it.bonus_in));
}).catch((e) => console.log('err', e.message));
