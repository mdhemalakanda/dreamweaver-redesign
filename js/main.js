/* Dreamweaver Events — site JS (no dependencies)
   nav drawer · dropdown touch · reveals (reduced-motion aware) · lightbox · header state · to-top */
(function () {
  'use strict';
  var d = document, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || location.search.indexOf('noanim') > -1;

  /* header scrolled state */
  var header = d.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile drawer */
  var toggle = d.querySelector('.nav-toggle'), nav = d.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      d.body.style.overflow = open ? 'hidden' : '';
      if (open) { var f = nav.querySelector('a'); if (f) f.focus(); }
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { toggle.click(); toggle.focus(); }
    });
  }

  /* services dropdown on touch/click (hover handled in CSS) */
  d.querySelectorAll('.main-nav li.has-sub > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = a.parentElement;
      if (window.matchMedia('(max-width: 767.98px)').matches) {
        e.preventDefault(); li.classList.toggle('open');
        a.setAttribute('aria-expanded', li.classList.contains('open'));
      } else if (!li.classList.contains('open') && !a.getAttribute('href').includes('/')) {
        e.preventDefault(); li.classList.add('open');
      }
    });
  });

  /* scroll reveals */
  var items = d.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* lightbox for galleries */
  var groups = {};
  d.querySelectorAll('[data-lightbox]').forEach(function (a, i) {
    var g = a.getAttribute('data-lightbox') || 'default';
    (groups[g] = groups[g] || []).push(a);
    a.addEventListener('click', function (e) {
      e.preventDefault(); openLb(g, groups[g].indexOf(a));
    });
  });
  var lb = d.createElement('div');
  lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button class="lb-close" aria-label="Close gallery">×</button>' +
    '<button class="lb-nav lb-prev" aria-label="Previous image">‹</button>' +
    '<img alt="">' +
    '<button class="lb-nav lb-next" aria-label="Next image">›</button>';
  d.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), cur = 0, curGroup = null, lastFocus = null;
  function show(g, i) {
    cur = (i + groups[g].length) % groups[g].length;
    var a = groups[g][cur], img = a.querySelector('img');
    lbImg.src = a.getAttribute('href');
    lbImg.alt = img ? img.alt : '';
  }
  function openLb(g, i) { lastFocus = d.activeElement; curGroup = g; show(g, i); lb.classList.add('open'); lb.querySelector('.lb-close').focus(); d.body.style.overflow = 'hidden'; }
  function closeLb() { lb.classList.remove('open'); d.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(curGroup, cur - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(curGroup, cur + 1); });
  d.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(curGroup, cur - 1);
    if (e.key === 'ArrowRight') show(curGroup, cur + 1);
  });

  /* back to top */
  d.querySelectorAll('.to-top').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  });

  /* form validation + mailto handoff */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var field = f.closest('.field'), bad = !f.value.trim() ||
          (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        if (field) field.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) { e.preventDefault(); var b = form.querySelector('.field.invalid input,.field.invalid select,.field.invalid textarea'); if (b) b.focus(); return; }
      /* static build: hand the composed enquiry to WhatsApp */
      e.preventDefault();
      var lines = [];
      form.querySelectorAll('input,select,textarea').forEach(function (f) {
        if (f.classList.contains('hp') || !f.value.trim()) return;
        var lbl = form.querySelector('label[for="' + f.id + '"]');
        lines.push((lbl ? lbl.textContent.trim() : f.name) + ': ' + f.value.trim());
      });
      var num = form.getAttribute('data-wa') || '8801730828484';
      var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent('Event inquiry —\n' + lines.join('\n'));
      window.open(url, '_blank', 'noopener');
      var done = form.querySelector('.form-done');
      if (done) { done.hidden = false; done.focus(); form.reset(); }
    });
  });

  /* footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
