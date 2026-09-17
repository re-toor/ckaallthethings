// Kiểm tra nội dung và liên kết hoàn toàn ngoại tuyến: node tools/check-docs.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const markdown = require('../js/markdown.js');
const root = path.resolve(__dirname, '..');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = {};
vm.runInNewContext(read('js/data.js') + ';this.data={GUIDE_LINKS,MIND_MAP_DATA}', context);
const { GUIDE_LINKS, MIND_MAP_DATA } = context.data;
const registry = Object.fromEntries([...read('js/guide.js').matchAll(/'([^']+)':\s*\{\s*file:\s*'\.\.\/([^']+)'/g)].map(m => [m[1], m[2]]));
const documents = ['README.md', ...Object.values(registry), ...fs.readdirSync(path.join(root, 'docs')).filter(f => f.endsWith('.md')).map(f => 'docs/' + f)];
const rendered = new Map();
const ids = new Map();
for (const file of new Set(documents)) {
  const md = read(file);
  check(!/ZXQ\d+QXZ|ZSEG\d+|\uFFFD/.test(md), `${file}: ký tự/placeholder chưa xử lý`);
  check((md.match(/^\s*```/gm) || []).length % 2 === 0, `${file}: khối mã chưa đóng`);
  const html = markdown.parse(md);
  rendered.set(file, html);
  const anchors = [...html.matchAll(/(?:id|name)="([^"]+)"/g)].map(m => m[1]);
  ids.set(file, new Set(anchors));
  const duplicates = anchors.filter((id, i) => anchors.indexOf(id) !== i);
  check(!duplicates.length, `${file}: anchor trùng: ${[...new Set(duplicates)].join(', ')}`);
}
let linkCount = 0;
function checkLink(source, href) {
  if (/^(https?:|mailto:|data:)/.test(href)) return;
  const [rawFile, rawHash] = href.split('#');
  let target = rawFile ? path.posix.normalize(path.posix.join(path.posix.dirname(source), decodeURIComponent(rawFile))) : source;
  // Mind map links use the guide viewer route.
  if (/guide\.html\?/.test(target)) {
    const id = new URLSearchParams(target.split('?')[1]).get('id');
    check(Boolean(registry[id]), `${source}: tài liệu không tồn tại: ${href}`);
    if (!registry[id]) return;
    target = registry[id];
  }
  check(fs.existsSync(path.join(root, target)), `${source}: tệp không tồn tại: ${href}`);
  if (rawHash && ids.has(target)) {
    check(ids.get(target).has(decodeURIComponent(rawHash)), `${source}: anchor không tồn tại: ${href}`);
  }
  linkCount++;
}
for (const [file, html] of rendered) {
  for (const m of html.matchAll(/href="([^"]+)"/g)) checkLink(file, m[1].replace(/&amp;/g, '&'));
}
for (const [key, links] of Object.entries(GUIDE_LINKS)) {
  check(Boolean(MIND_MAP_DATA[key]), `Nhánh liên kết không tồn tại: ${key}`);
  for (const link of links) checkLink('index.html', link.url);
}
let commands = 0;
for (const [key, page] of Object.entries(MIND_MAP_DATA)) {
  if (page.parent) check(Boolean(MIND_MAP_DATA[page.parent]), `Nhánh cha không tồn tại: ${key}`);
  for (const node of page.nodes) {
    if (node.id) check(Boolean(MIND_MAP_DATA[node.id]), `Nhánh con không tồn tại: ${node.id}`);
    commands += (node.commands || []).length;
    for (const command of node.commands || []) {
      check(!/etcdctl snapshot (restore|status)/.test(command), `${key}: lệnh etcd cũ`);
      check(!/kubeadm upgrade (?:apply|diff) v1\.(?:3[0-4])\./.test(command), `${key}: đích nâng cấp cũ`);
    }
  }
}
check(MIND_MAP_DATA.main.nodes.reduce((sum, node) => sum + parseInt(node.weight), 0) === 100, 'Tỷ trọng CKA phải bằng 100%');
for (const file of ['index.html', 'pages/guide.html']) check(/<html lang="vi">/.test(read(file)), `${file}: thiếu lang=vi`);
check(new RegExp('(?<![\\p{L}\\p{N}_])cụm(?![\\p{L}\\p{N}_])', 'giu').test('quản trị cụm'), 'Tìm từ tiếng Việt');
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`${errors.length} lỗi`);
  process.exitCode = 1;
} else {
  console.log(`Đạt: ${rendered.size} tài liệu, ${Object.keys(MIND_MAP_DATA).length} trang mindmap, ${commands} lệnh, ${linkCount} liên kết nội bộ.`);
}
