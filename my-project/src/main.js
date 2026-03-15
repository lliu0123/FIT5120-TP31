// src/main.js
import './style.css'
import './profile.css'
import './navbar.js'
import './uv.js' // Team module

/**
 * US2.2: Core Calculation Logic
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

const updateProfilePreview = () => {
  const previewTime = document.getElementById('preview-burn-time');
  const previewSPF = document.getElementById('rec-spf-preview');
  const progressFill = document.querySelector('.progress-fill');
  
  if (!previewTime) return; // Not on profile page

  // 1. Get Skin Type
  const userSkin = localStorage.getItem('userSkinType') || '3';
  
  // 2. Get UV from Team's specific storage structure 'uvData'
  let currentUV = 0;
  try {
      const rawData = localStorage.getItem("uvData");
      if (rawData) {
          const parsed = JSON.parse(rawData);
          currentUV = parsed.uv || 0;
      }
  } catch (e) {
      console.error("Failed to parse team uvData", e);
  }

  // Fallback if storage is empty
  if (currentUV === 0) {
      const uvText = document.querySelector('.uv-meter-box .uv-value')?.textContent || "0";
      currentUV = parseInt(uvText.replace(/[^0-9]/g, '')) || 0;
  }

  // 3. Sync the Local UV Meter (Number + Status Badge)
  const localUVMeter = document.querySelector('.uv-meter-box .uv-value');
  const localUVStatus = document.querySelector('.uv-status-badge');

  if (localUVMeter && currentUV > 0) {
      localUVMeter.textContent = currentUV;
      
      // Update the Status Badge text and color based on UV index
      if (localUVStatus) {
          let status = "Low";
          let statusColor = "#10b981"; // Green
          
          if (currentUV >= 11) { status = "Extreme"; statusColor = "#9333ea"; }
          else if (currentUV >= 8) { status = "Very High"; statusColor = "#ef4444"; }
          else if (currentUV >= 6) { status = "High"; statusColor = "#f97316"; }
          else if (currentUV >= 3) { status = "Moderate"; statusColor = "#facc15"; }
          
          localUVStatus.textContent = status;
          localUVStatus.style.color = statusColor;
          localUVStatus.style.backgroundColor = `${statusColor}1A`; // 10% opacity
          localUVMeter.style.color = statusColor;
      }
  }

  // 4. Run Personalized Calculation
  const safety = getPersonalizedSafety(currentUV, userSkin);

  // 5. Render calculations
  previewTime.textContent = safety.timeText;
  if (previewSPF) previewSPF.textContent = safety.spf;
  if (progressFill) progressFill.style.width = `${safety.riskPercent}%`;
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

/**
 * Global Lifecycle
 */
document.addEventListener('DOMContentLoaded', () => {
    initProfileSelection();
    
    // Initial sync
    setTimeout(updateProfilePreview, 500);
});

/**
 * Intercept Team's UV Update
 * Since they exposed window.updateUVDisplay, we can hook into it.
 */
const originalUpdateDisplay = window.updateUVDisplay;
if (typeof originalUpdateDisplay === 'function') {
    window.updateUVDisplay = function(uv) {
        // Execute original logic (colors, text, etc.)
        originalUpdateDisplay(uv);
        
        // Save to our logic's expectations and refresh profile
        updateProfilePreview();
    };
}