// Bộ kết xuất dùng chung cho website, kiểm tra liên kết và xuất PDF.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../lib/marked.min.js').marked);
  } else {
    root.GuideMarkdown = factory(root.marked);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (marked) {
  'use strict';

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slug(text) {
    return text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}_\s-]/gu, '')
      .trim().replace(/\s/g, '-');
  }

  function parse(md) {
    var references = Object.create(null);
    var fenced = false;
    var lines = md.split('\n').map(function (line) {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      var definition = /^\[\^([^\]]+)\]:\s*(.+)$/.exec(line);
      if (definition) {
        references[definition[1]] = definition[2];
        return '';
      }
      return line;
    });
    fenced = false;
    var source = lines.map(function (line) {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      return line.split(/(`+[^`]*`+)/).map(function (part, index) {
        if (index % 2) return part;
        return part.replace(/\[\^([^\]]+)\]/g, function (match, key) {
          if (!references[key]) return match;
          return '<sup><a href="#ref-' + encodeURIComponent(key) + '">[' + escapeHtml(key) + ']</a></sup>';
        });
      }).join('');
    }).join('\n');
    var html = marked.parse(source, { gfm: true, breaks: false, pedantic: false });
    // Translated documents carry their original anchors. New sections get
    // readable Unicode anchors, so ordinary Markdown links also work.
    var used = Object.create(null);
    var existing = new Set(Array.from(html.matchAll(/(?:id|name)="([^"]+)"/g), function (m) { return m[1]; }));
    html = html.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, function (_, tag, text) {
      var base = slug(text);
      var n = used[base] || 0;
      used[base] = n + 1;
      var id = base + (n ? '-' + n : '');
      while (existing.has(id)) id = 'vi-' + id;
      existing.add(id);
      return '<' + tag + ' id="' + escapeHtml(id) + '">' + text + '</' + tag + '>';
    });
    var keys = Object.keys(references);
    if (keys.length) {
      html += '<section class="guide-references"><h2 id="nguon-trich-dan">Nguồn trích dẫn</h2><ol>';
      keys.forEach(function (key) {
        html += '<li id="ref-' + encodeURIComponent(key) + '"><strong>[' + escapeHtml(key) + ']</strong> ' +
          marked.parseInline(references[key], { gfm: true }) + '</li>';
      });
      html += '</ol></section>';
    }
    return html;
  }
  return { parse: parse };
});
