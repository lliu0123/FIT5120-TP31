/**
 * UV-related logic (Location + UV fetch + Display)
 */

/**
 * Converts coordinates into a readable location name using OpenStreetMap API
 */
async function getLocationName(lat, lng) {
  try {
      const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=en`
      );
      const data = await response.json();
      if (data && data.address) {
          const address = data.address;
          const city = address.city || address.town || address.village || address.suburb || "Unknown City";
          const state = address.state || "";
          return state ? `${city}, ${state}` : city;
      }
      return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  } catch (error) {
      console.error('Error getting location name:', error);
      return "Melbourne, VIC"; // Default fallback
  }
}

/**
* Fetches the current UV index based on latitude and longitude
*/
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
      return 9; // Default value if API fails
  }
}

/**
* Updates the UI elements (card color, text, and shadow) based on UV value
*/
function updateUVDisplay(uv) {
  const uvValueEl = document.querySelector('.uv-value');
  const uvStatusEl = document.querySelector('.uv-status');
  const uvCard = document.getElementById('uvCard');

  if (!uvValueEl || !uvStatusEl || !uvCard) return;

  let config = {
    level: 'LOW',
    bgClass: 'bg-green-500',
    textClass: 'text-white',
    shadow: 'rgba(34, 197, 94, 0.3)'
  };

  if (uv <= 2) {
    config = {
      level: 'LOW',
      bgClass: 'bg-green-500',
      textClass: 'text-white',
      shadow: 'rgba(34, 197, 94, 0.3)'
    };
  } else if (uv <= 5) {
    config = {
      level: 'MODERATE',
      bgClass: 'bg-yellow-400',
      textClass: 'text-gray-800',
      shadow: 'rgba(234, 179, 8, 0.3)'
    };
  } else if (uv <= 7) {
    config = {
      level: 'HIGH',
      bgClass: 'bg-orange-500',
      textClass: 'text-white',
      shadow: 'rgba(249, 115, 22, 0.3)'
    };
  } else if (uv <= 10) {
    config = {
      level: 'VERY HIGH',
      bgClass: 'bg-red-500',
      textClass: 'text-white',
      shadow: 'rgba(239, 68, 68, 0.3)'
    };
  } else {
    config = {
      level: 'EXTREME',
      bgClass: 'bg-purple-600',
      textClass: 'text-white',
      shadow: 'rgba(147, 51, 234, 0.3)'
    };
  }

  uvValueEl.textContent = Number(uv).toFixed(1);
  uvStatusEl.textContent = config.level;

  uvCard.classList.remove(
    'bg-green-500',
    'bg-yellow-400',
    'bg-orange-500',
    'bg-red-500',
    'bg-purple-600',
    'text-white',
    'text-gray-800'
  );

  uvCard.classList.add(config.bgClass, config.textClass);
  uvCard.style.boxShadow = `0 8px 20px ${config.shadow}`;

  const descEl = document.querySelector('.uv-description');
  const descriptions = {
    LOW: 'Low UV - minimal protection required.',
    MODERATE: 'Moderate UV - some protection required.',
    HIGH: 'High UV - protection required.',
    'VERY HIGH': 'Very High UV - extra protection required. Avoid sun during peak hours.',
    EXTREME: 'Extreme UV - maximum protection required. Avoid sun exposure.'
  };

  if (descEl) {
    descEl.textContent = descriptions[config.level] || '';
  }
}


/**
* Main handler to trigger location request and update the dashboard
*/
async function handleUpdateUV() {
  const btn = document.getElementById('getUVBtn');
  if (btn) {
      btn.textContent = "Updating...";
      btn.disabled = true; // Prevent double clicks
  }

  if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
  }

  navigator.geolocation.getCurrentPosition(
      async (position) => {
          const { latitude, longitude } = position.coords;
          const locationName = await getLocationName(latitude, longitude);
          const uvIndex = await getUVIndex(latitude, longitude);

          // Update UI elements
          const badge = document.querySelector('.location-badge');
          if (badge) badge.textContent = `📍 ${locationName}`;
          
          updateUVDisplay(uvIndex);

          // Cache data in localStorage for next visit
          localStorage.setItem("uvData", JSON.stringify({
              uv: uvIndex,
              location: locationName,
              timestamp: Date.now()
          }));

          if (btn) {
              btn.textContent = "📍 Get Current UV Index";
              btn.disabled = false;
          }
      },
      (error) => {
          console.error('Geolocation Error:', error);
          if (btn) {
              btn.textContent = "📍 Get Current UV Index";
              btn.disabled = false;
          }
          alert("Could not access your location. Using default data.");
      }
  );
}

/**
* Initialize on page load
*/
document.addEventListener("DOMContentLoaded", () => {
  // 1. Try to restore data from localStorage
  const cached = localStorage.getItem("uvData");
  if (cached) {
      try {
          const data = JSON.parse(cached);
          updateUVDisplay(data.uv);
          const badge = document.querySelector('.location-badge');
          if (badge) badge.textContent = `📍 ${data.location}`;
      } catch (e) {
          console.error("Failed to parse cached UV data");
      }
  }

  // 2. Bind click event to the button
  const getUVBtn = document.getElementById('getUVBtn');
  if (getUVBtn) {
      getUVBtn.addEventListener('click', handleUpdateUV);
  }
});