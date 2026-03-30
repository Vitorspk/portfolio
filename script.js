// ─── Utilities ───────────────────────────────────────────────────────────────

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────

const TAB_DEFAULT = 'overview';
const tabNames = ['overview', 'cases', 'experience', 'aiml', 'finops', 'technical', 'achievements', 'skills'];

// Cache NodeLists once — avoids repeated querySelectorAll on every tab click
const navItems  = Array.from(document.querySelectorAll('.nav-item'));
const mobTabs   = Array.from(document.querySelectorAll('.mobile-tab'));
const tabPanels = Array.from(document.querySelectorAll('.tab-content'));

function activateTab(tabName, pushState = true) {
    const name = tabName || TAB_DEFAULT;

    // Sidebar nav items
    navItems.forEach(btn => {
        const isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Mobile tab strip
    mobTabs.forEach(btn => {
        const isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Content panels
    tabPanels.forEach(panel => {
        const isActive = panel.id === name;
        panel.classList.toggle('active', isActive);
        panel.setAttribute('aria-hidden', !isActive);
    });

    // Update URL hash without triggering a scroll jump
    if (pushState) {
        history.pushState({ tab: name }, '', `#${name}`);
    }
}

// Delegated click handler for all nav items, mobile tabs, and quick-nav buttons
// Note: no btn.blur() — :focus-visible suppresses the ring on mouse clicks,
// and keyboard users need focus to stay on the activated button.
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const tab = btn.dataset.tab;
    if (!tabNames.includes(tab)) return;
    activateTab(tab);
});

// Browser back/forward
window.addEventListener('popstate', (e) => {
    const raw = (e.state && e.state.tab) || location.hash.replace('#', '') || TAB_DEFAULT;
    const tab = tabNames.includes(raw) ? raw : TAB_DEFAULT;
    activateTab(tab, false);
});

// Init from URL hash on load — validate against known tabs before activating
(function initFromHash() {
    const hash = location.hash.replace('#', '').trim();
    const validTab = tabNames.includes(hash) ? hash : TAB_DEFAULT;
    activateTab(validTab, false);
})();

// ─── Scroll to Top Button ─────────────────────────────────────────────────────

const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
    const onScroll = debounce(() => {
        scrollToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
    }, 80);

    window.addEventListener('scroll', onScroll, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ─── Reading Progress Bar ─────────────────────────────────────────────────────

const progressBar = document.getElementById('progressBar');

if (progressBar) {
    const onProgress = debounce(() => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? (window.pageYOffset / docH) * 100 : 0;
        progressBar.style.width = pct + '%';
    }, 30);

    window.addEventListener('scroll', onProgress, { passive: true });
}

// ─── Metric Bar Animations (IntersectionObserver) ─────────────────────────────

function animateBars(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const target = bar.dataset.width || bar.style.width || '0%';
        bar.style.width = '0%';
        // Double rAF ensures the 0% paints before the CSS transition begins
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bar.style.width = target;
            });
        });
        observer.unobserve(bar);
    });
}

const barObserver = new IntersectionObserver(animateBars, { threshold: 0.2 });

document.querySelectorAll('.bar-fill').forEach(bar => {
    if (!bar.dataset.width) {
        bar.dataset.width = bar.style.width || '0%';
    }
    bar.style.width = '0%';
    barObserver.observe(bar);
});

// ─── Dual tablist inert/aria sync ────────────────────────────────────────────
// sidebar-nav is hidden on mobile, mobile-tabs is hidden on desktop.
// Use `inert` (handles both AT hiding and Tab exclusion) on whichever is off-screen.
const sidebarNav = document.querySelector('.sidebar-nav');
const mobileNav  = document.querySelector('.mobile-tabs');

function syncTablists() {
    if (!sidebarNav || !mobileNav) return;
    const mobileVisible = window.getComputedStyle(mobileNav).display !== 'none';
    sidebarNav.inert = mobileVisible;
    mobileNav.inert  = !mobileVisible;
    sidebarNav.setAttribute('aria-hidden', mobileVisible);
    mobileNav.setAttribute('aria-hidden', !mobileVisible);
}

syncTablists();
window.addEventListener('resize', debounce(syncTablists, 150));

// ─── Keyboard Navigation (Arrow / Home / End) ─────────────────────────────────

function currentTabIndex() {
    const hash = location.hash.replace('#', '');
    const idx = tabNames.indexOf(hash);
    return idx >= 0 ? idx : 0;
}

// Scoped to nav containers — does not interfere with page scrolling elsewhere
const navContainers = [sidebarNav, mobileNav].filter(Boolean);

navContainers.forEach(container => {
    container.addEventListener('keydown', (e) => {
        let targetIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            targetIdx = (currentTabIndex() + 1) % tabNames.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            targetIdx = (currentTabIndex() - 1 + tabNames.length) % tabNames.length;
        } else if (e.key === 'Home') {
            e.preventDefault();
            targetIdx = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            targetIdx = tabNames.length - 1;
        }
        if (targetIdx < 0) return;
        activateTab(tabNames[targetIdx]);
        // Move focus to newly active button so keyboard users keep their place
        const target = container.querySelector(`[data-tab="${tabNames[targetIdx]}"]`);
        if (target) target.focus();
    });
});
