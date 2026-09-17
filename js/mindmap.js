// Sơ đồ tư duy CKA Renderer
// Uses D3.js for SVG manipulation with CSS-based animations

(function () {
  'use strict';

  var NODE_PADDING = 16;

  function getPageKey() {
    var hash = window.location.hash.slice(1);
    return hash || 'main';
  }

  function setPageKey(key) {
    window.location.hash = key;
  }

  // Support ?page= query parameter for deep linking (survives URL shortener redirects
  // where hash fragments like #rbac get stripped). On load, convert ?page=X to #X.
  (function handleQueryParamDeepLink() {
    var params = new URLSearchParams(window.location.search);
    var page = params.get('page');
    if (page && MIND_MAP_DATA[page]) {
      // Replace URL: remove ?page= param and set the hash instead
      params.delete('page');
      var cleanSearch = params.toString();
      var newUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + '#' + page;
      window.history.replaceState(null, '', newUrl);
    }
  })();

  // Render breadcrumbs
  function renderBreadcrumbs(pageData, pageKey) {
    var breadcrumbEl = document.getElementById('breadcrumbs');
    if (!breadcrumbEl) return;

    var crumbs = [];
    var current = pageKey;
    var data = pageData;

    while (data) {
      crumbs.unshift({ key: current, title: data.title });
      if (data.parent) {
        current = data.parent;
        data = MIND_MAP_DATA[current];
      } else {
        break;
      }
    }

    breadcrumbEl.innerHTML = '';
    // On deep paths (3+ items), mark early items so mobile can hide them
    var hideOnMobile = crumbs.length > 2;

    crumbs.forEach(function (crumb, i) {
      // Items before the last 2 get hidden on mobile
      var isEarlyItem = hideOnMobile && i < crumbs.length - 2;

      if (i > 0) {
        var sep = document.createElement('span');
        sep.className = 'breadcrumb-sep' + (isEarlyItem ? ' breadcrumb-early' : '');
        sep.textContent = '\u203A';
        breadcrumbEl.appendChild(sep);
      }

      if (i < crumbs.length - 1) {
        var link = document.createElement('a');
        link.href = '#' + crumb.key;
        link.className = 'breadcrumb-link' + (isEarlyItem ? ' breadcrumb-early' : '');
        link.textContent = crumb.title;
        breadcrumbEl.appendChild(link);
      } else {
        var span = document.createElement('span');
        span.className = 'breadcrumb-current';
        span.textContent = crumb.title;
        breadcrumbEl.appendChild(span);
      }
    });
  }

  function renderSubtitle(pageData, pageKey) {
    var subtitleEl = document.getElementById('subtitle');
    if (subtitleEl && pageData.subtitle) {
      subtitleEl.textContent = pageData.subtitle;
    }

    // Add study guide links in subtitle bar for sub-topic pages
    if (subtitleEl && typeof GUIDE_LINKS !== 'undefined' && GUIDE_LINKS[pageKey]) {
      var guideBtn = document.createElement('a');
      guideBtn.className = 'subtitle-guide-link';
      guideBtn.href = '#';
      guideBtn.innerHTML = '&#128218; Xem tài liệu liên quan';
      guideBtn.addEventListener('click', function (e) {
        e.preventDefault();
        showGuideLinksPanel(pageKey);
      });
      subtitleEl.appendChild(document.createTextNode('  '));
      subtitleEl.appendChild(guideBtn);
    }
  }

  function showGuideLinksPanel(pageKey) {
    var links = GUIDE_LINKS[pageKey];
    if (!links || !links.length) return;

    closeDetailPanel();

    var overlay = document.createElement('div');
    overlay.className = 'detail-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDetailPanel();
    });

    var panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.style.borderTopColor = '#FF9800';

    // Fixed top section (non-scrollable)
    var panelTop = document.createElement('div');
    panelTop.className = 'detail-panel-top';

    var header = document.createElement('div');
    header.className = 'detail-header';
    var title = document.createElement('h2');
    title.textContent = 'Tài liệu ôn tập';
    title.style.color = '#FF9800';
    header.appendChild(title);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'detail-close';
    closeBtn.textContent = '\u2715';
    closeBtn.addEventListener('click', closeDetailPanel);
    header.appendChild(closeBtn);
    panelTop.appendChild(header);

    var desc = document.createElement('p');
    desc.className = 'detail-description';
    desc.textContent = 'Tài liệu kỹ thuật chuyên sâu liên quan đến chủ đề này.';
    panelTop.appendChild(desc);

    panel.appendChild(panelTop);

    // Scrollable body section
    var panelBody = document.createElement('div');
    panelBody.className = 'detail-panel-body';

    var section = document.createElement('div');
    section.className = 'detail-section';

    var list = document.createElement('ul');
    list.className = 'detail-references';
    links.forEach(function (g) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      // Append from= parameter so guide page can link back
      var guideUrl = g.url;
      var separator = guideUrl.indexOf('?') !== -1 ? '&' : '?';
      var hashParts = guideUrl.split('#');
      guideUrl = hashParts[0] + separator + 'from=' + encodeURIComponent(pageKey);
      if (hashParts[1]) guideUrl += '#' + hashParts[1];
      a.href = guideUrl;
      a.textContent = g.title;
      a.className = 'detail-ref-link';
      a.style.color = '#FF9800';
      li.appendChild(a);

      var guideLabel = document.createElement('span');
      guideLabel.className = 'detail-ref-url';
      guideLabel.textContent = g.guide;
      li.appendChild(guideLabel);

      list.appendChild(li);
    });
    section.appendChild(list);
    panelBody.appendChild(section);

    // Add links to full guides
    var fullSection = document.createElement('div');
    fullSection.className = 'detail-section';
    var fullTitle = document.createElement('h3');
    fullTitle.textContent = 'Tài liệu đầy đủ';
    fullSection.appendChild(fullTitle);

    var fullList = document.createElement('ul');
    fullList.className = 'detail-references';

    var k8sLi = document.createElement('li');
    var k8sA = document.createElement('a');
    k8sA.href = 'pages/guide.html?id=kubernetes&from=' + encodeURIComponent(pageKey);
    k8sA.textContent = 'Tài liệu Kubernetes đầy đủ cho CKA';
    k8sA.className = 'detail-ref-link';
    k8sLi.appendChild(k8sA);
    var k8sDesc = document.createElement('span');
    k8sDesc.className = 'detail-ref-url';
    k8sDesc.textContent = '30 chương bao quát các lĩnh vực trong đề cương CKA';
    k8sLi.appendChild(k8sDesc);
    fullList.appendChild(k8sLi);

    var linLi = document.createElement('li');
    var linA = document.createElement('a');
    linA.href = 'pages/guide.html?id=linux-networking&from=' + encodeURIComponent(pageKey);
    linA.textContent = 'Tra cứu đầy đủ lệnh mạng Linux';
    linA.className = 'detail-ref-link';
    linLi.appendChild(linA);
    var linDesc = document.createElement('span');
    linDesc.className = 'detail-ref-url';
    linDesc.textContent = '56 mục tra cứu lệnh mạng Linux';
    linLi.appendChild(linDesc);
    fullList.appendChild(linLi);

    fullSection.appendChild(fullList);
    panelBody.appendChild(fullSection);

    panel.appendChild(panelBody);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    setTimeout(function () { overlay.classList.add('active'); }, 20);
  }

  // Measure text width using a hidden SVG text element for accuracy
  var measureSvg = null;
  var measureText = null;
  function measureTextWidth(text, fontSize, fontWeight) {
    if (!measureSvg) {
      measureSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      measureSvg.style.position = 'absolute';
      measureSvg.style.visibility = 'hidden';
      measureSvg.style.height = '0';
      measureSvg.style.width = '0';
      document.body.appendChild(measureSvg);
      measureText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      measureSvg.appendChild(measureText);
    }
    measureText.setAttribute('font-size', fontSize);
    measureText.setAttribute('font-weight', fontWeight || '600');
    measureText.setAttribute('font-family', "'Inter', sans-serif");
    measureText.textContent = text;
    return measureText.getBBox().width;
  }

  function getTextSize(text, fontSize) {
    var lines = text.split('\n');
    var maxWidth = 0;
    lines.forEach(function (line) {
      var w = measureTextWidth(line, fontSize, '600');
      if (w > maxWidth) maxWidth = w;
    });
    return {
      width: maxWidth + NODE_PADDING * 2.5,
      height: lines.length * (fontSize + 4) + NODE_PADDING * 2
    };
  }

  function isLeafNode(node) {
    return !node.id && (node.keyPoints || node.commands || node.description);
  }

  function hasSubPage(node) {
    return node.id && MIND_MAP_DATA[node.id];
  }

  // Main render function
  function renderMindMap(pageKey) {
    var pageData = MIND_MAP_DATA[pageKey];
    if (!pageData) {
      pageKey = 'main';
      pageData = MIND_MAP_DATA['main'];
    }

    renderBreadcrumbs(pageData, pageKey);
    renderSubtitle(pageData, pageKey);
    closeDetailPanel();

    var container = document.getElementById('mindmap-container');
    container.innerHTML = '';

    var width = container.clientWidth;
    var height = container.clientHeight;

    var svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    var defs = svg.append('defs');

    // Glow filter
    var glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    var feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Drop shadow
    var shadow = defs.append('filter').attr('id', 'shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    shadow.append('feDropShadow').attr('dx', '0').attr('dy', '2').attr('stdDeviation', '3').attr('flood-color', 'rgba(0,0,0,0.4)');

    var centerX = width / 2;
    var centerY = height / 2;

    var nodes = pageData.nodes;
    var numNodes = nodes.length;
    var domainColor = pageData.domainColor || '#326CE5';

    var g = svg.append('g').attr('class', 'mindmap-group');

    // Compute center circle size first so branch orbit can account for it
    var centerFontSize = pageKey === 'main' ? 15 : 13;
    var centerLines = [];
    if (pageData.title.length > 20) {
      var words = pageData.title.split(' ');
      var line = '';
      words.forEach(function (w) {
        if ((line + ' ' + w).length > 18 && line) {
          centerLines.push(line);
          line = w;
        } else {
          line = line ? line + ' ' + w : w;
        }
      });
      if (line) centerLines.push(line);
    } else {
      centerLines = [pageData.title];
    }

    // Calculate center circle radius based on both text height AND width
    var centerTextHeight = centerLines.length * 18;
    var maxLineWidth = 0;
    centerLines.forEach(function (line) {
      var w = measureTextWidth(line.trim(), centerFontSize, 'bold');
      if (w > maxLineWidth) maxLineWidth = w;
    });
    var halfW = maxLineWidth / 2 + 10;
    var halfH = centerTextHeight / 2 + 6;
    var radiusFromText = Math.sqrt(halfW * halfW + halfH * halfH) + 4;
    var centerR = Math.max(radiusFromText, 45);

    // Branch orbit radius: ensure minimum gap between center circle edge and branch nodes
    var minGap = 130;
    var maxRadius = Math.min(width, height) * 0.42;
    var radius = Math.max(centerR + minGap, Math.min(maxRadius, Math.max(numNodes * 55, 280)));

    // Compute branch node positions around the center
    var nodePositions = [];
    nodes.forEach(function (node, i) {
      var angle = (2 * Math.PI * i / numNodes) - Math.PI / 2;
      nodePositions.push({
        angle: angle,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    });

    var centerGroup = g.append('g')
      .attr('class', 'center-node anim-fade')
      .attr('transform', 'translate(' + centerX + ',' + centerY + ')');

    centerGroup.append('circle')
      .attr('r', centerR)
      .attr('fill', pageKey === 'main' ? '#326CE5' : domainColor)
      .attr('fill-opacity', 0.12)
      .attr('stroke', pageKey === 'main' ? '#326CE5' : domainColor)
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    centerLines.forEach(function (line, i) {
      centerGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', (i - (centerLines.length - 1) / 2) * 18 + 5)
        .attr('fill', '#ffffff')
        .attr('font-size', centerFontSize)
        .attr('font-weight', 'bold')
        .text(line.trim());
    });

    // Now draw connections starting from the edge of the center circle
    nodes.forEach(function (node, i) {
      var pos = nodePositions[i];
      // Start point: edge of center circle along the direction to the target node
      var startX = centerX + (centerR + 4) * Math.cos(pos.angle);
      var startY = centerY + (centerR + 4) * Math.sin(pos.angle);
      // Control point for curve
      var mx = centerX + (radius * 0.55) * Math.cos(pos.angle);
      var my = centerY + (radius * 0.55) * Math.sin(pos.angle);

      var path = g.append('path')
        .attr('class', 'connection anim-fade')
        .attr('fill', 'none')
        .attr('stroke', node.color || domainColor)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.4)
        .attr('d', 'M' + startX + ',' + startY + ' Q' + mx + ',' + my + ' ' + pos.x + ',' + pos.y);

      path.node().style.animationDelay = (100 + i * 60) + 'ms';
    });

    // Back button
    if (pageData.parent) {
      var backGroup = svg.append('g')
        .attr('class', 'back-button anim-fade')
        .attr('transform', 'translate(50, 90)')
        .style('cursor', 'pointer')
        .on('click', function () {
          setPageKey(pageData.parent);
        });

      backGroup.append('circle')
        .attr('r', 20)
        .attr('fill', 'rgba(255,255,255,0.06)')
        .attr('stroke', 'rgba(255,255,255,0.25)')
        .attr('stroke-width', 1.5);

      backGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('fill', '#ffffff')
        .attr('font-size', 16)
        .text('\u2190');
    }

    // Branch nodes
    nodes.forEach(function (node, i) {
      var angle = (2 * Math.PI * i / numNodes) - Math.PI / 2;
      var nx = centerX + radius * Math.cos(angle);
      var ny = centerY + radius * Math.sin(angle);

      var fontSize = 12;
      var nameLines = node.name.split('\n');
      var textSize = getTextSize(node.name, fontSize);
      var nodeW = Math.max(textSize.width, 120);
      var nodeH = Math.max(textSize.height, 44);

      if (node.weight) nodeH += 22;
      if (node.description && !node.weight && !isLeafNode(node)) nodeH += 18;

      var nodeColor = node.color || domainColor;
      var isClickable = hasSubPage(node);
      var isLeaf = isLeafNode(node);

      var nodeGroup = g.append('g')
        .attr('class', 'branch-node anim-fade' + (isClickable ? ' clickable' : '') + (isLeaf ? ' leaf' : ''))
        .attr('transform', 'translate(' + nx + ',' + ny + ')')
        .style('cursor', (isClickable || isLeaf) ? 'pointer' : 'default');

      nodeGroup.node().style.animationDelay = (200 + i * 80) + 'ms';

      // Background rect
      nodeGroup.append('rect')
        .attr('x', -nodeW / 2)
        .attr('y', -nodeH / 2)
        .attr('width', nodeW)
        .attr('height', nodeH)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'rgba(22, 27, 34, 0.95)')
        .attr('stroke', nodeColor)
        .attr('stroke-width', 1.8)
        .attr('filter', 'url(#shadow)');

      // Name text
      var textOffsetY = 0;
      if (node.weight) textOffsetY = -8;
      if (node.description && !node.weight && !isLeaf) textOffsetY = -6;

      nameLines.forEach(function (line, li) {
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', textOffsetY + (li - (nameLines.length - 1) / 2) * (fontSize + 3) + fontSize / 3)
          .attr('fill', '#ffffff')
          .attr('font-size', fontSize)
          .attr('font-weight', '600')
          .text(line);
      });

      // Weight badge
      if (node.weight) {
        var badgeY = nodeH / 2 - 14;
        nodeGroup.append('rect')
          .attr('x', -20)
          .attr('y', badgeY - 7)
          .attr('width', 40)
          .attr('height', 14)
          .attr('rx', 7)
          .attr('fill', nodeColor)
          .attr('fill-opacity', 0.25);

        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', badgeY + 3)
          .attr('fill', nodeColor)
          .attr('font-size', 10)
          .attr('font-weight', 'bold')
          .text(node.weight);
      }

      // Description for navigable (non-leaf) nodes
      if (node.description && !node.weight && !isLeaf) {
        var descFontSize = 9.5;
        var maxDescW = nodeW - 16;
        var descText = node.description;
        // Truncate based on measured width
        while (measureTextWidth(descText, descFontSize, '400') > maxDescW && descText.length > 5) {
          descText = descText.slice(0, -1);
        }
        if (descText.length < node.description.length) descText = descText.trim() + '..';
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', nodeH / 2 - 8)
          .attr('fill', 'rgba(255,255,255,0.4)')
          .attr('font-size', descFontSize)
          .text(descText);
      }

      // Arrow indicator for clickable nodes
      if (isClickable) {
        nodeGroup.append('text')
          .attr('x', nodeW / 2 - 14)
          .attr('y', -nodeH / 2 + 13)
          .attr('fill', nodeColor)
          .attr('font-size', 10)
          .attr('fill-opacity', 0.6)
          .text('\u279C');
      }

      // Hover effects via event listeners
      nodeGroup
        .on('mouseenter', function () {
          d3.select(this).select('rect')
            .attr('stroke-width', 3)
            .attr('fill', 'rgba(30, 40, 55, 0.98)');
          if (node.description && (isClickable || isLeaf)) {
            showTooltip(nx, ny + nodeH / 2 + 12, node.description, nodeColor);
          }
        })
        .on('mouseleave', function () {
          d3.select(this).select('rect')
            .attr('stroke-width', 1.8)
            .attr('fill', 'rgba(22, 27, 34, 0.95)');
          hideTooltip();
        });

      // Click actions
      if (isClickable) {
        nodeGroup.on('click', function () {
          hideTooltip();
          setPageKey(node.id);
        });
      } else if (isLeaf) {
        nodeGroup.on('click', function () {
          hideTooltip();
          showDetailPanel(node, nodeColor);
        });
      }
    });
  }

  // Tooltip
  var tooltipEl = null;
  function showTooltip(x, y, text, color) {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'mindmap-tooltip';
      document.getElementById('mindmap-container').appendChild(tooltipEl);
    }
    tooltipEl.textContent = text;
    tooltipEl.style.borderColor = color;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
    tooltipEl.classList.add('visible');
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.classList.remove('visible');
    }
  }

  // Detail panel for leaf nodes
  function showDetailPanel(node, color) {
    closeDetailPanel();

    var overlay = document.createElement('div');
    overlay.className = 'detail-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDetailPanel();
    });

    var panel = document.createElement('div');
    panel.className = 'detail-panel';
    panel.style.borderTopColor = color;

    // Fixed top section (non-scrollable): header + description
    var panelTop = document.createElement('div');
    panelTop.className = 'detail-panel-top';

    // Header
    var header = document.createElement('div');
    header.className = 'detail-header';

    var title = document.createElement('h2');
    title.textContent = node.name.replace(/\n/g, ' ');
    title.style.color = color;
    header.appendChild(title);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'detail-close';
    closeBtn.textContent = '\u2715';
    closeBtn.addEventListener('click', closeDetailPanel);
    header.appendChild(closeBtn);
    panelTop.appendChild(header);

    if (node.description) {
      var desc = document.createElement('p');
      desc.className = 'detail-description';
      desc.textContent = node.description;
      panelTop.appendChild(desc);
    }

    panel.appendChild(panelTop);

    // Scrollable body section: key concepts, commands, guides, references
    var panelBody = document.createElement('div');
    panelBody.className = 'detail-panel-body';

    // Key Points
    if (node.keyPoints && node.keyPoints.length) {
      var kpSection = document.createElement('div');
      kpSection.className = 'detail-section';
      var kpTitle = document.createElement('h3');
      kpTitle.textContent = 'Kiến thức chính';
      kpSection.appendChild(kpTitle);

      var ul = document.createElement('ul');
      node.keyPoints.forEach(function (point) {
        var li = document.createElement('li');
        li.textContent = point;
        ul.appendChild(li);
      });
      kpSection.appendChild(ul);
      panelBody.appendChild(kpSection);
    }

    // Commands
    if (node.commands && node.commands.length) {
      var cmdSection = document.createElement('div');
      cmdSection.className = 'detail-section';
      var cmdTitle = document.createElement('h3');
      cmdTitle.textContent = 'Lệnh kubectl';
      cmdSection.appendChild(cmdTitle);

      node.commands.forEach(function (cmd) {
        var pre = document.createElement('pre');
        var code = document.createElement('code');
        code.textContent = cmd;
        pre.appendChild(code);
        cmdSection.appendChild(pre);
      });
      panelBody.appendChild(cmdSection);
    }

    // Tài liệu ôn tập (from node or from GUIDE_LINKS for current page)
    var guideItems = node.guides || [];
    var currentPageKey = getPageKey();
    if (typeof GUIDE_LINKS === 'undefined') {
      console.warn('[MindMap] GUIDE_LINKS not loaded — data.js may be cached or failed to load');
    }
    if (guideItems.length === 0 && typeof GUIDE_LINKS !== 'undefined' && GUIDE_LINKS[currentPageKey]) {
      guideItems = GUIDE_LINKS[currentPageKey];
    }
    if (guideItems && guideItems.length) {
      var guideSection = document.createElement('div');
      guideSection.className = 'detail-section';
      var guideTitle = document.createElement('h3');
      guideTitle.textContent = 'Tài liệu ôn tập';
      guideSection.appendChild(guideTitle);

      var guideList = document.createElement('ul');
      guideList.className = 'detail-references';
      guideItems.forEach(function (g) {
        var li = document.createElement('li');
        li.style.cssText = 'padding-left: 24px;';
        li.innerHTML = '<span style="position:absolute;left:0;font-size:12px;">&#128218;</span>';
        var a = document.createElement('a');
        // Append from= parameter so guide page can link back to current mind map page
        var guideUrl = g.url;
        var separator = guideUrl.indexOf('?') !== -1 ? '&' : '?';
        var hashParts = guideUrl.split('#');
        guideUrl = hashParts[0] + separator + 'from=' + encodeURIComponent(currentPageKey);
        if (hashParts[1]) guideUrl += '#' + hashParts[1];
        a.href = guideUrl;
        a.textContent = g.title;
        a.className = 'detail-ref-link';
        a.style.color = '#FF9800';
        li.appendChild(a);

        var desc = document.createElement('span');
        desc.className = 'detail-ref-url';
        desc.textContent = g.guide || g.description || 'Tài liệu học chuyên sâu';
        li.appendChild(desc);

        guideList.appendChild(li);
      });
      guideSection.appendChild(guideList);
      panelBody.appendChild(guideSection);
    }

    // Nguồn tham khảo
    if (node.references && node.references.length) {
      var refSection = document.createElement('div');
      refSection.className = 'detail-section';
      var refTitle = document.createElement('h3');
      refTitle.textContent = 'Nguồn tham khảo';
      refSection.appendChild(refTitle);

      var refList = document.createElement('ul');
      refList.className = 'detail-references';
      node.references.forEach(function (ref) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = ref.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = ref.title;
        a.className = 'detail-ref-link';
        li.appendChild(a);

        var urlSpan = document.createElement('span');
        urlSpan.className = 'detail-ref-url';
        urlSpan.textContent = ref.url.replace('https://kubernetes.io', 'kubernetes.io');
        li.appendChild(urlSpan);

        refList.appendChild(li);
      });
      refSection.appendChild(refList);
      panelBody.appendChild(refSection);
    }

    panel.appendChild(panelBody);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(function () {
      overlay.classList.add('active');
    }, 20);
  }

  function closeDetailPanel() {
    var overlay = document.querySelector('.detail-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }
  }

  // Resize handler
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      renderMindMap(getPageKey());
    }, 250);
  });

  // Hash change navigation
  window.addEventListener('hashchange', function () {
    renderMindMap(getPageKey());
  });

  // Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDetailPanel();
  });

  // Initial render — log diagnostic info to help debug caching issues
  console.log('[MindMap] Init: GUIDE_LINKS=' + (typeof GUIDE_LINKS !== 'undefined' ? Object.keys(GUIDE_LINKS).length + ' entries' : 'UNDEFINED') +
    ', MIND_MAP_DATA=' + (typeof MIND_MAP_DATA !== 'undefined' ? 'loaded' : 'UNDEFINED') +
    ', pageKey=' + getPageKey());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderMindMap(getPageKey());
    });
  } else {
    renderMindMap(getPageKey());
  }

})();
