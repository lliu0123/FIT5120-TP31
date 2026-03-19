/**
 * UV-related logic (location + UV fetch + display)
 *
 * This module is intentionally separated from script.js to keep the page logic
 * modular and easier to maintain as the app grows.
 */

async function getLocationName(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=en`
    );
    if (!response.ok) throw new Error('Geocoding API request failed');

    const data = await response.json();
    if (data && data.address) {
      const address = data.address;
      const city = address.city || address.town || address.village || address.suburb;
      const state = address.state || address.region;
      const country = address.country;

      if (city && state) return `${city}, ${state}`;
      if (city) return `${city}, ${country}`;
      if (state) return `${state}, ${country}`;
      return data.display_name.split(',')[0] || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    }

    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  } catch (error) {
    console.error('Error getting location name:', error);
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
}

async function getUVIndex(lat, lng) {
  const BASE_URL =
    window.AppConfig?.OPEN_METEO_BASE_URL ||
    'https://api.open-meteo.com/v1/forecast';

  try {
    const url =
      `${BASE_URL}?latitude=${lat}&longitude=${lng}` +
      `&current=uv_index` +
      `&hourly=uv_index` +
      `&forecast_days=1` +
      `&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 1) First choice: use current UV directly
    const currentUV = data?.current?.uv_index;
    if (typeof currentUV === 'number' && !Number.isNaN(currentUV)) {
      return Number(currentUV.toFixed(1));
    }

    // 2) Fallback: use hourly UV and find the closest hour
    const hourlyTimes = data?.hourly?.time;
    const hourlyUV = data?.hourly?.uv_index;

    if (
      !Array.isArray(hourlyTimes) ||
      !Array.isArray(hourlyUV) ||
      hourlyTimes.length === 0 ||
      hourlyUV.length === 0
    ) {
      throw new Error('Invalid API response format');
    }

    const now = Date.now();
    let closestIndex = 0;
    let smallestDiff = Infinity;

    for (let i = 0; i < hourlyTimes.length; i++) {
      const ts = new Date(hourlyTimes[i]).getTime();
      if (Number.isNaN(ts)) continue;

      const diff = Math.abs(ts - now);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIndex = i;
      }
    }

    const fallbackUV = hourlyUV[closestIndex];
    if (typeof fallbackUV !== 'number' || Number.isNaN(fallbackUV)) {
      throw new Error('No valid UV value found');
    }

    return Number(fallbackUV.toFixed(1));
  } catch (error) {
    console.error('Error fetching UV data:', error);
    showUVError(error.message);
    return getSimulatedUV(lat, lng);
  }
}

function getSimulatedUV(lat, lng) {
  const baseUV = Math.max(1, Math.min(12, Math.abs(lat) < 20 ? 10 : Math.abs(lat) < 40 ? 7 : 3));
  const variation = (Math.sin(Date.now() / 86400000) + 1) * 2;
  return Math.max(1, Math.min(12, Math.round(baseUV + variation)));
}

function showUVError(message) {
  const descEl = document.querySelector('.uv-description');
  if (!descEl) return;
  descEl.textContent = `⚠️ ${message} Using estimated data.`;
  descEl.style.color = '#ff6b6b';
  setTimeout(() => {
    descEl.style.color = '';
  }, 5000);
}

function showUVElements() {
  const uvCard = document.getElementById('uvCard');
  const uvDescription = document.getElementById('uvDescription');
  const riskLegend = document.getElementById('riskLegend');

  if (uvCard) uvCard.classList.remove('hidden');
  if (uvDescription) uvDescription.classList.remove('hidden');
  if (riskLegend) riskLegend.classList.remove('hidden');
}

function updateUVDisplay(uv) {
  const uvValueEl = document.querySelector('.uv-value');
  const uvStatusEl = document.querySelector('.uv-status');
  const uvCard = document.getElementById('uvCard');

  if (!uvValueEl || !uvStatusEl || !uvCard) return;

  let level;
  let bgClass;
  let textClass;

  if (uv <= 2) {
    level = 'LOW';
    bgClass = 'bg-green-500';
    textClass = 'text-white';
  } else if (uv <= 5) {
    level = 'MODERATE';
    bgClass = 'bg-yellow-400';
    textClass = 'text-gray-800';
  } else if (uv <= 7) {
    level = 'HIGH';
    bgClass = 'bg-orange-500';
    textClass = 'text-white';
  } else if (uv <= 10) {
    level = 'VERY HIGH';
    bgClass = 'bg-red-500';
    textClass = 'text-white';
  } else {
    level = 'EXTREME';
    bgClass = 'bg-purple-600';
    textClass = 'text-white';
  }

  uvValueEl.textContent = Number(uv).toFixed(1);
  uvStatusEl.textContent = level;

  // Remove all possible background classes
  uvCard.classList.remove('bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-red-500', 'bg-purple-600');
  uvCard.classList.remove('text-white', 'text-gray-800');

  // Add new classes
  uvCard.classList.add(bgClass, textClass);

  const descEl = document.querySelector('.uv-description');
  const descriptions = {
    LOW: 'Low UV - minimal protection required.',
    MODERATE: 'Moderate UV - some protection required.',
    HIGH: 'High UV - protection required.',
    'VERY HIGH': 'Very High UV - extra protection required. Avoid sun during peak hours.',
    EXTREME: 'Extreme UV - maximum protection required. Avoid sun exposure.',
  };

  if (descEl) descEl.textContent = descriptions[level];

  document.querySelectorAll('.risk-tags .tag').forEach((tag) => tag.classList.remove('active'));
  const activeTag = document.querySelector(`.risk-tags .tag.${bgClass.replace('bg-', '').replace('-500', '').replace('-400', '').replace('-600', '')}`);
  if (activeTag) activeTag.classList.add('active');
}

async function updateUV() {
  if (!navigator.geolocation) {
    showUVElements();
    updateUVDisplay(9);
    return;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const locationName = await getLocationName(lat, lng);
          document.querySelector('.location-badge').textContent = `📍 ${locationName}`;

         const uvIndex = await getUVIndex(lat, lng);

         saveUVDataToStorage({
           uv: uvIndex,
           location: locationName,
         });

         updateUVDisplay(uvIndex);
         showUVElements();
         resolve();
         } catch (e) {
           console.error(e);
           resolve();
         }
      },
      () => {
        document.querySelector('.location-badge').textContent = '📍 Melbourne, VIC';

        saveUVDataToStorage({
          uv: 9,
          location: 'Melbourne, VIC',
        });

        updateUVDisplay(9);
        showUVElements();
        resolve();
      }
    );
  });
}

function saveUVDataToStorage({ uv, location }) {
  localStorage.setItem(
    "uvData",
    JSON.stringify({
      uv,
      location,
      updatedAt: Date.now(),
    })
  );
}


function getStoredUVData() {
  try {
    const raw = localStorage.getItem("uvData");
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (typeof parsed.uv !== "number") return null;

    return parsed;
  } catch {
    return null;
  }
}


function restoreStoredUVData() {
  const stored = getStoredUVData();
  if (!stored) return;

  updateUVDisplay(stored.uv);

  const badge = document.querySelector(".location-badge");
  if (badge && stored.location) {
    badge.textContent = `📍 ${stored.location}`;
  }

  showUVElements();
}


// Export for global usage
window.updateUV = updateUV;
window.updateUVDisplay = updateUVDisplay;
window.showUVElements = showUVElements;
window.showUVError = showUVError;
window.getUVIndex = getUVIndex;


document.addEventListener("DOMContentLoaded", () => {
  restoreStoredUVData();
});