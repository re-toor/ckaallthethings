// Guide Search - In-page keyword search with highlighting and navigation
(function () {
  'use strict';

  var MAX_HIGHLIGHTS = 1000;

  // --- State ---
  var state = {
    isOpen: false,
    query: '',
    matchCase: false,
    matchWord: false,
    matches: [],        // Array of <mark> elements
    currentIndex: -1
  };

  // --- DOM Nguồn tham khảo (set during init) ---
  var els = {};

  // --- Public init function (called by guide.js after content renders) ---
  window.initGuideSearch = function () {
    // Reset state for new guide content
    state.matches = [];
    state.currentIndex = -1;
    state.query = '';

    cacheElements();
    if (!els.bar) return; // search bar HTML not present

    // Only bind events once
    if (!els._bound) {
      bindEvents();
      createSearchTriggerButton();
      els._bound = true;
    }

    // Clear input if open
    if (state.isOpen) {
      els.input.value = '';
      updateCount();
    }
  };

  function cacheElements() {
    els.bar = document.getElementById('guide-search-bar');
    els.input = document.getElementById('search-input');
    els.count = document.getElementById('search-count');
    els.nextBtn = document.getElementById('search-next');
    els.prevBtn = document.getElementById('search-prev');
    els.closeBtn = document.getElementById('search-close');
    els.filterCase = document.getElementById('filter-case-sensitive');
    els.filterWord = document.getElementById('filter-match-word');
  }

  // --- Search Trigger Button (injected into header) ---
  function createSearchTriggerButton() {
    var headerRight = document.querySelector('.header-right');
    if (!headerRight || document.getElementById('search-trigger-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'search-trigger-btn';
    btn.id = 'search-trigger-btn';
    btn.title = 'Tìm trong tài liệu (Ctrl+F)';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">' +
      '<path d="M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-.82 4.74a6 6 0 1 1 1.06-1.06l3.04 3.04a.75.75 0 1 1-1.06 1.06l-3.04-3.04Z"/>' +
      '</svg>';
    btn.addEventListener('click', openSearch);

    var githubLink = headerRight.querySelector('.github-link');
    if (githubLink) {
      headerRight.insertBefore(btn, githubLink);
    } else {
      headerRight.appendChild(btn);
    }
  }

  // --- Open / Close ---
  function openSearch() {
    if (!els.bar) return;
    els.bar.classList.add('open');
    state.isOpen = true;
    els.input.focus();
    els.input.select();
  }

  function closeSearch() {
    if (!els.bar) return;
    els.bar.classList.remove('open');
    state.isOpen = false;
    clearHighlights();
    els.input.value = '';
    updateCount();
  }

  // --- Event Binding ---
  function bindEvents() {
    // Debounced search on input
    var debounceTimer;
    els.input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performSearch, 200);
    });

    // Keyboard navigation within input
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          prevMatch();
        } else {
          nextMatch();
        }
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    // Nav buttons
    els.nextBtn.addEventListener('click', nextMatch);
    els.prevBtn.addEventListener('click', prevMatch);

    // Close button
    els.closeBtn.addEventListener('click', closeSearch);

    // Filter toggles
    els.filterCase.addEventListener('click', function () {
      state.matchCase = !state.matchCase;
      this.classList.toggle('active', state.matchCase);
      if (els.input.value) performSearch();
    });

    els.filterWord.addEventListener('click', function () {
      state.matchWord = !state.matchWord;
      this.classList.toggle('active', state.matchWord);
      if (els.input.value) performSearch();
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      // Ctrl+F / Cmd+F to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        openSearch();
      }

      // Alt+C to toggle case sensitivity
      if (e.altKey && e.key === 'c' && state.isOpen) {
        e.preventDefault();
        els.filterCase.click();
      }

      // Alt+W to toggle whole word
      if (e.altKey && e.key === 'w' && state.isOpen) {
        e.preventDefault();
        els.filterWord.click();
      }

      // Escape to close (when focus is elsewhere)
      if (e.key === 'Escape' && state.isOpen) {
        closeSearch();
      }
    });
  }

  // --- Core Search ---
  function performSearch() {
    clearHighlights();

    var query = els.input.value;
    if (!query) {
      updateCount();
      return;
    }

    state.query = query;
    state.matches = [];
    state.currentIndex = -1;

    var article = document.getElementById('guide-article');
    if (!article) return;

    // Build regex
    var flags = state.matchCase ? 'gu' : 'giu';
    var escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var pattern = state.matchWord
      ? '(?<![\\p{L}\\p{N}_])' + escapedQuery + '(?![\\p{L}\\p{N}_])'
      : escapedQuery;

    var regex;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      updateCount();
      return;
    }

    // Walk text nodes and highlight matches
    highlightMatches(article, regex);

    // Update UI
    updateCount();
    if (state.matches.length > 0) {
      goToMatch(0);
    }
  }

  // --- TreeWalker-Based Highlighting ---
  function highlightMatches(root, regex) {
    // Collect text nodes first (avoid mutating during walk)
    var textNodes = [];
    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;
          var tag = parent.tagName;
          // Skip script, style, existing marks
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK') {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip code blocks (pre > code) but allow inline code
          if (tag === 'CODE' && parent.parentNode && parent.parentNode.tagName === 'PRE') {
            return NodeFilter.FILTER_REJECT;
          }
          // Skip empty text nodes
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    // Process each text node
    for (var i = 0; i < textNodes.length; i++) {
      if (state.matches.length >= MAX_HIGHLIGHTS) break;
      processTextNode(textNodes[i], regex);
    }
  }

  function processTextNode(textNode, regex) {
    var text = textNode.nodeValue;
    regex.lastIndex = 0;
    if (!regex.test(text)) return;

    regex.lastIndex = 0; // Reset after test()

    var fragment = document.createDocumentFragment();
    var lastIndex = 0;
    var match;

    while ((match = regex.exec(text)) !== null) {
      if (state.matches.length >= MAX_HIGHLIGHTS) break;

      // Add text before the match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      // Create <mark> for the match
      var mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = match[0];
      fragment.appendChild(mark);
      state.matches.push(mark);

      lastIndex = regex.lastIndex;

      // Prevent infinite loop on zero-length matches
      if (match[0].length === 0) {
        regex.lastIndex++;
        lastIndex = regex.lastIndex;
      }
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    // Replace the original text node with our fragment
    textNode.parentNode.replaceChild(fragment, textNode);
  }

  // --- Clear Highlights ---
  function clearHighlights() {
    var marks = document.querySelectorAll('mark.search-highlight');
    for (var i = 0; i < marks.length; i++) {
      var mark = marks[i];
      var parent = mark.parentNode;
      if (parent) {
        var textNode = document.createTextNode(mark.textContent);
        parent.replaceChild(textNode, mark);
        parent.normalize();
      }
    }
    state.matches = [];
    state.currentIndex = -1;
  }

  // --- Match Navigation ---
  function goToMatch(index) {
    // Remove "current" from previous
    if (state.currentIndex >= 0 && state.currentIndex < state.matches.length) {
      state.matches[state.currentIndex].classList.remove('current');
    }

    state.currentIndex = index;
    var mark = state.matches[index];
    if (!mark) return;
    mark.classList.add('current');

    // Scroll the match into view within .guide-content using getBoundingClientRect
    // for reliable positioning regardless of nesting depth
    var content = document.getElementById('guide-content');
    if (content) {
      var contentRect = content.getBoundingClientRect();
      var markRect = mark.getBoundingClientRect();

      // How far the mark is from the top of the visible content area
      var markRelativeTop = markRect.top - contentRect.top;

      // Scroll so the match sits roughly 1/3 from the top of the visible area
      var targetScroll = content.scrollTop + markRelativeTop - contentRect.height / 3;

      content.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }

    updateCount();
  }

  function nextMatch() {
    if (state.matches.length === 0) return;
    var next = (state.currentIndex + 1) % state.matches.length;
    goToMatch(next);
  }

  function prevMatch() {
    if (state.matches.length === 0) return;
    var prev = (state.currentIndex - 1 + state.matches.length) % state.matches.length;
    goToMatch(prev);
  }

  // --- Count Display ---
  function updateCount() {
    if (!els.count) return;
    var total = state.matches.length;

    if (!els.input.value) {
      els.count.textContent = '';
      els.count.classList.remove('no-results');
      els.prevBtn.disabled = true;
      els.nextBtn.disabled = true;
      return;
    }

    if (total === 0) {
      els.count.textContent = 'Không có kết quả';
      els.count.classList.add('no-results');
      els.prevBtn.disabled = true;
      els.nextBtn.disabled = true;
    } else {
      var countText = (state.currentIndex + 1) + ' / ' + total;
      if (total >= MAX_HIGHLIGHTS) {
        countText = (state.currentIndex + 1) + ' / ' + MAX_HIGHLIGHTS + '+';
      }
      els.count.textContent = countText;
      els.count.classList.remove('no-results');
      els.prevBtn.disabled = false;
      els.nextBtn.disabled = false;
    }
  }

})();
