/**
 * Configuration file for API keys and settings
 * Add this file to .gitignore to keep keys secure
 */

// Open-Meteo API Configuration
// This API is free and doesn't require an API key
// Documentation: https://open-meteo.com/en/docs
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Alternative UV APIs you can use:
// 1. Open-Meteo (current): https://open-meteo.com/
// 2. OpenUV: https://openuv.io/ (requires API key)
// 3. WeatherAPI: https://www.weatherapi.com/

// Export configuration
window.AppConfig = {
    OPEN_METEO_BASE_URL: OPEN_METEO_BASE_URL,
    // Add other config options here
};