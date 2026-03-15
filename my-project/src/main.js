// src/main.js
import './style.css'
import './profile.css'
import './navbar.js'
import './uv.js' 

/**
 * US2.2: Core Calculation Logic
 * Calculates burn time and SPF recommendations
 */
const getPersonalizedSafety = (uvIndex, skinType) => {
    const sensitivity = { '1': 2.5, '2': 2.0, '3': 1.5, '4': 1.0, '5': 0.7 };
    const factor = sensitivity[skinType] || 1.5; 
    const minutes = uvIndex > 0 ? Math.round(200 / (uvIndex * factor)) : 480;
    
    let recommendedSPF = "None";
    if (uvIndex >= 3) {
        if (skinType <= 2) recommendedSPF = "50+";
        else if (skinType <= 4) recommendedSPF = "30+";
        else recommendedSPF = "15+";
    }

    return {
        timeText: minutes > 120 ? "120+ mins" : `${minutes} mins`,
        spf: `SPF ${recommendedSPF}`,
        riskPercent: Math.min((uvIndex / 11) * 100, 100)
    };
};

/**
 * Update UI for Profile Preview
 */
const updateProfilePreview = () => {
    const previewTime = document.getElementById('preview-burn-time');
    const previewSPF = document.getElementById('rec-spf-preview');
    const progressFill = document.querySelector('.progress-fill');
    
    if (!previewTime && !previewSPF) return;

    const userSkin = localStorage.getItem('userSkinType') || '3';
    
    // --- STRATEGY: Get real-time UV from the DOM ---
    const uvElement = document.querySelector('.uv-value');
    const uvText = uvElement ? uvElement.textContent : "0";
    // Strip any non-numeric characters to get the pure UV number
    const currentUV = parseInt(uvText.replace(/[^0-9]/g, '')) || 0; 

    const safety = getPersonalizedSafety(currentUV, userSkin);

    if (previewTime) previewTime.textContent = safety.timeText;
    if (previewSPF) previewSPF.textContent = safety.spf;
    if (progressFill) progressFill.style.width = `${safety.riskPercent}%`;
};

/**
 * DOUBLE PROTECTION: Watch the UV element for changes
 * If teammate's script updates the text, this will detect it instantly.
 */
const startUVObserver = () => {
    const uvTarget = document.querySelector('.uv-value');
    if (!uvTarget) return;

    const observer = new MutationObserver(() => {
        console.log("UV change detected via Observer");
        updateProfilePreview();
    });

    observer.observe(uvTarget, { childList: true, characterData: true, subtree: true });
};

/**
 * Interactions: Skin Card Selection
 */
const initProfileSelection = () => {
    const skinOptions = document.querySelectorAll('.skin-option-card');
    if (!skinOptions.length) return;

    const savedSkin = localStorage.getItem('userSkinType') || '3';
    skinOptions.forEach(opt => {
        if (opt.getAttribute('data-skin') === savedSkin) opt.classList.add('selected');
    });

    skinOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedType = option.getAttribute('data-skin');
            localStorage.setItem('userSkinType', selectedType);
            
            skinOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            updateProfilePreview();

            const status = document.getElementById('save-status');
            if (status) {
                status.classList.add('visible');
                setTimeout(() => status.classList.remove('visible'), 2000);
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initProfileSelection();
    startUVObserver(); // Start watching for UV text changes
    
    // Fallback: Initial calculation after a short delay
    setTimeout(updateProfilePreview, 1500);
});

/**
 * Global Hook for Teammate's update function
 */
const originalUpdateDisplay = window.updateUVDisplay;
if (typeof originalUpdateDisplay === 'function') {
    window.updateUVDisplay = function(uv) {
        originalUpdateDisplay(uv);
        updateProfilePreview();
    };
}