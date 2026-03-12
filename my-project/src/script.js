/* --- Navigation Interactivity --- */

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove 'active' class from all navigation items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add 'active' class to the clicked item
            this.classList.add('active');
            
            // Note: add logic here to switch views/pages
            console.log("Navigated to:", this.querySelector('.nav-label').textContent);
        });
    });
}

/* --- Timer Logic (Placeholder) --- */

function initTimer() {
    const startBtn = document.getElementById('start-timer');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            alert('Sunscreen reapply timer started!');
        });
    }
}

/* Initialize all functions when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTimer();
});