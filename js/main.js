/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */

// ── CURSOR ────────────────────────────────────────────────
const cursor     = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// ── NAVBAR SCROLL ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNav();
});

// ── ACTIVE NAV LINK ───────────────────────────────────────
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

// ── HAMBURGER ─────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('mobile-open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
});

// ── HERO ROLE TYPEWRITER ──────────────────────────────────
const roles = [
  'Electronics Engineering Student',
  'Embedded Systems Developer',
  'PLC & Automation Enthusiast',
  'Arduino & PID Control Builder',
];
let roleIdx = 0, charIdx = 0, deleting = false;
const roleEl = document.querySelector('.role-anim');

function typeRole() {
  if (!roleEl) return;
  const role = roles[roleIdx];
  if (!deleting) {
    roleEl.textContent = role.slice(0, ++charIdx);
    if (charIdx === role.length) { deleting = true; setTimeout(typeRole, 1800); return; }
  } else {
    roleEl.textContent = role.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
  }
  setTimeout(typeRole, deleting ? 40 : 65);
}
typeRole();

// ── SCROLL REVEAL ─────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── LOAD PROJECTS ─────────────────────────────────────────
async function loadProjects() {
  const grid   = document.getElementById('projectsGrid');
  const filters = document.querySelectorAll('.filter-btn');
  if (!grid) return;

  let projects = [];
  try {
    const res  = await fetch('data/projects.json');
    projects   = await res.json();
  } catch (e) {
    console.warn('Could not load projects.json, using fallback');
    return;
  }

  function renderProjects(filter = 'All') {
    const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);
    grid.innerHTML = '';
    filtered.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'project-card reveal reveal-delay-' + (Math.min(i % 3 + 1, 3));
      card.innerHTML = `
        <div class="project-thumb">
          <div class="project-thumb-placeholder">${getCategoryIcon(p.category)}</div>
          <span class="project-status-badge ${p.status === 'Completed' ? 'completed' : 'in-progress'}">
            ${p.status}
          </span>
        </div>
        <div class="project-body">
          <div class="project-category">${p.category}</div>
          <div class="project-title">${p.title}</div>
          <div class="project-subtitle">${p.subtitle}</div>
          <div class="project-summary">${p.summary}</div>
          <div class="project-footer">
            <div class="project-tags-inline">
              ${p.tags.slice(0,3).map(t => `<span class="project-tag-inline">${t}</span>`).join('')}
            </div>
            <span class="project-arrow">→</span>
          </div>
        </div>`;
      card.addEventListener('click', () => openModal(p));
      grid.appendChild(card);
    });
    // re-observe new cards
    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  renderProjects();

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.filter);
    });
  });
}

function getCategoryIcon(cat) {
  const map = {
    'PLC & Automation': '⚙️',
    'Embedded Systems': '🔌',
    'Web & SCADA': '🖥️',
    'Circuit Design': '📐',
  };
  return map[cat] || '💡';
}

// ── PROJECT MODAL ─────────────────────────────────────────
const overlay = document.getElementById('modalOverlay');
const modal   = document.getElementById('modal');

function openModal(p) {
  document.getElementById('modalCategory').textContent  = p.category;
  document.getElementById('modalTitle').textContent     = p.title;
  document.getElementById('modalSubtitle').textContent  = p.subtitle;
  document.getElementById('modalYear').textContent      = p.year;
  document.getElementById('modalStatus').textContent    = p.status;
  document.getElementById('modalStatus').className      = 'project-status-badge ' + (p.status === 'Completed' ? 'completed' : 'in-progress');
  document.getElementById('modalThumb').textContent     = getCategoryIcon(p.category);
  document.getElementById('modalDesc').textContent      = p.description;
  document.getElementById('modalHighlights').innerHTML  = p.highlights.map(h => `<div class="modal-highlight">${h}</div>`).join('');
  document.getElementById('modalTags').innerHTML        = p.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');

  const githubBtn = document.getElementById('modalGithub');
  const demoBtn   = document.getElementById('modalDemo');
  githubBtn.style.display = p.github ? 'inline-flex' : 'none';
  githubBtn.href = p.github;
  demoBtn.style.display   = p.demo ? 'inline-flex' : 'none';
  demoBtn.href = p.demo;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── CONTACT FORM ──────────────────────────────────────────
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-primary');
  const orig = btn.textContent;
  btn.textContent = 'Sent ✓';
  btn.style.background = '#00ff88';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; e.target.reset(); }, 3000);
});

// ── SMOOTH SCROLL ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
});
