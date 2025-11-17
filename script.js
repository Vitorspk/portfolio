// Tab Navigation
function showTab(event, tabName) {
    // Get all tabs and contents
    const allTabs = document.querySelectorAll('.tab');
    const allContents = document.querySelectorAll('.tab-content');

    // Remove all active classes AND inline styles
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    allContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = ''; // Remove inline style to let CSS take over
    });

    // Add active to clicked button
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Show target content
    const targetContent = document.getElementById(tabName);

    if (targetContent) {
        targetContent.classList.add('active');

        // Smooth scroll to top of content
        setTimeout(() => {
            targetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Reading Progress Bar
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.pageYOffset;
    const progress = (scrolled / documentHeight) * 100;
    progressBar.style.width = progress + '%';
});

// Initialize animations on load
window.addEventListener('load', () => {
    // Animate metric bars
    document.querySelectorAll('.bar-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
});

// Keyboard navigation - Arrow keys to switch tabs
let currentTabIndex = 0;
const tabs = document.querySelectorAll('.tab');

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        currentTabIndex = (currentTabIndex + 1) % tabs.length;
        tabs[currentTabIndex].click();
    } else if (e.key === 'ArrowLeft') {
        currentTabIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
        tabs[currentTabIndex].click();
    }
});
