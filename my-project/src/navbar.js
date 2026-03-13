function loadNavbar() {
    const navHTML = `
    <nav class="navbar">
        <div class="nav-content">
            <div class="brand">☀️ UV Safety Assistant</div>
            <ul class="nav-links">
                <li><a href="index.html" class="nav-link" id="nav-index">Dashboard</a></li>
                <li><a href="awareness.html" class="nav-link" id="nav-awareness">UV Awareness</a></li>
                <li><a href="tools.html" class="nav-link" id="nav-tools">Protection Tools</a></li>
                <li><a href="profile.html" class="nav-link" id="nav-profile">Profile</a></li>
            </ul>
        </div>
    </nav>`;

    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', navHTML);
        highlightCurrentPage();
    }
}

function highlightCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';
    const pageName = page.replace('.html', '') || 'index';
    const activeLink = document.getElementById('nav-' + pageName);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}