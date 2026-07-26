#!/usr/bin/env node
// Проверка содержимого actions.json: что в каждой акции, сколько товаров.
fetch('http://localhost:8474/actions.json').then((r) => r.json()).then((j) => {
  console.log('status:', j.status, '| день недели:', j.day_of_week, '| всего позиций:', j.count, '\n');
  const groups = {};
  (j.items || []).forEach((i) => { (groups[i.action] = groups[i.action] || []).push(i); });
  for (const [action, list] of Object.entries(groups)) {
    console.log('=== ' + action + ': ' + list.length + ' товаров (' + list[0].value + '%) ===');
    list.sort((a, b) => a.folder.localeCompare(b.folder));
    list.forEach((i) => console.log('  ' + i.article + ' | ' + i.folder + ' | ' + i.name));
    console.log('');
  }
}).catch((e) => console.log('err', e.message));
