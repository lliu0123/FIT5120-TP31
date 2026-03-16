// src/main.js
import './style.css'
import './profile.css'
import './awarenessBG.css' 
import './navbar.js'
import './uv.js' 
import DataService from './dataService.js'; 

/**
 * US3.1: Awareness Data Visualization
 */
const initAwarenessCharts = async () => {
    const tempBars = document.getElementById('temp-bars');
    const cancerBars = document.getElementById('cancer-bars');
    
    if (!tempBars || !cancerBars) return;

    try {
        const [tempData, cancerData] = await Promise.all([
            DataService.getTemperatureTrend(),
            DataService.getSkinCancerTrend()
        ]);

        const drawBars = (containerId, data, key, maxVal, unit = "") => {
            const container = document.getElementById(`${containerId}-bars`);
            if (!container) return;

            container.innerHTML = '';
            container.innerHTML = data.map(item => {
                const height = (item[key] / maxVal) * 100;
                return `
                    <div class="bar-group">
                        <div class="bar" 
                             style="height: 0%" 
                             data-h="${Math.max(height, 2)}%" 
                             data-value="${item.year}: ${item[key]}${unit}">
                        </div>
                    </div>
                `;
            }).join('');
            
            setTimeout(() => {
                const bars = container.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.height = bar.getAttribute('data-h');
                });
            }, 300); 
        };

        drawBars('temp', tempData, 'mean_temp_anomaly', 2.0, "°C"); 
        drawBars('cancer', cancerData, 'incidence_rate', 80, " cases"); 
        
    } catch (error) {
        console.error("Critical Error: Failed to load historical awareness data.", error);
    }
};

/**
 * US2.2: Personalized UV Protection Algorithm
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
 * Synchronize UI with Global UV State
 */
const updateProfilePreview = () => {
    const previewTime = document.getElementById('preview-burn-time');
    const previewSPF = document.getElementById('rec-spf-preview');
    const progressFill = document.querySelector('.progress-fill');
    
    if (!previewTime) return;

    const userSkin = localStorage.getItem('userSkinType') || '3';
    let currentUV = 0;

    try {
        const rawData = localStorage.getItem("uvData");
        if (rawData) {
            const parsed = JSON.parse(rawData);
            currentUV = parsed.uv || 0;
        }
    } catch (e) { console.error("Storage Sync Error:", e); }

    const localUVMeter = document.querySelector('.uv-meter-box .uv-value');
    const localUVStatus = document.querySelector('.uv-status-badge');

    if (localUVMeter && currentUV >= 0) {
        localUVMeter.textContent = currentUV;
        if (localUVStatus) {
            let status = "Low", statusColor = "#10b981";
            if (currentUV >= 11) { status = "Extreme"; statusColor = "#9333ea"; }
            else if (currentUV >= 8) { status = "Very High"; statusColor = "#ef4444"; }
            else if (currentUV >= 6) { status = "High"; statusColor = "#f97316"; }
            else if (currentUV >= 3) { status = "Moderate"; statusColor = "#facc15"; }
            
            localUVStatus.textContent = status;
            localUVStatus.style.color = statusColor;
            localUVStatus.style.backgroundColor = `${statusColor}1A`;
            localUVMeter.style.color = statusColor;
        }
    }

    const safety = getPersonalizedSafety(currentUV, userSkin);
    previewTime.textContent = safety.timeText;
    if (previewSPF) previewSPF.textContent = safety.spf;
    if (progressFill) progressFill.style.width = `${safety.riskPercent}%`;
};

/**
 * Carousel Animation Logic: Fixed 3-Point System with Forced Clean-up
 */
const initCarousel = () => {
  const cards = [
      document.getElementById('card-left'),
      document.getElementById('card-center'),
      document.getElementById('card-right')
  ];
  const dots = document.querySelectorAll('.dot');
  const wrapper = document.getElementById('carousel-wrapper');
  
  if (!cards[0] || !cards[1] || !cards[2]) return;

  // Initial layout state: 0=Left, 1=Center, 2=Right
  let cardPositions = [0, 1, 2]; 

  const updateUI = () => {
      cards.forEach((card, index) => {
          const posIndex = cardPositions[index];

          // 1. Remove initial Tailwind classes that conflict with JS dynamic positioning
          card.classList.remove('left-[90px]', 'right-[90px]', 'left-1/2', '-translate-x-1/2');

          // 2. Use setProperty with !important to ensure JS takes absolute priority
          card.style.setProperty('position', 'absolute', 'important');
          card.style.setProperty('right', 'auto', 'important');
          card.style.setProperty('margin', '0', 'important');
          card.style.setProperty('transition', 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)', 'important');

          if (posIndex === 1) { 
              // --- CENTER POSITION ---
              card.style.setProperty('left', '50%', 'important');
              card.style.setProperty('transform', 'translateX(-50%) scale(1)', 'important');
              card.style.setProperty('z-index', '30', 'important');
              card.style.setProperty('opacity', '1', 'important');
              card.style.setProperty('filter', 'blur(0px)', 'important');
              card.style.setProperty('width', '700px', 'important');
              card.style.setProperty('top', '10px', 'important');
          } else if (posIndex === 0) { 
              // --- LEFT POSITION ---
              card.style.setProperty('left', '0%', 'important');
              card.style.setProperty('transform', 'translateX(0) scale(0.8)', 'important');
              card.style.setProperty('z-index', '10', 'important');
              card.style.setProperty('opacity', '0.4', 'important');
              card.style.setProperty('filter', 'blur(2px)', 'important');
              card.style.setProperty('width', '500px', 'important');
              card.style.setProperty('top', '95px', 'important');
          } else { 
              // --- RIGHT POSITION ---
              card.style.setProperty('left', '100%', 'important');
              card.style.setProperty('transform', 'translateX(-100%) scale(0.8)', 'important');
              card.style.setProperty('z-index', '10', 'important');
              card.style.setProperty('opacity', '0.4', 'important');
              card.style.setProperty('filter', 'blur(2px)', 'important');
              card.style.setProperty('width', '500px', 'important');
              card.style.setProperty('top', '95px', 'important');
          }
      });

      // Update dot states based on which card is currently at Position 1 (Center)
      const activeIdx = cardPositions.indexOf(1);
      dots.forEach((dot, i) => {
          dot.style.setProperty('background-color', i === activeIdx ? 'white' : 'rgba(255,255,255,0.4)', 'important');
          dot.style.setProperty('width', i === activeIdx ? '24px' : '12px', 'important');
          dot.style.setProperty('transition', 'all 0.3s ease', 'important');
      });
  };

  const nextSlide = () => {
      // Rotation logic: L <- C <- R
      cardPositions = cardPositions.map(p => (p + 2) % 3);
      updateUI();
  };

  const goToSlide = (targetIdx) => {
      // Keep rotating until target card reaches Center Slot (1)
      while (cardPositions[targetIdx] !== 1) {
          cardPositions = cardPositions.map(p => (p + 2) % 3);
      }
      updateUI();
  };

  dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
          goToSlide(i);
          resetAutoPlay();
      });
  });

  let autoTimer = setInterval(nextSlide, 5000);

  const resetAutoPlay = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(nextSlide, 5000);
  };

  if (wrapper) {
      wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
      wrapper.addEventListener('mouseleave', () => resetAutoPlay());
  }

  updateUI();
};

/**
 * Profile Selection Logic
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
 * Global Bridge: Synchronizes team module with profile preview
 */
const setupUVInterceptor = () => {
    const originalUpdateDisplay = window.updateUVDisplay;
    
    window.updateUVDisplay = function(uv) {
        if (typeof originalUpdateDisplay === 'function') {
            originalUpdateDisplay(uv);
        }
        
        const existingData = JSON.parse(localStorage.getItem("uvData") || "{}");
        const newData = { ...existingData, uv: uv, updatedAt: Date.now() };
        localStorage.setItem("uvData", JSON.stringify(newData));
        
        updateProfilePreview();
    };
};

/**
 * Global Lifecycle Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    initProfileSelection();
    initAwarenessCharts(); 
    initCarousel(); 
    
    setTimeout(() => {
        setupUVInterceptor();
        updateProfilePreview();
    }, 200);
});

window.addEventListener('storage', (event) => {
    if (event.key === 'uvData' || event.key === 'userSkinType') {
        updateProfilePreview();
    }
});