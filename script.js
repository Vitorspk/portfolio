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

// Cache NodeLists at DOMContentLoaded — safe if script is ever moved to <head>
let navItems, mobTabs, tabPanels;

document.addEventListener('DOMContentLoaded', () => {
    navItems  = Array.from(document.querySelectorAll('.nav-item'));
    mobTabs   = Array.from(document.querySelectorAll('.mobile-tab'));
    tabPanels = Array.from(document.querySelectorAll('.tab-content'));

    initFromHash();
    initScrollToTop();
    initProgressBar();
    initBarAnimations();
    initTablists();
    initKeyboardNav();
});

function activateTab(tabName, pushState = true) {
    const name = tabName || TAB_DEFAULT;

    // Sidebar nav items
    navItems.forEach(btn => {
        const isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Mobile tab strip
    mobTabs.forEach(btn => {
        const isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Content panels
    tabPanels.forEach(panel => {
        const isActive = panel.id === name;
        panel.classList.toggle('active', isActive);
        panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    // Update URL hash without triggering a scroll jump
    if (pushState) {
        history.pushState({ tab: name }, '', `#${name}`);
    }
}

// Delegated click handler — covers nav items, mobile tabs, and quick-nav buttons.
// No btn.blur(): :focus-visible suppresses the ring on mouse clicks, and keyboard
// users need focus to remain on the activated button.
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

// Read active tab from URL hash on initial load
function initFromHash() {
    const hash = location.hash.replace('#', '').trim();
    const validTab = tabNames.includes(hash) ? hash : TAB_DEFAULT;
    activateTab(validTab, false);
}

// ─── Scroll to Top Button ─────────────────────────────────────────────────────

function initScrollToTop() {
    const btn = document.getElementById('scrollToTop');
    if (!btn) return;

    const onScroll = debounce(() => {
        btn.classList.toggle('visible', window.pageYOffset > 300);
    }, 80);

    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Reading Progress Bar ─────────────────────────────────────────────────────

function initProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;

    // rAF throttle keeps updates locked to the paint cycle
    let rafId = null;
    window.addEventListener('scroll', () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docH > 0 ? (window.pageYOffset / docH) * 100 : 0;
            bar.style.width = pct + '%';
            rafId = null;
        });
    }, { passive: true });
}

// ─── Metric Bar Animations (IntersectionObserver) ─────────────────────────────

function initBarAnimations() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const bar = entry.target;
            const target = bar.dataset.width || '0%';
            bar.style.width = '0%';
            // Double rAF ensures the 0% paints before the CSS transition fires
            requestAnimationFrame(() => requestAnimationFrame(() => {
                bar.style.width = target;
            }));
            obs.unobserve(bar);
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.bar-fill').forEach(bar => {
        if (!bar.dataset.width) bar.dataset.width = bar.style.width || '0%';
        bar.style.width = '0%';
        observer.observe(bar);
    });
}

// ─── Dual tablist inert/aria sync ────────────────────────────────────────────
// sidebar-nav is visually hidden on mobile; mobile-tabs is hidden on desktop.
// IMPORTANT: whichever is off-screen MUST be kept inert and aria-hidden so that
// screen readers don't see two conflicting tablists controlling the same panels.
// syncTablists() is called on init and on every breakpoint crossing.

function initTablists() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    const mobileNav  = document.querySelector('.mobile-tabs');
    if (!sidebarNav || !mobileNav) return;

    // matchMedia fires only on breakpoint crossings — cheaper than getComputedStyle
    // inside a resize handler which forces style recalculation every event.
    const mq = window.matchMedia('(max-width: 768px)');

    function syncTablists(e) {
        const isMobile = typeof e === 'object' ? e.matches : mq.matches;
        sidebarNav.inert = isMobile;
        mobileNav.inert  = !isMobile;
        sidebarNav.setAttribute('aria-hidden', isMobile ? 'true' : 'false');
        mobileNav.setAttribute('aria-hidden', isMobile ? 'false' : 'true');
    }

    mq.addEventListener('change', syncTablists);
    syncTablists();
}

// ─── Keyboard Navigation (Arrow / Home / End) ─────────────────────────────────

function initKeyboardNav() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    const mobileNav  = document.querySelector('.mobile-tabs');
    const containers = [sidebarNav, mobileNav].filter(Boolean);

    function activeIndex() {
        // Read from cached navItems — avoids re-parsing location.hash
        return navItems.findIndex(btn => btn.classList.contains('active'));
    }

    containers.forEach(container => {
        container.addEventListener('keydown', (e) => {
            const len = tabNames.length;
            let idx = -1;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                idx = (activeIndex() + 1) % len;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                idx = (activeIndex() - 1 + len) % len;
            } else if (e.key === 'Home') {
                e.preventDefault();
                idx = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                idx = len - 1;
            }
            if (idx < 0) return;
            activateTab(tabNames[idx]);
            // Move focus to the newly active button so keyboard users keep their place
            const target = container.querySelector(`[data-tab="${tabNames[idx]}"]`);
            if (target) target.focus();
        });
    });
}
