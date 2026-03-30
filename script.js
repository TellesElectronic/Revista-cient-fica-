/* =========================================================
   SABERES POLITÉCNICOS — Main Script
   Single-page navigation, content loading, search, filters,
   theme toggle, modal, form handling, portal institucional
   ========================================================= */

(function () {
  'use strict';

  // ---- DATA STORE ----
  let articles = [];
  let repository = [];
  let siteData = {};

  // ---- DOM REFS ----
  const html = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.page-section');
  const modal = document.getElementById('article-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.querySelector('.modal-close');

  // ---- THEME ----
  let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  html.setAttribute('data-theme', currentTheme);
  updateThemeIcon();

  themeToggle && themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    themeToggle.innerHTML = currentTheme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // ---- MOBILE NAV ----
  const navOverlay = document.createElement('div');
  navOverlay.id = 'nav-overlay';
  document.body.appendChild(navOverlay);

  mobileMenuBtn && mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navOverlay.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    mobileMenuBtn.innerHTML = isOpen
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  });

  navOverlay.addEventListener('click', closeMenu);

  function closeMenu() {
    mainNav.classList.remove('open');
    navOverlay.classList.remove('open');
    document.body.classList.remove('nav-open');
    mobileMenuBtn && mobileMenuBtn.setAttribute('aria-label', 'Abrir menú');
    mobileMenuBtn && mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn && (mobileMenuBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>');
  }

  // ---- ROUTING ----
  function getHash() {
    return (location.hash || '#inicio').replace('#', '').split('?')[0];
  }

  function showSection(id) {
    sections.forEach(s => {
      if (s.id === id || (id === 'inicio' && s.id === 'inicio')) {
        s.hidden = false;
        s.removeAttribute('hidden');
      } else {
        s.hidden = true;
        s.setAttribute('hidden', '');
      }
    });

    // Update nav
    navLinks.forEach(l => {
      l.classList.toggle('active', l.dataset.section === id);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    closeMenu();

    // Reset portal if navigating to portal
    if (id === 'portal') {
      resetPortalView();
    }
  }

  window.addEventListener('hashchange', () => showSection(getHash()));

  // Nav links
  navLinks.forEach(l => {
    l.addEventListener('click', (e) => {
      const target = l.dataset.section;
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (target === getHash()) {
        showSection(target);
        return;
      }
      location.hash = target;
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Handle internal links in content
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link && !link.dataset.section) {
      const target = link.getAttribute('href').replace('#', '');
      const section = document.getElementById(target);
      if (section && section.classList.contains('page-section')) {
        e.preventDefault();
        location.hash = target;
      }
    }
  });

  // ---- LOAD DATA ----
  async function loadData() {
    try {
      const [artRes, repoRes, siteRes] = await Promise.all([
        fetch('./content/articles.json').then(r => r.json()),
        fetch('./content/repository.json').then(r => r.json()),
        fetch('./content/site.json').then(r => r.json())
      ]);
      articles = artRes;
      repository = repoRes;
      siteData = siteRes;

      renderHomePreview();
      renderArticles();
      renderRepository();
      renderComite();
      buildFilterChips();
      initAdminPanel();
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  // ---- RENDER: HOME PREVIEW ----
  function renderHomePreview() {
    const container = document.getElementById('home-articles-preview');
    if (!container) return;
    const preview = articles.slice(0, 3);
    container.innerHTML = preview.map(a => articleCardHTML(a)).join('');
    attachCardListeners(container);
  }

  // ---- RENDER: ARTICLES ----
  function renderArticles(filter = 'all', search = '') {
    const container = document.getElementById('articles-list');
    const empty = document.getElementById('articles-empty');
    if (!container) return;

    let filtered = articles;

    if (filter !== 'all') {
      filtered = filtered.filter(a => a.programa === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(a =>
        a.titulo.toLowerCase().includes(q) ||
        a.autores.join(' ').toLowerCase().includes(q) ||
        a.palabras_clave.join(' ').toLowerCase().includes(q) ||
        a.resumen.toLowerCase().includes(q) ||
        a.programa.toLowerCase().includes(q)
      );
    }

    container.innerHTML = filtered.map(a => articleCardHTML(a)).join('');
    empty && (empty.hidden = filtered.length > 0);
    attachCardListeners(container);
  }

  function articleCardHTML(a) {
    const date = new Date(a.fecha).toLocaleDateString('es-VE', { year: 'numeric', month: 'long' });
    return `
      <article class="article-card reveal visible" data-id="${a.id}" role="button" tabindex="0" aria-label="Leer artículo: ${escHTML(a.titulo)}">
        <div class="article-card-meta">
          <span class="badge">${escHTML(a.programa)}</span>
          <span>${date}</span>
          <span>Vol. ${a.volumen}, N.° ${a.numero}</span>
        </div>
        <h3>${escHTML(a.titulo)}</h3>
        <p class="article-card-authors">${escHTML(a.autores.join('; '))}</p>
        <p class="article-card-abstract">${escHTML(a.resumen)}</p>
        <div class="article-card-keywords">
          ${a.palabras_clave.map(k => `<span class="keyword-tag">${escHTML(k)}</span>`).join('')}
        </div>
      </article>
    `;
  }

  // ---- RENDER: REPOSITORY ----
  function renderRepository(filter = 'all', search = '') {
    const container = document.getElementById('repo-list');
    const empty = document.getElementById('repo-empty');
    if (!container) return;

    let filtered = repository;

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.programa === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.titulo.toLowerCase().includes(q) ||
        r.autores.join(' ').toLowerCase().includes(q) ||
        r.palabras_clave.join(' ').toLowerCase().includes(q) ||
        r.resumen.toLowerCase().includes(q) ||
        r.programa.toLowerCase().includes(q) ||
        r.tutor.toLowerCase().includes(q)
      );
    }

    container.innerHTML = filtered.map(r => repoCardHTML(r)).join('');
    empty && (empty.hidden = filtered.length > 0);
    attachCardListeners(container, 'repo');
  }

  function repoCardHTML(r) {
    return `
      <article class="repo-card reveal visible" data-id="${r.id}" role="button" tabindex="0" aria-label="Ver proyecto: ${escHTML(r.titulo)}">
        <div class="repo-card-header">
          <span class="badge">${escHTML(r.programa)}</span>
          <span style="font-size:var(--text-xs);color:var(--color-text-faint)">${r.anio}</span>
        </div>
        <h3>${escHTML(r.titulo)}</h3>
        <div class="repo-card-info">
          <span>${escHTML(r.autores.join('; '))}</span>
          <span>Tutor: ${escHTML(r.tutor)}</span>
          <span>${escHTML(r.nivel)}</span>
        </div>
        <p class="repo-card-abstract">${escHTML(r.resumen)}</p>
      </article>
    `;
  }

  // ---- RENDER: COMITÉ ----
  function renderComite() {
    const container = document.getElementById('comite-list');
    if (!container || !siteData.comite_editorial) return;

    container.innerHTML = siteData.comite_editorial.map(m => {
      const initials = m.nombre.startsWith('[') ? '?' : m.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      return `
        <div class="comite-card">
          <div class="comite-card-icon">${initials}</div>
          <p class="cargo">${escHTML(m.cargo)}</p>
          <h3>${escHTML(m.nombre)}</h3>
          <p>${escHTML(m.afiliacion)}</p>
        </div>
      `;
    }).join('');
  }

  // ---- FILTER CHIPS ----
  function buildFilterChips() {
    const artFilters = document.getElementById('articles-filters');
    if (artFilters) {
      const programs = [...new Set(articles.map(a => a.programa))];
      programs.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.dataset.filter = p;
        btn.textContent = p;
        artFilters.appendChild(btn);
      });
    }

    const repoFilters = document.getElementById('repo-filters');
    if (repoFilters) {
      const programs = [...new Set(repository.map(r => r.programa))];
      programs.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.dataset.filter = p;
        btn.textContent = p;
        repoFilters.appendChild(btn);
      });
    }
  }

  // ---- FILTER & SEARCH EVENTS ----
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    const parent = chip.closest('.filter-chips');
    if (!parent) return;

    parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const filter = chip.dataset.filter;
    if (parent.id === 'articles-filters') {
      const search = document.getElementById('articles-search')?.value || '';
      renderArticles(filter, search);
    } else if (parent.id === 'repo-filters') {
      const search = document.getElementById('repo-search')?.value || '';
      renderRepository(filter, search);
    }
  });

  const artSearch = document.getElementById('articles-search');
  const repoSearch = document.getElementById('repo-search');

  artSearch && artSearch.addEventListener('input', debounce(() => {
    const filter = document.querySelector('#articles-filters .chip.active')?.dataset.filter || 'all';
    renderArticles(filter, artSearch.value);
  }, 250));

  repoSearch && repoSearch.addEventListener('input', debounce(() => {
    const filter = document.querySelector('#repo-filters .chip.active')?.dataset.filter || 'all';
    renderRepository(filter, repoSearch.value);
  }, 250));

  // ---- MODAL ----
  function attachCardListeners(container, type = 'article') {
    container.querySelectorAll(type === 'article' ? '.article-card' : '.repo-card').forEach(card => {
      const handler = () => {
        const id = card.dataset.id;
        const item = type === 'article'
          ? articles.find(a => a.id === id)
          : repository.find(r => r.id === id);
        if (item) openModal(item, type);
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') handler(); });
    });
  }

  function openModal(item, type) {
    if (!modal || !modalContent) return;

    if (type === 'article') {
      const date = new Date(item.fecha).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
      modalContent.innerHTML = `
        <p class="modal-meta">${escHTML(item.programa)} · Vol. ${item.volumen}, N.° ${item.numero} · ${date} · ${escHTML(item.estado)}</p>
        <h2>${escHTML(item.titulo)}</h2>
        <p class="modal-authors">${escHTML(item.autores.join('; '))}</p>
        <p class="modal-section-title">Resumen</p>
        <p class="modal-abstract">${escHTML(item.resumen)}</p>
        <p class="modal-section-title">Palabras clave</p>
        <div class="modal-keywords">
          ${item.palabras_clave.map(k => `<span class="keyword-tag">${escHTML(k)}</span>`).join('')}
        </div>
        <p class="modal-section-title">Información legal</p>
        <p class="modal-abstract" style="font-size:var(--text-sm)">Depósito Legal: AR2026000105 · ISSN: en trámite</p>
      `;
    } else {
      modalContent.innerHTML = `
        <p class="modal-meta">${escHTML(item.programa)} · ${escHTML(item.nivel)} · ${item.anio}</p>
        <h2>${escHTML(item.titulo)}</h2>
        <p class="modal-authors">${escHTML(item.autores.join('; '))}</p>
        <p class="modal-meta">Tutor: ${escHTML(item.tutor)}</p>
        <p class="modal-section-title">Resumen</p>
        <p class="modal-abstract">${escHTML(item.resumen)}</p>
        <p class="modal-section-title">Palabras clave</p>
        <div class="modal-keywords">
          ${item.palabras_clave.map(k => `<span class="keyword-tag">${escHTML(k)}</span>`).join('')}
        </div>
      `;
    }

    modal.hidden = false;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  modalClose && modalClose.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ---- FORM TABS (Envíos) ----
  document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.form-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.submission-form').forEach(f => {
        f.hidden = f.id !== tab.dataset.tab;
        if (f.id !== tab.dataset.tab) f.setAttribute('hidden', '');
        else f.removeAttribute('hidden');
      });
    });
  });

  // ---- FORM SUBMIT (existing) ----
  document.querySelectorAll('.submission-form, .contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(form)) {
        showToast('Formulario enviado correctamente (demo). Para envíos reales, use el correo electrónico indicado.');
        form.reset();
      }
    });
  });

  function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(f => {
      if (!f.value.trim() && f.type !== 'checkbox') {
        f.style.borderColor = 'var(--color-error)';
        valid = false;
      } else if (f.type === 'checkbox' && !f.checked) {
        valid = false;
      } else {
        f.style.borderColor = '';
      }
    });
    if (!valid) {
      showToast('Por favor, complete todos los campos obligatorios.');
    }
    return valid;
  }

  // ---- TOAST ----
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3500);
    });
  }

  // ---- SCROLL REVEAL ----
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    }, 300);
  }

  // =========================================================
  //  PORTAL INSTITUCIONAL
  // =========================================================

  // ---- Portal card navigation ----
  const portalCards = document.getElementById('portal-cards');
  const panelIds = { admin: 'panel-admin', evaluador: 'panel-evaluador', estudiante: 'panel-estudiante', publico: 'panel-publico' };

  function resetPortalView() {
    // Show cards, hide all panels
    if (portalCards) portalCards.hidden = false;
    Object.values(panelIds).forEach(id => {
      const panel = document.getElementById(id);
      if (panel) { panel.hidden = true; panel.setAttribute('hidden', ''); }
    });
  }

  function showPortalPanel(role) {
    if (portalCards) { portalCards.hidden = true; portalCards.setAttribute('hidden', ''); }
    Object.values(panelIds).forEach(id => {
      const panel = document.getElementById(id);
      if (panel) {
        const show = id === panelIds[role];
        panel.hidden = !show;
        if (show) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      }
    });
    window.scrollTo({ top: document.getElementById('portal').offsetTop - 80, behavior: 'smooth' });
  }

  // Card clicks
  document.querySelectorAll('[data-portal]').forEach(card => {
    card.addEventListener('click', () => showPortalPanel(card.dataset.portal));
  });

  // Back buttons
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => resetPortalView());
  });

  // ---- Admin Tabs ----
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.admin-panel-content').forEach(c => {
        const show = c.id === tab.dataset.admintab;
        c.hidden = !show;
        if (show) c.removeAttribute('hidden');
        else c.setAttribute('hidden', '');
      });
    });
  });

  // ---- Evaluador Tabs ----
  document.querySelectorAll('.eval-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.eval-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.eval-content').forEach(c => {
        const show = c.id === tab.dataset.evaltab;
        c.hidden = !show;
        if (show) c.removeAttribute('hidden');
        else c.setAttribute('hidden', '');
      });
    });
  });

  // ---- Estudiante Tabs ----
  document.querySelectorAll('.est-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.est-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.est-content').forEach(c => {
        const show = c.id === tab.dataset.esttab;
        c.hidden = !show;
        if (show) c.removeAttribute('hidden');
        else c.setAttribute('hidden', '');
      });
    });
  });

  // ---- Admin Panel Init ----
  function initAdminPanel() {
    // Stats
    const statArts = document.getElementById('stat-arts');
    const statRepos = document.getElementById('stat-repos');
    const statProgs = document.getElementById('stat-progs');
    if (statArts) statArts.textContent = articles.length;
    if (statRepos) statRepos.textContent = repository.length;
    if (statProgs) {
      const allProgs = new Set([...articles.map(a => a.programa), ...repository.map(r => r.programa)]);
      statProgs.textContent = allProgs.size;
    }

    // Articles table
    const tbody = document.getElementById('adm-articles-tbody');
    if (tbody) {
      tbody.innerHTML = articles.map(a => `
        <tr>
          <td>${escHTML(a.titulo)}</td>
          <td>${escHTML(a.autores.join('; '))}</td>
          <td>${escHTML(a.programa)}</td>
          <td><span class="status-badge status--aprobado">${escHTML(a.estado)}</span></td>
        </tr>
      `).join('');
    }

    // Comité editable
    renderAdminComite();
  }

  function renderAdminComite() {
    const list = document.getElementById('adm-comite-list');
    if (!list || !siteData.comite_editorial) return;

    list.innerHTML = siteData.comite_editorial.map((m, i) => `
      <div class="admin-comite-item" data-index="${i}">
        <div class="form-group"><label>Cargo</label><input type="text" value="${escHTML(m.cargo)}" data-field="cargo"></div>
        <div class="form-group"><label>Nombre</label><input type="text" value="${escHTML(m.nombre)}" data-field="nombre"></div>
        <div class="form-group"><label>Afiliación</label><input type="text" value="${escHTML(m.afiliacion)}" data-field="afiliacion"></div>
        <button class="btn-remove" data-remove="${i}">&times; Quitar</button>
      </div>
    `).join('');

    // Remove handlers
    list.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.remove);
        siteData.comite_editorial.splice(idx, 1);
        renderAdminComite();
      });
    });

    // Live edit
    list.querySelectorAll('input[data-field]').forEach(input => {
      input.addEventListener('input', () => {
        const item = input.closest('.admin-comite-item');
        const idx = parseInt(item.dataset.index);
        const field = input.dataset.field;
        if (siteData.comite_editorial[idx]) {
          siteData.comite_editorial[idx][field] = input.value;
        }
      });
    });
  }

  // Add comité member
  const addComiteBtn = document.getElementById('adm-add-comite');
  addComiteBtn && addComiteBtn.addEventListener('click', () => {
    siteData.comite_editorial.push({ cargo: 'Nuevo cargo', nombre: '[Nombre]', afiliacion: 'UPTA' });
    renderAdminComite();
  });

  // ---- Admin Export JSON ----
  const admExport = document.getElementById('adm-export');
  admExport && admExport.addEventListener('click', () => {
    const config = {
      nombre_revista: document.getElementById('adm-nombre')?.value || '',
      subtitulo: document.getElementById('adm-subtitulo')?.value || '',
      institucion: document.getElementById('adm-institucion')?.value || '',
      correo_contacto: document.getElementById('adm-correo')?.value || '',
      deposito_legal: document.getElementById('adm-deposito')?.value || '',
      issn: document.getElementById('adm-issn')?.value || '',
      volumen_actual: document.getElementById('adm-volumen')?.value || '',
      numero_actual: document.getElementById('adm-numero')?.value || '',
      descripcion: document.getElementById('adm-descripcion')?.value || '',
      mision: document.getElementById('adm-mision')?.value || '',
      vision: document.getElementById('adm-vision')?.value || '',
      comite_editorial: siteData.comite_editorial || [],
      convocatoria: {
        texto: document.getElementById('adm-convocatoria')?.value || '',
        fecha_limite: document.getElementById('adm-fecha-limite')?.value || '',
        estado: document.getElementById('adm-conv-estado')?.value || ''
      }
    };
    downloadJSON(config, 'site-config.json');
    showToast('Configuración exportada como site-config.json');
  });

  const admExportArticles = document.getElementById('adm-export-articles');
  admExportArticles && admExportArticles.addEventListener('click', () => {
    downloadJSON(articles, 'articles.json');
    showToast('Artículos exportados como articles.json');
  });

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---- Portal Forms ----
  const portalForms = document.querySelectorAll('.portal-form');
  portalForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(form)) {
        const formName = form.id;
        if (formName === 'form-evaluador') {
          showToast('Registro de evaluador completado (demo). En producción, los datos serían enviados al comité editorial.');
        } else if (formName === 'form-estudiante') {
          showToast('Registro de estudiante completado (demo). En producción, recibirá confirmación por correo.');
        } else if (formName === 'form-publico') {
          showToast('Suscripción registrada (demo). En producción, recibirá las ediciones en su correo.');
        } else if (formName === 'form-est-envio') {
          showToast('Trabajo enviado correctamente (demo). En producción, el comité editorial lo procesará.');
        } else {
          showToast('Formulario enviado correctamente (demo).');
        }
        form.reset();
      }
    });
  });

  // ---- Student: New submission toggle ----
  const estNuevoEnvio = document.getElementById('est-nuevo-envio');
  const estEnvioWrapper = document.getElementById('est-envio-form-wrapper');
  estNuevoEnvio && estNuevoEnvio.addEventListener('click', () => {
    if (estEnvioWrapper) {
      const isHidden = estEnvioWrapper.hidden;
      estEnvioWrapper.hidden = !isHidden;
      if (isHidden) estEnvioWrapper.removeAttribute('hidden');
      else estEnvioWrapper.setAttribute('hidden', '');
    }
  });

  // ---- Evaluador: Dictamen modal ----
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-eval-action="dictamen"]');
    if (!btn) return;

    const overlay = document.createElement('div');
    overlay.className = 'dictamen-overlay';
    overlay.innerHTML = `
      <div class="dictamen-modal">
        <button class="dictamen-close" aria-label="Cerrar">&times;</button>
        <h3>Emitir dictamen</h3>
        <form class="portal-form" id="form-dictamen" novalidate>
          <div class="form-group">
            <label for="dict-veredicto">Veredicto *</label>
            <select id="dict-veredicto" required>
              <option value="">Seleccione</option>
              <option>Aprobado sin correcciones</option>
              <option>Aprobado con correcciones menores</option>
              <option>Requiere correcciones mayores</option>
              <option>Rechazado</option>
            </select>
          </div>
          <div class="form-group">
            <label for="dict-obs">Observaciones *</label>
            <textarea id="dict-obs" rows="5" required placeholder="Detalle sus observaciones sobre el trabajo evaluado"></textarea>
          </div>
          <div class="form-group">
            <label for="dict-archivo">Dictamen adjunto (opcional)</label>
            <input type="file" id="dict-archivo" accept=".pdf,.docx,.odt">
          </div>
          <button type="submit" class="btn btn-primary btn-submit">Enviar dictamen</button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const closeDictamen = () => {
      overlay.remove();
      document.body.style.overflow = '';
    };

    overlay.querySelector('.dictamen-close').addEventListener('click', closeDictamen);
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) closeDictamen();
    });

    overlay.querySelector('#form-dictamen').addEventListener('submit', (ev) => {
      ev.preventDefault();
      showToast('Dictamen enviado correctamente (demo).');
      closeDictamen();
    });
  });

  // ---- UTILITIES ----
  function escHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ---- INIT ----
  loadData();
  showSection(getHash());

})();
