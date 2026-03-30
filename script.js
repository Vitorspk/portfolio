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

function activateTab(tabName, pushState = true) {
    const name = tabName || TAB_DEFAULT;

    // Sidebar nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
        const isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });

    // Mobile tab strip
    document.querySelectorAll('.mobile-tab').forEach(btn => {
        const isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });

    // Content panels
    document.querySelectorAll('.tab-content').forEach(panel => {
        const isActive = panel.id === name;
        panel.classList.toggle('active', isActive);
        panel.style.display = '';
        panel.setAttribute('aria-hidden', !isActive);
    });

    // Update URL hash without triggering a scroll jump
    if (pushState) {
        history.pushState({ tab: name }, '', `#${name}`);
    }
}

// Delegated click handler for all nav items and mobile tabs (uses data-tab attribute)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const tab = btn.dataset.tab;
    if (!tabNames.includes(tab)) return;
    activateTab(tab);
    btn.blur();
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
        // rAF ensures the 0% is painted before the transition begins
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bar.style.width = target;
            });
        });
        observer.unobserve(bar);
    });
}

const barObserver = new IntersectionObserver(animateBars, {
    threshold: 0.2,
});

document.querySelectorAll('.bar-fill').forEach(bar => {
    // Stash the target width so we can animate from 0 on scroll-in
    if (!bar.dataset.width) {
        bar.dataset.width = bar.style.width || '0%';
    }
    bar.style.width = '0%';
    barObserver.observe(bar);
});

// ─── Keyboard Navigation (Arrow Keys) ────────────────────────────────────────

function currentTabIndex() {
    const hash = location.hash.replace('#', '');
    const idx = tabNames.indexOf(hash);
    return idx >= 0 ? idx : 0;
}

// Scope arrow key navigation to the nav containers so it doesn't
// hijack page scrolling when focus is elsewhere.
const navContainers = [
    document.querySelector('.sidebar-nav'),
    document.querySelector('.mobile-tabs'),
].filter(Boolean);

navContainers.forEach(container => {
    container.addEventListener('keydown', (e) => {
        let targetIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            targetIdx = (currentTabIndex() + 1) % tabNames.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            targetIdx = (currentTabIndex() - 1 + tabNames.length) % tabNames.length;
        }
        if (targetIdx < 0) return;
        activateTab(tabNames[targetIdx]);
        // Move focus to the newly active button so keyboard users don't lose their place
        const target = container.querySelector(`[data-tab="${tabNames[targetIdx]}"]`);
        if (target) target.focus();
    });
});
