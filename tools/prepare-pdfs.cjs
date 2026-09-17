// Chuẩn bị nội dung PDF từ đúng bộ kết xuất Markdown của website, không cần mạng.
const fs = require('node:fs');
const path = require('node:path');
const markdown = require('../js/markdown.js');
const root = path.resolve(__dirname, '..');
const outputs = [];
for (const name of ['kubernetes-complete-guide', 'linux-network-commands']) {
  let html = markdown.parse(fs.readFileSync(path.join(root, 'guides', name + '.md'), 'utf8'));
  if (name === 'kubernetes-complete-guide') {
    html += '<hr>' + markdown.parse(fs.readFileSync(path.join(root, 'guides/kubernetes-1.35-update.md'), 'utf8'));
  }
  outputs.push({ name, html });
}
fs.mkdirSync(path.join(root, 'tmp/pdfs'), { recursive: true });
fs.writeFileSync(path.join(root, 'tmp/pdfs/content.json'), JSON.stringify(outputs));
console.log('Đã chuẩn bị tmp/pdfs/content.json');
