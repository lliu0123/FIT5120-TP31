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
  try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=uv_index&forecast_days=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Match the current local hour to the API response array
      const now = new Date();
      const currentHour = now.getHours(); 
      const uvValue = data.hourly.uv_index[currentHour];
      
      return Math.round(uvValue || 0);
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

  // Define UI configuration for different UV levels
  let config = {
      level: 'LOW',
      color: 'bg-green-500',
      shadow: 'rgba(34, 197, 94, 0.3)'
  };

  if (uv >= 3 && uv <= 5) {
      config = { level: 'MODERATE', color: 'bg-yellow-500', shadow: 'rgba(234, 179, 8, 0.3)' };
  } else if (uv >= 6 && uv <= 7) {
      config = { level: 'HIGH', color: 'bg-orange-500', shadow: 'rgba(249, 115, 22, 0.3)' };
  } else if (uv >= 8 && uv <= 10) {
      config = { level: 'VERY HIGH', color: 'bg-red-500', shadow: 'rgba(239, 68, 68, 0.3)' };
  } else if (uv >= 11) {
      config = { level: 'EXTREME', color: 'bg-purple-600', shadow: 'rgba(147, 51, 234, 0.3)' };
  }

  // Update text content
  uvValueEl.textContent = uv;
  uvStatusEl.textContent = config.level;

  // Update CSS classes for smooth transition
  // Note: We overwrite className to prevent multiple color classes from clashing
  uvCard.className = `w-[280px] h-[280px] mx-auto my-[30px] rounded-[40px] text-white text-center flex flex-col justify-center items-center transition-all duration-500 ${config.color}`;
  uvCard.style.boxShadow = `0 15px 35px ${config.shadow}`;
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