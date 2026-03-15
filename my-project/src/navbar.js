/**
 * Global Navbar Loader
 * Synchronizes navigation across Dashboard, Awareness, Tools, and Profile.
 */
function loadNavbar() {
    // 1. Unified HTML structure matching your professional style
    const navHTML = `
    <nav class="navbar">
        <div class="nav-content">
            <a href="index.html" class="brand-logo">
                <div class="logo-icon-box"></div><span class="brand-text">SUNSAFE</span>
            </a>
            <ul class="nav-links">
                <li><a href="index.html" class="nav-link" id="nav-index">Dashboard</a></li>
                <li><a href="awareness.html" class="nav-link" id="nav-awareness">UV Awareness</a></li>
                <li><a href="tools.html" class="nav-link" id="nav-tools">Protection Tools</a></li>
                <li><a href="profile.html" class="nav-link" id="nav-profile">Profile</a></li>
            </ul>
        </div>
    </nav>`;

    if (document.body) {
        // Prevent double navbar if one already exists in static HTML
        const existingNav = document.querySelector('.navbar');
        if (existingNav) {
            existingNav.remove();
        }

        // Inject at the very beginning of body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
        highlightCurrentPage();
    }
}

/**
 * Automatically adds 'active' class to the link matching current URL
 */
function highlightCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';
    
    // Normalize page name (e.g., 'awareness.html' -> 'awareness')
    let pageName = page.replace('.html', '');
    if (pageName === '' || pageName === 'index') {
        pageName = 'index';
    }
    
    // Safety check for tools page naming
    if (pageName === 'calculator' || pageName === 'clothing_advice') {
        pageName = 'tools';
    }

    const activeLink = document.getElementById('nav-' + pageName);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Ensure the script runs after the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}