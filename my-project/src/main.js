// src/main.js
import './style.css'
import './config.js'
import './navbar.js'
import './cards.js'
import './uv.js' // Supporting logic from teammates
import './script.js'

/**
 * AC2 & AC3: Core Logic to calculate personalized safety info
 * @param {number} uvIndex - Real-time UV index from uv.js
 * @param {string} skinType - The skin type ID (1-5) from localStorage (AC1)
 */
const getPersonalizedSafety = (uvIndex, skinType) => {
    // Sensitivity factor mapping based on Fitzpatrick Scale
    // Type I is most sensitive (2.5), Type V is most resilient (0.7)
    const sensitivity = { '1': 2.5, '2': 2.0, '3': 1.5, '4': 1.0, '5': 0.7 };
    const factor = sensitivity[skinType] || 1.5; 

    // AC2: Calculate time to damage (Minutes)
    // Formula: 200 / (UV_Index * Sensitivity_Factor)
    const minutes = uvIndex > 0 ? Math.round(200 / (uvIndex * factor)) : 480;
    
    // AC3: Recommend SPF based on skin and UV intensity
    let recommendedSPF = "None";
    if (uvIndex >= 3) {
        if (skinType <= 2) recommendedSPF = "50+";
        else if (skinType <= 4) recommendedSPF = "30+";
        else recommendedSPF = "15+";
    }

    return {
        timeText: minutes > 120 ? "120+ mins" : `${minutes} mins`,
        spf: recommendedSPF
    };
};

/**
 * Function to render personalized data into the UI
 * Dynamically creates a container if it doesn't exist
 * @param {number} uv - Current UV index
 */
const injectPersonalizedInfo = (uv) => {
    // AC1: Retrieve user's saved skin tone from local storage
    const userSkin = localStorage.getItem('userSkinType') || '3';
    const safety = getPersonalizedSafety(uv, userSkin);

    // Find or create the personalized advice container
    let adviceEl = document.getElementById('personalized-advice');
    
    if (!adviceEl) {
        const uvCard = document.getElementById('uvCard');
        if (uvCard) {
            adviceEl = document.createElement('div');
            adviceEl.id = 'personalized-advice';
            // Styling with Glassmorphism to match your Dashboard design
            adviceEl.className = 'mt-6 flex justify-center gap-4 fade-in';
            // Insert the new element directly after the teammate's UV card
            uvCard.parentNode.insertBefore(adviceEl, uvCard.nextSibling);
        }
    }

    if (adviceEl) {
        adviceEl.innerHTML = `
          <div class="bg-white/40 backdrop-blur-md rounded-3xl p-4 border border-white/30 shadow-sm w-[140px] text-center">
              <p class="text-[10px] uppercase tracking-wider opacity-60 mb-1">Time to Damage</p>
              <p class="text-xl font-extrabold text-[#1d1d1f]">${safety.timeText}</p>
          </div>
          <div class="bg-white/40 backdrop-blur-md rounded-3xl p-4 border border-white/30 shadow-sm w-[140px] text-center">
              <p class="text-[10px] uppercase tracking-wider opacity-60 mb-1">Rec. Protection</p>
              <p class="text-xl font-extrabold text-[#1d1d1f]">SPF ${safety.spf}</p>
          </div>
        `;
    }
};

/**
 * Hook into teammate's global update function in uv.js
 * This ensures that whenever the UV index is updated, 
 * the personalized advice updates simultaneously.
 */
const originalUpdateDisplay = window.updateUVDisplay;
if (typeof originalUpdateDisplay === 'function') {
    window.updateUVDisplay = function(uv) {
        // Execute the teammate's original UI updates (colors, UV text, etc.)
        originalUpdateDisplay(uv);
        
        // Execute personalized logic for US2.2
        injectPersonalizedInfo(uv);
    };
}

/**
 * Handle Chart Animations (Awareness page)
 */
const initChartAnimations = () => {
    const bars = document.querySelectorAll('.bar');
    if (bars.length > 0) {
        setTimeout(() => {
            bars.forEach(bar => {
                const targetHeight = bar.getAttribute('data-height');
                if (targetHeight) bar.style.height = targetHeight;
            });
        }, 400);
    }
};

// Application entry point
document.addEventListener('DOMContentLoaded', () => {
    initChartAnimations();
    
    // Check if there is an existing UV value on the page during initial load
    const initialUVValue = document.querySelector('.uv-value');
    if (initialUVValue) {
        const uv = parseInt(initialUVValue.textContent);
        if (!isNaN(uv)) {
            injectPersonalizedInfo(uv);
        }
    }
});