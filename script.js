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

// All DOM-dependent setup runs after the document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Cache NodeLists once
    const navItems  = Array.from(document.querySelectorAll('.nav-item'));
    const mobTabs   = Array.from(document.querySelectorAll('.mobile-tab'));
    const tabPanels = Array.from(document.querySelectorAll('.tab-content'));

    // ─── activateTab ─────────────────────────────────────────────────────────

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

        if (pushState) {
            history.pushState({ tab: name }, '', `#${name}`);
        }
    }

    // ─── Delegated click handler ──────────────────────────────────────────────
    // Registered inside DOMContentLoaded so navItems/mobTabs/tabPanels are
    // guaranteed to be populated when a click fires.
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tab]');
        if (!btn) return;
        const tab = btn.dataset.tab;
        if (!tabNames.includes(tab)) return;
        activateTab(tab);
    });

    // ─── Browser back/forward ─────────────────────────────────────────────────
    window.addEventListener('popstate', (e) => {
        const raw = (e.state && e.state.tab) || location.hash.replace('#', '') || TAB_DEFAULT;
        const tab = tabNames.includes(raw) ? raw : TAB_DEFAULT;
        activateTab(tab, false);
    });

    // ─── Init from URL hash ───────────────────────────────────────────────────
    (function initFromHash() {
        const hash = location.hash.replace('#', '').trim();
        const validTab = tabNames.includes(hash) ? hash : TAB_DEFAULT;
        activateTab(validTab, false);
    })();

    // ─── Scroll to Top Button ─────────────────────────────────────────────────
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

    // ─── Reading Progress Bar (rAF throttled) ─────────────────────────────────
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        let rafId = null;
        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const docH = document.documentElement.scrollHeight - window.innerHeight;
                const pct = docH > 0 ? (window.pageYOffset / docH) * 100 : 0;
                progressBar.style.width = pct + '%';
                rafId = null;
            });
        }, { passive: true });
    }

    // ─── Metric Bar Animations (IntersectionObserver) ─────────────────────────
    const barObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const bar = entry.target;
            const target = bar.dataset.width || '0%';
            bar.style.width = '0%';
            // Double rAF ensures 0% paints before the CSS transition fires
            requestAnimationFrame(() => requestAnimationFrame(() => {
                bar.style.width = target;
            }));
            obs.unobserve(bar);
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.bar-fill').forEach(bar => {
        if (!bar.dataset.width) bar.dataset.width = bar.style.width || '0%';
        bar.style.width = '0%';
        barObserver.observe(bar);
    });

    // ─── Dual tablist inert/aria sync ─────────────────────────────────────────
    // sidebar-nav is visually hidden on mobile; mobile-tabs is hidden on desktop.
    // IMPORTANT CONTRACT: whichever nav is off-screen MUST stay inert + aria-hidden.
    // Without this, screen readers see two competing tablists pointing at the same panels.
    // syncTablists() is called on init and on every breakpoint crossing via matchMedia.
    const sidebarNav = document.querySelector('.sidebar-nav');
    const mobileNav  = document.querySelector('.mobile-tabs');

    if (sidebarNav && mobileNav) {
        const mq = window.matchMedia('(max-width: 768px)');

        function syncTablists() {
            const isMobile = mq.matches;
            sidebarNav.inert = isMobile;
            mobileNav.inert  = !isMobile;
            sidebarNav.setAttribute('aria-hidden', isMobile ? 'true' : 'false');
            mobileNav.setAttribute('aria-hidden', isMobile ? 'false' : 'true');

            // Update aria-labelledby on panels to point to the VISIBLE tablist's
            // button IDs — sidebar IDs on desktop, mobile IDs on mobile.
            // This ensures aria-labelledby never references a hidden/inert element.
            tabPanels.forEach(panel => {
                const tabName = panel.id;
                const labelId = isMobile
                    ? `mobile-tab-${tabName}`
                    : `tab-${tabName}`;
                panel.setAttribute('aria-labelledby', labelId);
            });
        }

        mq.addEventListener('change', syncTablists);
        syncTablists(); // set initial state
    }

    // ─── Keyboard Navigation (Arrow / Home / End) ─────────────────────────────
    const navContainers = [sidebarNav, mobileNav].filter(Boolean);

    navContainers.forEach(container => {
        container.addEventListener('keydown', (e) => {
            // Derive active index from hash — avoids sidebar/mobile list coupling
            const currentIdx = tabNames.indexOf(location.hash.replace('#', ''));
            const idx = currentIdx >= 0 ? currentIdx : 0;
            const len = tabNames.length;
            let targetIdx = -1;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                targetIdx = (idx + 1) % len;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                targetIdx = (idx - 1 + len) % len;
            } else if (e.key === 'Home') {
                e.preventDefault();
                targetIdx = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                targetIdx = len - 1;
            }

            if (targetIdx < 0) return;
            activateTab(tabNames[targetIdx]);
            // Move focus to the newly active button so keyboard users keep their place
            const target = container.querySelector(`[data-tab="${tabNames[targetIdx]}"]`);
            if (target) target.focus();
        });
    });
});
