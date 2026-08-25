(function () {
  'use strict';

  const LOGO_URL = 'https://raw.githubusercontent.com/mehdiq1980/steemflags/aabe89f823ecac74dd8909c0c883b8693f1be3ef/assets/d2e_asset_logo1.png';
  const MARKER = 'data-d2e-logo';

  function makeLogo() {
    const img = document.createElement('img');
    img.src = LOGO_URL;
    img.alt = 'D2E';
    img.className = 'd2eAssetLogo';
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';
    return img;
  }

  function decorate(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,textarea,[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[' + MARKER + ']')) return NodeFilter.FILTER_REJECT;
        return /D2E/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const text = node.nodeValue || '';
      const parts = text.split(/(D2E)/g);
      if (parts.length < 3) return;
      const fragment = document.createDocumentFragment();
      parts.forEach(part => {
        if (part !== 'D2E') {
          if (part) fragment.appendChild(document.createTextNode(part));
          return;
        }
        const wrap = document.createElement('span');
        wrap.className = 'd2eAssetInline';
        wrap.setAttribute(MARKER, '1');
        wrap.appendChild(makeLogo());
        const label = document.createElement('span');
        label.textContent = 'D2E';
        wrap.appendChild(label);
        fragment.appendChild(wrap);
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function install() {
    if (document.getElementById('d2e-logo-style')) return;
    const style = document.createElement('style');
    style.id = 'd2e-logo-style';
    style.textContent = '.d2eAssetInline{display:inline-flex;align-items:center;vertical-align:middle;gap:.22em;white-space:nowrap}.d2eAssetLogo{width:1.05em;height:1.05em;object-fit:contain;display:inline-block;vertical-align:middle;flex:0 0 auto}.d2eAssetInline .d2eAssetLogo{margin:0}.leaderboardD2E .d2eAssetInline{justify-content:flex-end}';
    document.head.appendChild(style);
  }

  function start() {
    install();
    decorate(document.body);
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (parent && !parent.closest('script,style,textarea,[contenteditable="true"],[' + MARKER + ']')) decorate(parent);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            decorate(node);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
