(function () {
  'use strict';

  const LOGO_URL = 'https://raw.githubusercontent.com/mehdiq1980/steemflags/aabe89f823ecac74dd8909c0c883b8693f1be3ef/assets/d2e_asset_logo1.png';
  const MARKER = 'data-d2e-logo';

  function makeLogo(className = 'd2eAssetLogo') {
    const img = document.createElement('img');
    img.src = LOGO_URL;
    img.alt = 'D2E';
    img.className = className;
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';
    return img;
  }

  function updateTopAsset(root) {
    const bars = root.querySelectorAll ? root.querySelectorAll('.sfAsset') : [];
    bars.forEach(asset => {
      let old = asset.querySelector('.sfLogo');
      if (old) old.remove();
      if (!asset.querySelector('.d2eTopLogo')) {
        const label = asset.querySelector('.assetLabel');
        const logo = makeLogo('d2eTopLogo');
        if (label) asset.insertBefore(logo, label);
        else asset.insertBefore(logo, asset.firstChild);
      }
    });
  }

  function decorate(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    updateTopAsset(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,textarea,[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[' + MARKER + ']')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('.sfAsset')) return NodeFilter.FILTER_REJECT;
        return /D2E/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parts = (node.nodeValue || '').split(/(D2E)/g);
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
    style.textContent = '.d2eTopLogo{width:1.2em;height:1.2em;object-fit:contain;display:inline-block;vertical-align:middle;flex:0 0 auto;margin-right:.15em}.d2eAssetInline{display:inline-flex;align-items:center;vertical-align:middle;gap:.22em;white-space:nowrap}.d2eAssetLogo{width:1.05em;height:1.05em;object-fit:contain;display:inline-block;vertical-align:middle;flex:0 0 auto}.d2eAssetInline .d2eAssetLogo{margin:0}.leaderboardD2E .d2eAssetInline{justify-content:flex-end}';
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
