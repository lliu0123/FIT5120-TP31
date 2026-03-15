import './style.css'
import './config.js'
import './navbar.js'
import './cards.js'
import './uv.js'
import './script.js'

/**
 * Handle Dashboard initialization (Index page)
 * Prevents overwriting custom HTML in awareness.html
 */
const appElement = document.querySelector('#app');
if (appElement) {
    appElement.innerHTML = `
      <div class="fade-in">
        <h1>SunSafe Dashboard</h1>
        <p class="text-sub">Vite + Vanilla JS Environment Ready</p>
      </div>
    `;
}

/**
 * Handle Chart Animations (Awareness page)
 * Animates bar heights based on data-height attributes
 */
const initChartAnimations = () => {
    const bars = document.querySelectorAll('.bar');
    
    if (bars.length > 0) {
        // Small delay to ensure the browser registers initial state (height: 0)
        setTimeout(() => {
            bars.forEach(bar => {
                const targetHeight = bar.getAttribute('data-height');
                if (targetHeight) {
                    bar.style.height = targetHeight;
                }
            });
        }, 400);
    }
};

/**
 * Initialize components based on DOM readiness
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChartAnimations);
} else {
    // If DOM is already parsed (common during Vite HMR), run immediately
    initChartAnimations();
}

/**
 * Optional: Counter setup for testing purposes
 */
const counterBtn = document.querySelector('#counter');
if (counterBtn) {
    // Dynamic import to keep main bundle clean
    import('./counter.js').then(({ setupCounter }) => {
        setupCounter(counterBtn);
    });
}