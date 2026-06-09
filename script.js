/* Whiskered – script.js */
(function () {
  'use strict';

  var SITES = [
    { id: 'cherri',          label: 'Cherri',          icon: '🍒', tagline: 'Creative community hub' },
    { id: 'gn-math',         label: 'GN‑Math',         icon: '🧮', tagline: 'Math at its finest' },
    { id: 'nexora',          label: 'Nexora',          icon: '⚡',        tagline: 'Innovation platform' },
    { id: 'overcloaked',     label: 'Overcloaked',     icon: '🔒', tagline: 'Privacy first' },
    { id: 'void-network',    label: 'Void Network',    icon: '◾', tagline: 'Decentralized signal' },
    { id: 'galaxy',          label: 'Galaxy',          icon: '🌌', tagline: 'Space exploration' },
    { id: 'fern',            label: 'Fern',            icon: '🌿', tagline: 'Nature & environment' },
    { id: 'axis',            label: 'Axis',            icon: '⊕',        tagline: 'Developer tools' },
    { id: 'xylora',          label: 'Xylora',          icon: '✦',        tagline: 'Creative arts' },
    { id: 'quasar',          label: 'Quasar',          icon: '◉',  tagline: 'Science & research' },
    { id: 'infamous',        label: 'Infamous',        icon: '🎭', tagline: 'Underground culture' },
    { id: 'truffled',        label: 'Truffled',        icon: '🍄', tagline: 'Culinary discovery' },
    { id: 'uniub',           label: 'UniUB',           icon: '📚', tagline: 'University platform' },
    { id: 'dogeub',          label: 'DogeUB',          icon: '🐕', tagline: 'Crypto community' },
    { id: 'lunar',           label: 'Lunar',           icon: '🌙', tagline: 'Moon & night sky' },
    { id: 'frogies-arcade',  label: 'Frogies arcade',  icon: '🐸', tagline: 'Retro gaming' },
    { id: 'interstellar',    label: 'Interstellar',    icon: '🚀', tagline: 'Space travel' },
    { id: 'shadow',          label: 'Shadow',          icon: '◈',        tagline: 'Mystery & thriller' },
    { id: 'selenite',        label: 'Selenite',        icon: '💎', tagline: 'Wellness & crystals' },
    { id: 'duckmath',        label: 'Duckmath',        icon: '🦆', tagline: 'Math education' },
  ];

  var GENRES = [
    { id: 'platformer', label: 'Platformer', icon: '🏃' },
    { id: 'rhythm',     label: 'Rhythm',     icon: '🎵' },
    { id: 'horror',     label: 'Horror',     icon: '👻' },
    { id: 'fps',        label: 'FPS',        icon: '🔫' },
    { id: 'arcade',     label: 'Arcade',     icon: '🕹️' },
    { id: 'survival',   label: 'Survival',   icon: '🛡️' },
    { id: 'adventure',  label: 'Adventure',  icon: '⚔️' },
    { id: 'chill',      label: 'Chill',      icon: '😌' },
    { id: 'puzzle',     label: 'Puzzle',     icon: '🧩' },
    { id: 'racing',     label: 'Racing',     icon: '🏎️' },
    { id: 'flash',      label: 'Flash',      icon: '⚡' },
    { id: 'goon',       label: 'Goon',       icon: '💦' },
  ];

  var GENRE_GAMES = {
    'platformer': [
      { label: 'Geometry Dash Web', url: 'https://html-classic.itch.zone/html/17720116/web-dashers.github.io-main/index.html?v=1780000355' },
      { label: 'FISH Webport',      url: 'https://html-classic.itch.zone/html/17121759/fish-main/index.html?v=1775859823' },
      { label: 'Celeste',           url: 'https://html-classic.itch.zone/html/17545259/index.html?v=1778813160' },
      { label: 'A Difficult Game About Climbing', url: 'https://html-classic.itch.zone/html/17569102/index.html?v=1778992516' },
      { label: 'Pizza Tower',       url: 'https://html-classic.itch.zone/html/17123780/index.html?v=1775877118' }
    ],

    'rhythm': [
      { label: 'Just Shapes and Beats', url: 'https://html-classic.itch.zone/html/17555895/index.html?v=1778890141' },
      { label: 'BeatBlock', url: 'https://html-classic.itch.zone/html/17569074/index.html?v=1778992254' },
      { label: "Friday Night Funkin'",    url: 'https://html-classic.itch.zone/html/16944508-1582492/index.html' },
      { label: 'FNF Indie Cross',         url: 'https://html-classic.itch.zone/html/17168896/indie-cross-fnf-main/index.html?v=1776208991' },
      { label: 'A Dance of Fire And Ice', url: 'https://html-classic.itch.zone/html/1175401/index.html' }
    ],

    'horror': [
      { label: "Baldi's Basics Plus", url: "https://html-classic.itch.zone/html/17618752/index.html?v=1779328465" },
      { label: 'Granny', url: 'https://html-classic.itch.zone/html/17861467/Granny-main/index.html?v=1780978127' },
      { label: 'Slender', url: 'https://html-classic.itch.zone/html/17129783/index.html?v=1775929482' },
      { label: 'Iron Lung', url: 'https://html-classic.itch.zone/html/17121628/iron-lung-main/index.html?v=1775858719' },
      { label: 'The Deadseat (broken)', url: 'https://html-classic.itch.zone/html/17123849/index.html?v=1775877699' },
      { label: 'Five Nights at Epstein's', url: 'https://html-classic.itch.zone/html/17122772/fnae-main/index.html?v=1775866888' },
      { label: 'A Bite at Freddy\'s', url: 'https://html-classic.itch.zone/html/17555938/index.html?v=1778890468' }
    ],

    'fps': [
      { label: 'ULTRAKILL', url: 'https://html-classic.itch.zone/html/17568016/index.html?v=1778982103' },
      { label: 'Half Life', url: 'https://html-classic.itch.zone/html/17555846/index.html?v=1778889765' }
    ],

    'survival': [
      { label: 'Terraria', url: 'https://html-classic.itch.zone/html/17568965/index.html?v=1778991184' },
      { label: 'Brotato',                 url: 'https://html-classic.itch.zone/html/17190505/index.html?v=1776374177' },
      { label: 'Clover Pit',              url: 'https://html-classic.itch.zone/html/17203567/index.html?v=1776471501' }
    ],

    'adventure': [
      { label: 'Hollow Knight', url: 'https://html-classic.itch.zone/html/17203613/index.html?v=1776471870' },
      { label: 'GTA: Vice City', url: 'https://html-classic.itch.zone/html/16068414/index.html' },
      { label: 'Omori', url: 'https://html-classic.itch.zone/html/17569024/index.html?v=1778991889' },
      { label: 'Purgatory',     url: 'https://html-classic.itch.zone/html/16644765/index.html?v=1772314115' }
    ],

    'chill': [
      { label: 'An average day at the cat cafe', url: 'https://html-classic.itch.zone/html/6691622/WebGL/index.html' },
      { label: 'Animal Crossing', url: 'https://html-classic.itch.zone/html/17555943/index.html?v=1778890541' },
      { label: 'KittyToy',                       url: 'https://html-classic.itch.zone/html/10701493/index.html' },
      { label: 'Bake Care',                      url: 'https://html-classic.itch.zone/html/2638446/HTML/index.html' },
      { label: 'b-e-e-t-l-e',                    url: 'https://html-classic.itch.zone/html/15021039/HTML/index.html' },
      { label: 'Irori',                          url: 'https://html-classic.itch.zone/html/1848413/Web_v0.32/index.html' }
    ],

    'puzzle': [
      { label: 'Another Night At The Archive', url: 'https://html-classic.itch.zone/html/11493468/index.html' }
    ],

    'racing': [
      { label: 'PolyTrack', url: 'https://html-classic.itch.zone/html/16755713/index.html' }
    ],

    'arcade': [
      { label: 'Buckshot Roulette', url: 'https://html-classic.itch.zone/html/17574967/index.html?v=1779033998' },
      { label: 'Scritchy Scratchy',    url: 'https://html-classic.itch.zone/html/16388344-1536207/index.html' },
      { label: 'Balatro', url: 'https://html-classic.itch.zone/html/17618560/web-balatro-main/index.html?v=1779327186' },
      { label: 'Bad Time Simulator', url: 'https://html-classic.itch.zone/html/13788770/index.html' },
      { label: 'Idle Gumball Machine', url: 'https://html-classic.itch.zone/html/15811950/index.html' },
      { label: 'Cat Cove Inn',         url: 'https://html-classic.itch.zone/html/6577714/index.html' },
      { label: 'Little Chef',          url: 'https://html-classic.itch.zone/html/15194587/index.html' },
      { label: 'The MachinEGG',        url: 'https://html-classic.itch.zone/html/17095940/index.html' },
      { label: 'Life _ Lemon',         url: 'https://html-classic.itch.zone/html/16093818/index.html' },
      { label: 'Hooked',               url: 'https://html-classic.itch.zone/html/17338298/index.html?v=1777365531' }
    ],

    'flash': [
      { label: 'Nip for Speed', url: 'https://html-classic.itch.zone/html/9641909/index.html' },
      { label: 'Deepest Sword', url: 'https://html-classic.itch.zone/html/4017918/index.html' }
    ],
    
    'goon': [
      { label: 'My Buddy Did Something Weird And Now I Have Feelings For Him??!?!?', url: 'https://html-classic.itch.zone/html/17040654/index.html?v=1775235621' },
      { label: 'OVERD0SE', url: 'https://html-classic.itch.zone/html/17203420/index.html?v=1776470531' },
      { label: 'Heartstop Tour', url: 'https://html-classic.itch.zone/html/14235865/index.html' },
      { label: 'Contract Demon', url: 'https://html-classic.itch.zone/html/9819526/index.html?v=1732313590' }
    ]
  };



  var activeTabId = null;
  var sidePanelOpen = false;
  var prevPanel = null;
  var trapHandler = null;

  /* ---- Transition helpers ---------------------------------- */
  function getActiveView() {
    var views = [
      document.getElementById('welcome-screen'),
      document.getElementById('itchio-view'),
      document.getElementById('itchio-genre-view'),
      document.getElementById('websites-view')
    ];
    for (var i = 0; i < views.length; i++) {
      if (views[i] && views[i].style.display !== 'none') return views[i];
    }
    if (prevPanel && !prevPanel.hidden && prevPanel.classList.contains('active')) {
      return prevPanel;
    }
    return null;
  }

  function animateOut(el, then) {
    if (!el) { then(); return; }
    el.classList.add('page-exiting');
    setTimeout(function () {
      el.classList.remove('page-exiting');
      then();
    }, 180);
  }

  function animateIn(el) {
    if (!el) return;
    el.classList.add('page-entering');
    el.addEventListener('animationend', function handler() {
      el.classList.remove('page-entering');
      el.removeEventListener('animationend', handler);
    });
  }

  /* ---- Mode switching -------------------------------------- */
  function setMode(mode) {
    var itchioView = document.getElementById('itchio-view');
    var welcomeScreen = document.getElementById('welcome-screen');
    var websitesView = document.getElementById('websites-view');
    var currentView = getActiveView();

    animateOut(currentView, function () {
      var itchioGenreView = document.getElementById('itchio-genre-view');
      if (itchioView) itchioView.style.display = 'none';
      if (itchioGenreView) itchioGenreView.style.display = 'none';
      if (welcomeScreen) welcomeScreen.style.display = 'none';
      if (websitesView) websitesView.style.display = 'none';
      document.querySelectorAll('.content-panel').forEach(function (p) {
        p.hidden = true;
        p.classList.remove('active');
      });
      prevPanel = null;
      activeTabId = null;

      var target;
      if (mode === 'itchio') {
        if (itchioView) { itchioView.style.display = 'flex'; target = itchioView; }
      } else if (mode === 'websites') {
        if (websitesView) { websitesView.style.display = ''; target = websitesView; }
      } else {
        if (welcomeScreen) { welcomeScreen.style.display = ''; target = welcomeScreen; }
      }
      animateIn(target);
    });
  }

  /* ---- Show a site panel (no tab elements needed) ---------- */
  function showPanel(siteId) {
    var panel = document.getElementById('panel-' + siteId);
    if (!panel) return;
    var currentView = getActiveView();

    animateOut(currentView, function () {
      var websitesView = document.getElementById('websites-view');
      if (websitesView) websitesView.style.display = 'none';

      if (prevPanel && prevPanel !== panel) {
        prevPanel.classList.remove('active');
        prevPanel.hidden = true;
      }

      activeTabId = siteId;
      panel.hidden = false;
      panel.classList.remove('exiting');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          panel.classList.add('active');
          animateIn(panel);
          panel.focus({ preventScroll: true });
        });
      });
      prevPanel = panel;
      history.replaceState(null, '', '#panel-' + siteId);
    });
  }

  /* ---- Build Itch.io genre grid ---------------------------- */
  function buildItchioView() {
    var grid = document.getElementById('itchio-genre-grid');
    if (!grid) return;

    GENRES.forEach(function (genre) {
      var btn = document.createElement('button');
      btn.className = 'sites-card';
      btn.innerHTML =
        '<span class="sites-card-icon" aria-hidden="true">' + genre.icon + '</span>' +
        '<span class="sites-card-name">' + genre.label + '</span>';
      btn.addEventListener('click', function () { showGenre(genre); });
      grid.appendChild(btn);
    });
  }

  /* ---- Show individual genre page -------------------------- */
  function showGenre(genre) {
    var currentView = getActiveView();
    var genreView = document.getElementById('itchio-genre-view');
    var genreTitle = document.getElementById('itchio-genre-title');
    var container = document.querySelector('.itchio-placeholder-buttons');

    animateOut(currentView, function () {
      var itchioView = document.getElementById('itchio-view');
      if (itchioView) itchioView.style.display = 'none';

      if (genreTitle) genreTitle.textContent = genre.label;

      if (container) {
        container.innerHTML = '';
        var games = GENRE_GAMES[genre.id] || [];
        games.forEach(function (game) {
          var a = document.createElement('a');
          a.href = game.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'itchio-placeholder-btn';
          a.textContent = game.label;
          container.appendChild(a);
        });
      }

      if (genreView) genreView.style.display = '';
      animateIn(genreView);
    });
  }

  /* ---- Build websites view --------------------------------- */
  function buildWebsitesView() {
    var grid = document.getElementById('websites-grid');
    if (!grid) return;

    SITES.forEach(function (site) {
      var btn = document.createElement('button');
      btn.className = 'sites-card';
      btn.innerHTML =
        '<span class="sites-card-icon" aria-hidden="true">' + site.icon + '</span>' +
        '<span class="sites-card-name">' + site.label + '</span>' +
        '<span class="sites-card-tagline">' + site.tagline + '</span>';
      btn.addEventListener('click', function () { showPanel(site.id); });
      grid.appendChild(btn);
    });
  }

  /* ---- Boot ------------------------------------------------ */
  function init() {
    document.body.classList.remove('no-js');
    enhancePanels();
    buildSitesList();
    buildItchioView();
    buildWebsitesView();
    bindEvents();
    initModal();
  }

  /* ---- Inject links button + back link into every panel ---- */
  function enhancePanels() {
    var panels = document.querySelectorAll('.content-panel');
    panels.forEach(function (panel) {
      var inner = panel.querySelector('.panel-inner');
      var header = panel.querySelector('.panel-header');
      var desc = panel.querySelector('.panel-description');

      /* Back button – inserted before the header */
      if (inner && header) {
        var back = document.createElement('button');
        back.className = 'back-home-btn';
        back.setAttribute('aria-label', 'Go back to home page');
        back.innerHTML = '<span class="arrow" aria-hidden="true">&#8592;</span> Go back to home page';
        back.addEventListener('click', function () { setMode('websites'); });
        inner.insertBefore(back, header);
      }

      /* "Take me to the Links!" button – only if no real links exist yet */
      var hasLinks = panel.querySelector('.links-section');
      if (desc && !hasLinks) {
        var btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'links-btn';
        btn.textContent = 'Take me to the Links!';
        btn.addEventListener('click', function (e) { e.preventDefault(); });
        desc.insertAdjacentElement('afterend', btn);
      }
    });
  }

  /* ---- Go back to welcome screen --------------------------- */
  function goHome() {
    var allTabs = document.querySelectorAll('.tab-item');
    allTabs.forEach(function (t, i) {
      t.setAttribute('aria-selected', 'false');
      t.classList.remove('active');
      t.setAttribute('tabindex', i === 0 ? '0' : '-1');
    });

    if (prevPanel) {
      var leaving = prevPanel;
      leaving.classList.remove('active');
      leaving.classList.add('exiting');
      setTimeout(function () {
        leaving.classList.remove('exiting');
        leaving.hidden = true;
      }, 200);
      prevPanel = null;
    }

    var welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.classList.remove('hidden');

    activeTabId = null;
    history.replaceState(null, '', window.location.pathname + window.location.search);

    /* Return focus to first tab */
    if (allTabs.length) allTabs[0].focus();
  }

  /* ---- Build side-panel list ------------------------------- */
  function buildSitesList() {
    var list = document.getElementById('sites-list');
    if (!list) return;
    list.innerHTML = '';

    SITES.forEach(function (site) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#panel-' + site.id;
      a.className = 'site-list-item';
      a.dataset.site = site.id;
      a.setAttribute('tabindex', '-1');

      var icon = document.createElement('span');
      icon.className = 'site-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = site.icon;

      var info = document.createElement('span');
      info.className = 'site-info';

      var name = document.createElement('span');
      name.className = 'site-name';
      name.textContent = site.label;

      var tagline = document.createElement('span');
      tagline.className = 'site-tagline';
      tagline.textContent = site.tagline;

      info.appendChild(name);
      info.appendChild(tagline);
      a.appendChild(icon);
      a.appendChild(info);
      li.appendChild(a);
      list.appendChild(li);

      a.addEventListener('click', function (e) {
        e.preventDefault();
        closeSidePanel();
        activateTab(site.id);
      });
    });
  }

  /* ---- Event wiring ---------------------------------------- */
  function bindEvents() {
    var btnItchio = document.getElementById('btn-itchio');
    var btnWebsites = document.getElementById('btn-websites');
    var itchioBack = document.getElementById('itchio-back-btn');
    if (btnItchio) btnItchio.addEventListener('click', function () { setMode('itchio'); });
    if (btnWebsites) btnWebsites.addEventListener('click', function () { setMode('websites'); });
    if (itchioBack) itchioBack.addEventListener('click', function () { setMode('home'); });

    var itchioHomeBtn = document.getElementById('itchio-home-btn');
    if (itchioHomeBtn) itchioHomeBtn.addEventListener('click', function () { setMode('home'); });

    var itchioGenreBack = document.getElementById('itchio-genre-back-btn');
    if (itchioGenreBack) itchioGenreBack.addEventListener('click', function () { setMode('itchio'); });

    var websitesHomeBtn = document.getElementById('websites-home-btn');
    if (websitesHomeBtn) websitesHomeBtn.addEventListener('click', function () { setMode('home'); });

    var tabList = document.getElementById('tab-list');
    if (tabList) {
      tabList.addEventListener('click', onTabClick);
      tabList.addEventListener('keydown', onTabKeydown);
    }

    var main = document.getElementById('main');
    if (main) {
      main.addEventListener('click', function (e) {
        var btn = e.target.closest('.open-sites-btn');
        if (btn) openSidePanel(btn.dataset.site);
      });
    }

    var closeBtn = document.getElementById('close-side-panel');
    if (closeBtn) closeBtn.addEventListener('click', closeSidePanel);

    var overlay = document.getElementById('overlay');
    if (overlay) overlay.addEventListener('click', closeSidePanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidePanelOpen) closeSidePanel();
    });

    window.addEventListener('hashchange', onHashChange);
  }

  /* ---- Tab click ------------------------------------------- */
  function onTabClick(e) {
    var item = e.target.closest('.tab-item');
    if (!item) return;
    e.preventDefault();
    activateTab(item.id.replace('tab-', ''));
  }

  /* ---- Tab keyboard ---------------------------------------- */
  function onTabKeydown(e) {
    var tabs = Array.from(document.querySelectorAll('.tab-item'));
    var idx = tabs.indexOf(document.activeElement);
    var next;

    switch (e.key) {
      case 'ArrowDown': case 'ArrowRight':
        e.preventDefault();
        next = (idx + 1) % tabs.length;
        moveFocus(tabs, next);
        break;
      case 'ArrowUp': case 'ArrowLeft':
        e.preventDefault();
        next = (idx - 1 + tabs.length) % tabs.length;
        moveFocus(tabs, next);
        break;
      case 'Home':
        e.preventDefault();
        moveFocus(tabs, 0);
        break;
      case 'End':
        e.preventDefault();
        moveFocus(tabs, tabs.length - 1);
        break;
      case 'Enter': case ' ':
        e.preventDefault();
        var focused = document.activeElement;
        if (focused && focused.classList.contains('tab-item')) {
          activateTab(focused.id.replace('tab-', ''));
        }
        break;
    }
  }

  function moveFocus(tabs, idx) {
    tabs.forEach(function (t, i) {
      t.setAttribute('tabindex', i === idx ? '0' : '-1');
    });
    tabs[idx].focus();
    tabs[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---- Activate tab ---------------------------------------- */
  function activateTab(siteId) {
    if (activeTabId === siteId) return;

    var tab = document.getElementById('tab-' + siteId);
    var panel = document.getElementById('panel-' + siteId);
    if (!tab || !panel) return;

    /* Deactivate previous tab */
    var allTabs = document.querySelectorAll('.tab-item');
    allTabs.forEach(function (t) {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
      t.classList.remove('active');
    });

    /* Exit previous panel */
    if (prevPanel && prevPanel !== panel) {
      var leaving = prevPanel;
      leaving.classList.remove('active');
      leaving.classList.add('exiting');
      var onEnd = function () {
        leaving.classList.remove('exiting');
        leaving.hidden = true;
        leaving.removeEventListener('transitionend', onEnd);
      };
      leaving.addEventListener('transitionend', onEnd);
    }

    /* Activate new tab */
    activeTabId = siteId;
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.classList.add('active');
    tab.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    /* Show new panel */
    panel.hidden = false;
    panel.classList.remove('exiting');
    /* Trigger paint before adding .active so transition fires */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        panel.classList.add('active');
        panel.focus({ preventScroll: true });
      });
    });
    prevPanel = panel;

    /* Hide welcome screen */
    var welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.classList.add('hidden');

    /* Mark current in side panel */
    document.querySelectorAll('.site-list-item').forEach(function (item) {
      item.classList.toggle('current', item.dataset.site === siteId);
    });

    /* Update URL hash silently */
    history.replaceState(null, '', '#panel-' + siteId);
  }

  /* ---- Open side panel ------------------------------------- */
  function openSidePanel(currentSiteId) {
    var panel = document.getElementById('side-panel');
    var overlay = document.getElementById('overlay');
    if (!panel || sidePanelOpen) return;

    sidePanelOpen = true;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('active');

    /* Make items focusable */
    var closeBtn = document.getElementById('close-side-panel');
    if (closeBtn) closeBtn.removeAttribute('tabindex');

    var items = panel.querySelectorAll('[data-site]');
    items.forEach(function (item) { item.setAttribute('tabindex', '0'); });

    /* Focus close button */
    setTimeout(function () {
      if (closeBtn) closeBtn.focus();
    }, 60);

    /* Focus trap */
    installFocusTrap(panel);
  }

  /* ---- Close side panel ------------------------------------ */
  function closeSidePanel() {
    var panel = document.getElementById('side-panel');
    var overlay = document.getElementById('overlay');
    if (!panel || !sidePanelOpen) return;

    sidePanelOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('active');

    /* Remove tabindex from all panel items */
    var closeBtn = document.getElementById('close-side-panel');
    if (closeBtn) closeBtn.setAttribute('tabindex', '-1');
    var items = panel.querySelectorAll('[data-site]');
    items.forEach(function (item) { item.setAttribute('tabindex', '-1'); });

    /* Uninstall trap */
    if (trapHandler && panel) {
      panel.removeEventListener('keydown', trapHandler);
      trapHandler = null;
    }

    /* Return focus to open-sites button */
    if (activeTabId) {
      var btn = document.querySelector('.open-sites-btn[data-site="' + activeTabId + '"]');
      if (btn) btn.focus();
    }
  }

  /* ---- Focus trap ------------------------------------------ */
  function installFocusTrap(container) {
    if (trapHandler) container.removeEventListener('keydown', trapHandler);

    trapHandler = function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(
        container.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return !el.disabled; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', trapHandler);
  }

  /* ---- Hash routing ---------------------------------------- */
  function handleHashOnLoad() {
    var hash = window.location.hash.replace('#panel-', '').replace('#', '');
    if (!hash) return;
    var match = SITES.find(function (s) { return s.id === hash; });
    if (match) activateTab(match.id);
  }

  function onHashChange() {
    var hash = window.location.hash.replace('#panel-', '').replace('#', '');
    if (hash && hash !== activeTabId) {
      var match = SITES.find(function (s) { return s.id === hash; });
      if (match) activateTab(match.id);
    }
  }

  /* ---- Modal controller ------------------------------------ */
  function initModal() {
    var modal = document.getElementById('changelog-modal');
    var closeBtn = document.getElementById('close-changelog');

    if (!modal || !closeBtn) return;

    /* Show modal after a short delay to not block buttons */
    setTimeout(function () {
      modal.classList.add('show');
    }, 500);

    /* Close modal */
    closeBtn.addEventListener('click', function () {
      modal.classList.remove('show');
    });
  }

  /* ---- Start ----------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
