/* =========================================================
   SABERES POLITÉCNICOS — Main Script
   Single-page navigation, content loading, search, filters,
   theme toggle, modal, form handling
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
  // Create overlay
  const navOverlay = document.createElement('div');
  navOverlay.id = 'nav-overlay';
  document.body.appendChild(navOverlay);

  mobileMenuBtn && mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navOverlay.classList.toggle('open', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    mobileMenuBtn.innerHTML = isOpen
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  });

  navOverlay.addEventListener('click', closeMenu);

  function closeMenu() {
    mainNav.classList.remove('open');
    navOverlay.classList.remove('open');
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
  }

  window.addEventListener('hashchange', () => showSection(getHash()));

  // Nav links
  navLinks.forEach(l => {
    l.addEventListener('click', (e) => {
      const target = l.dataset.section;
      if (target) {
        e.preventDefault();
        location.hash = target;
      }
    });
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
    // Articles
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

    // Repo
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

  // Search inputs
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

  // ---- FORM TABS ----
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

  // ---- FORM SUBMIT ----
  document.querySelectorAll('.submission-form, .contact-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
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

      if (valid) {
        showToast('Formulario enviado correctamente (demo). Para envíos reales, use el correo electrónico indicado.');
        form.reset();
      } else {
        showToast('Por favor, complete todos los campos obligatorios.');
      }
    });
  });

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

    // Observe after content loads
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    }, 300);
  }

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
