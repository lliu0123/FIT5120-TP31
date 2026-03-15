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
    const sensitivity = { '1': 2.5, '2': 2.0, '3': 1.5, '4': 1.0, '5': 0.7 };
    const factor = sensitivity[skinType] || 1.5; 

    // AC2: Calculate time to damage (Minutes)
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
 * Function to render personalized data into the UI (Dashboard & Profile)
 * @param {number} uv - Current UV index
 */
const injectPersonalizedInfo = (uv) => {
    const userSkin = localStorage.getItem('userSkinType') || '3';
    const safety = getPersonalizedSafety(uv, userSkin);

    // --- Part A: Handle Dashboard UI (The two small glass cards) ---
    let adviceEl = document.getElementById('personalized-advice');
    if (!adviceEl) {
        const uvCard = document.getElementById('uvCard');
        if (uvCard) {
            adviceEl = document.createElement('div');
            adviceEl.id = 'personalized-advice';
            adviceEl.className = 'mt-6 flex justify-center gap-4 fade-in';
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

    // --- Part B: Handle Profile Page Preview (The burn time display) ---
    const previewBurn = document.getElementById('preview-burn-time');
    if (previewBurn) {
        previewBurn.textContent = safety.timeText;
    }
};

/**
 * Hook into teammate's global update function in uv.js
 */
const originalUpdateDisplay = window.updateUVDisplay;
if (typeof originalUpdateDisplay === 'function') {
    window.updateUVDisplay = function(uv) {
        originalUpdateDisplay(uv); // Teammate's logic
        injectPersonalizedInfo(uv); // US2.2 Personalization logic
    };
}

/**
 * Awareness Page: Handle Chart Animations
 */
const initChartAnimations = () => {
    const bars = document.querySelectorAll('.bar');
    if (bars.length > 0) {
        setTimeout(() => {
            bars.forEach(bar => {
                const targetHeight = bar.getAttribute('data-height') || bar.style.height;
                if (targetHeight) bar.style.height = targetHeight;
            });
        }, 400);
    }
};

/**
 * Profile Page: Handle Skin Tone Selection Interactions
 */
const initProfileSelection = () => {
    const skinOptions = document.querySelectorAll('.skin-option');
    if (!skinOptions.length) return;

    // Highlight saved preference on load
    const savedSkin = localStorage.getItem('userSkinType') || '3';
    skinOptions.forEach(opt => {
        if (opt.getAttribute('data-skin') === savedSkin) opt.classList.add('selected');
    });

    // Handle clicks
    skinOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedType = option.getAttribute('data-skin');
            localStorage.setItem('userSkinType', selectedType);
            
            // Visual feedback
            skinOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Re-calculate immediately
            const currentUVStr = document.querySelector('.uv-value')?.textContent || "0";
            const currentUV = parseInt(currentUVStr);
            injectPersonalizedInfo(isNaN(currentUV) ? 0 : currentUV);
        });
    });
};

// Application entry point
document.addEventListener('DOMContentLoaded', () => {
    // Run page-specific initializers
    initChartAnimations();
    initProfileSelection();
    
    // Initial data injection for Dashboard
    const initialUVValue = document.querySelector('.uv-value');
    if (initialUVValue) {
        const uv = parseInt(initialUVValue.textContent);
        if (!isNaN(uv)) {
            injectPersonalizedInfo(uv);
        }
    }
});