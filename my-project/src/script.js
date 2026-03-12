/* --- Web Navigation Logic --- */

function handleNavigation() {
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            links.forEach(l => l.classList.remove('active'));
            
            // Add active class to the current link
            this.classList.add('active');
            
            console.log("Navigating to:", this.getAttribute('href'));
        });
    });
}

/* --- App Initializer --- */
document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();

    // Example logic for the start button
    const startBtn = document.getElementById('start-timer');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            console.log('Timer started');
        });
    }
});