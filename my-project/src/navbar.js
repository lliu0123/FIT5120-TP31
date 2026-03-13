// src/navbar.js

/**
 * load navbar
 */
function loadNavbar() {
    // 1. define navbar html structure
    const navHTML = `
    <nav class="navbar">
        <div class="nav-content">
            <div class="brand">
                <span class="logo-icon">☀️</span>
                <span class="brand-name">UV Safety Assistant</span>
            </div>
            <ul class="nav-links">
                <li><a href="index.html" class="nav-link" id="nav-index">Dashboard</a></li>
                <li><a href="awareness.html" class="nav-link" id="nav-awareness">UV Awareness</a></li>
                <li><a href="tools.html" class="nav-link" id="nav-tools">Protection Tools</a></li>
                <li><a href="profile.html" class="nav-link" id="nav-profile">Profile</a></li>
            </ul>
        </div>
    </nav>
    `;

    // 2. add navbar to the top(afterbegin)
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // 3. highlight the page user open
    // get the name of the file, e.g. "profile.html"
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    
    // match all items after remove the postfix .html
    const pageName = currentPage.replace('.html', '');
    
    // base on page name add active tag to it
    const activeLink = document.getElementById('nav-' + (pageName === '' ? 'index' : pageName));
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// run after dom content loaded
document.addEventListener('DOMContentLoaded', loadNavbar);