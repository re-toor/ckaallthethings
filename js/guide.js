// Guide Viewer - Loads and renders markdown guides
(function () {
  'use strict';

  var GUIDES = {
    'kubernetes-1.35': {
      file: '../guides/kubernetes-1.35-update.md',
      title: 'Cập nhật kiến thức CKA cho Kubernetes 1.35',
      breadcrumb: 'CKA Kubernetes 1.35'
    },
    'kubernetes': {
      file: '../guides/kubernetes-complete-guide.md',
      title: 'Tài liệu Kubernetes đầy đủ cho CKA',
      breadcrumb: 'Tài liệu Kubernetes'
    },
    'linux-networking': {
      file: '../guides/linux-network-commands.md',
      title: 'Tra cứu đầy đủ lệnh mạng Linux',
      breadcrumb: 'Tài liệu mạng Linux'
    },
    'gateway-api': {
      file: '../guides/gateway-api-complete-guide.md',
      title: 'Hướng dẫn đầy đủ Gateway API',
      breadcrumb: 'Tài liệu Gateway API'
    },
    'gateway-api-cka': {
      file: '../guides/gateway-api-cka-guide.md',
      title: 'Thực hành Gateway API cho CKA',
      breadcrumb: 'Thực hành Gateway API từng bước'
    },
    'coredns': {
      file: '../guides/coredns-complete-guide.md',
      title: 'Hướng dẫn đầy đủ CoreDNS trong Kubernetes',
      breadcrumb: 'Tài liệu CoreDNS'
    },
    'coredns-cka': {
      file: '../guides/coredns-cka-guide.md',
      title: 'Thực hành CoreDNS cho CKA',
      breadcrumb: 'Thực hành CoreDNS từng bước'
    },
    'ingress': {
      file: '../guides/ingress-complete-guide.md',
      title: 'Hướng dẫn đầy đủ Ingress',
      breadcrumb: 'Tài liệu Ingress'
    },
    'ingress-cka': {
      file: '../guides/ingress-cka-guide.md',
      title: 'Thực hành Ingress cho CKA',
      breadcrumb: 'Thực hành Ingress từng bước'
    },
    'k8s-install': {
      file: '../Kubernetes installation/guide.md',
      title: 'Hướng dẫn lab Kubernetes nhiều control plane',
      breadcrumb: 'Lab nhiều control plane'
    }
  };

  function getGuideKey() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id') || 'kubernetes';
  }

  function getReferrerPage() {
    var params = new URLSearchParams(window.location.search);
    return params.get('from') || '';
  }

  function setupBackNavigation() {
    var fromPage = getReferrerPage();
    var backUrl = fromPage ? '../index.html#' + fromPage : '../index.html#main';

    // Update the existing "Sơ đồ tư duy" breadcrumb link to return to the correct page
    var breadcrumbLink = document.querySelector('.breadcrumb-link');
    if (breadcrumbLink) {
      breadcrumbLink.href = backUrl;
    }

    // Also update the logo link
    var logoLink = document.querySelector('.logo');
    if (logoLink) {
      logoLink.href = backUrl;
    }

    // Add a back button in the header for easy navigation (especially on mobile)
    var backBtn = document.createElement('a');
    backBtn.href = backUrl;
    backBtn.className = 'guide-back-btn';
    backBtn.innerHTML = '&#8592; Quay lại';
    backBtn.title = 'Quay lại sơ đồ tư duy';
    var headerLeft = document.querySelector('.header-left');
    if (headerLeft) {
      headerLeft.insertBefore(backBtn, headerLeft.firstChild);
    }
  }

  function slugify(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Scroll a heading into view inside .guide-content WITHOUT scrolling the
  // body/window (which scrollIntoView can do, pushing the header off-screen).
  function scrollContentTo(target, behavior) {
    var content = document.querySelector('.guide-content');
    if (!content || !target) return;
    var contentRect = content.getBoundingClientRect();
    var targetRect = target.getBoundingClientRect();
    var offset = targetRect.top - contentRect.top;
    content.scrollTo({ top: content.scrollTop + offset, behavior: behavior || 'smooth' });
  }

  function buildTOC(article) {
    var headings = article.querySelectorAll('h1, h2, h3');
    var tocContainer = document.getElementById('sidebar-toc');
    tocContainer.innerHTML = '';

    var tocItems = [];

    headings.forEach(function (h, index) {
      // Explicit anchors survive translation, heading edits and inserted sections.
      // Keep both the translated heading ID and legacy aliases in the article.
      var id = h.id || 'heading-' + index + '-' + slugify(h.textContent.substring(0, 50));
      h.id = id;

      var level = parseInt(h.tagName.charAt(1));
      // Only show h1 and h2 in TOC to keep it manageable
      if (level > 2) return;

      var a = document.createElement('a');
      a.href = '#' + id;
      a.className = 'toc-item toc-h' + level;
      a.textContent = h.textContent;
      a.setAttribute('data-target', id);

      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(id);
        if (target) {
          scrollContentTo(target, 'smooth');
          history.replaceState(null, null, '#' + id);
        }
        document.getElementById('guide-sidebar').classList.remove('mobile-open');
      });

      tocContainer.appendChild(a);
      tocItems.push({ el: a, target: document.getElementById(id) });
    });

    return tocItems;
  }

  function setupScrollSpy(tocItems) {
    var content = document.querySelector('.guide-content');
    if (!content || tocItems.length === 0) return;

    var lastActive = null;

    function updateActive() {
      var scrollTop = content.scrollTop;
      var active = null;

      for (var i = tocItems.length - 1; i >= 0; i--) {
        var target = tocItems[i].target;
        if (target && target.offsetTop - 100 <= scrollTop) {
          active = tocItems[i];
          break;
        }
      }

      if (active !== lastActive) {
        if (lastActive) lastActive.el.classList.remove('active');
        if (active) {
          active.el.classList.add('active');
          var sidebar = document.getElementById('sidebar-toc');
          var itemTop = active.el.offsetTop - sidebar.offsetTop;
          var sidebarScroll = sidebar.scrollTop;
          var sidebarHeight = sidebar.clientHeight;
          if (itemTop < sidebarScroll || itemTop > sidebarScroll + sidebarHeight - 40) {
            sidebar.scrollTo({ top: itemTop - sidebarHeight / 3, behavior: 'smooth' });
          }
        }
        lastActive = active;
      }
    }

    content.addEventListener('scroll', updateActive);
    updateActive();
  }

  function setupBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '&#8593;';
    btn.title = 'Về đầu trang';
    document.body.appendChild(btn);

    var content = document.querySelector('.guide-content');

    btn.addEventListener('click', function () {
      content.scrollTo({ top: 0, behavior: 'smooth' });
    });

    content.addEventListener('scroll', function () {
      if (content.scrollTop > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });
  }

  function displayContent(html) {
    var article = document.getElementById('guide-article');
    var loading = document.getElementById('guide-loading');

    article.innerHTML = html;
    // Resolve file-relative Markdown links through the guide viewer.
    var guide = GUIDES[getGuideKey()];
    var sourceUrl = new URL(guide.file, window.location.href);
    article.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href.charAt(0) === '#') {
        link.addEventListener('click', function (event) {
          var target = document.getElementById(decodeURIComponent(href.slice(1)));
          if (!target) return;
          event.preventDefault();
          scrollContentTo(target, 'smooth');
          history.replaceState(null, '', href);
        });
        return;
      }
      var url = new URL(href, sourceUrl);
      Object.keys(GUIDES).some(function (key) {
        if (url.pathname !== new URL(GUIDES[key].file, window.location.href).pathname) return false;
        link.href = 'guide.html?id=' + encodeURIComponent(key) + url.hash;
        return true;
      });
    });
    article.classList.add('loaded');
    loading.style.display = 'none';

    var tocItems = buildTOC(article);
    setupScrollSpy(tocItems);
    setupBackToTop();

    // Initialize search feature after content is rendered
    if (typeof window.initGuideSearch === 'function') {
      window.initGuideSearch();
    }

    if (window.location.hash) {
      var hashTarget = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (hashTarget) {
        setTimeout(function () {
          scrollContentTo(hashTarget, 'auto');
        }, 100);
      }
    }
  }

  function parseAndDisplay(md, cacheKey) {
    requestAnimationFrame(function () {
      marked.setOptions({ gfm: true, breaks: false, pedantic: false });
      var html = GuideMarkdown.parse(md);

      // Cache rendered HTML for instant subsequent visits
      try {
        sessionStorage.setItem(cacheKey, html);
      } catch (e) {
        // sessionStorage full or unavailable — ignore
      }

      displayContent(html);
    });
  }

  function loadGuide() {
    var key = getGuideKey();
    var guide = GUIDES[key];

    if (!guide) {
      document.getElementById('guide-loading').innerHTML =
        '<p>Không tìm thấy tài liệu. <a href="guide.html?id=kubernetes">Mở tài liệu Kubernetes</a></p>';
      return;
    }

    // Update page title and breadcrumb
    document.title = guide.title + ' - Sơ đồ tư duy CKA';
    var breadcrumbEl = document.getElementById('guide-title-breadcrumb');
    if (breadcrumbEl) breadcrumbEl.textContent = guide.breadcrumb;

    var cacheKey = 'guide-html-vi-1.35-20260917-' + key;

    // 1) Check sessionStorage cache first (instant — no parsing needed)
    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        displayContent(cached);
        return;
      }
    } catch (e) { /* ignore */ }

    // 2) Fetch the markdown file and parse it
    fetch(guide.file)
      .then(function (res) {
        if (!res.ok) throw new Error('Không tải được tài liệu');
        return res.text();
      })
      .then(function (md) {
        parseAndDisplay(md, cacheKey);
      })
      .catch(function (err) {
        document.getElementById('guide-loading').innerHTML =
          '<p style="color: #f85149;">Lỗi tải tài liệu: ' + err.message + '</p>';
      });
  }

  // Sidebar toggle
  function setupSidebar() {
    var toggle = document.getElementById('sidebar-toggle');
    var sidebar = document.getElementById('guide-sidebar');

    toggle.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
        updateOverlay();
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });

    // Mobile TOC button in header — always visible so users can reopen the sidebar
    var tocBtn = document.createElement('button');
    tocBtn.className = 'mobile-toc-btn';
    tocBtn.innerHTML = '&#9776;';
    tocBtn.title = 'Hiện mục lục';
    tocBtn.addEventListener('click', function () {
      sidebar.classList.add('mobile-open');
      updateOverlay();
    });
    var headerRight = document.querySelector('.header-right');
    if (headerRight) {
      headerRight.insertBefore(tocBtn, headerRight.firstChild);
    }

    // Overlay to close sidebar on mobile when tapping outside
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('mobile-open');
      updateOverlay();
    });
    document.body.appendChild(overlay);

    function updateOverlay() {
      if (sidebar.classList.contains('mobile-open')) {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    setupBackNavigation();
    setupSidebar();
    loadGuide();
  });
})();
