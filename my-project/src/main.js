// src/main.js
import './style.css'
import './profile.css'
import './awarenessBG.css' 
import './navbar.js'
import './uv.js' 
import DataService from './dataService.js'; 

/**
 * US3.1: Awareness Data Visualization (Historical Data 1982 - 2025)
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
 * Global Bridge: Teammate module interceptor (Production Optimized)
 */
const setupUVInterceptor = () => {
    const originalUpdateDisplay = window.updateUVDisplay;
    
    // We override the global function so main.js can "hear" when the API finishes
    window.updateUVDisplay = function(uv) {
        // 1. Run the original team logic (colors/text on Dashboard)
        if (typeof originalUpdateDisplay === 'function') {
            originalUpdateDisplay(uv);
        }
        
        // 2. Explicitly sync to localStorage for other pages
        localStorage.setItem("uvData", JSON.stringify({
            uv: uv,
            updatedAt: Date.now()
        }));
        
        // 3. Update personalized calculations immediately
        updateProfilePreview();
        console.log("Global Sync: UV updated to", uv);
    };
};

/**
 * Global Lifecycle Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    initProfileSelection();
    initAwarenessCharts(); 
    
    // Small delay to ensure uv.js has finished loading its functions into window
    setTimeout(() => {
        setupUVInterceptor();
        updateProfilePreview();
    }, 200);
});

// Cross-tab sync: Update if user changes data in another tab
window.addEventListener('storage', (event) => {
    if (event.key === 'uvData' || event.key === 'userSkinType') {
        updateProfilePreview();
    }
});