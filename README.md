Hi! Welcome to FIT5120, Enjoy your LAST Semester!!!!!!!!
Good Luck!
P.S:
    When want to do any changes plz create your own branch to edit and later merge to main, Do not direct edit on the main!

## API Configuration

This project uses the **Open-Meteo API** to fetch real-time UV index data. This API is completely free and doesn't require an API key!

### Open-Meteo API Details
- **API Provider**: Open-Meteo (open-meteo.com)
- **API Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Features**: 
  - Free to use (no API key required)
  - Global weather data including UV index
  - Hourly forecasts available
- **Usage Limits**: Generous free tier, suitable for most applications

### How it works
The app automatically fetches UV data based on your location:
1. Gets your GPS coordinates
2. Calls Open-Meteo API with your latitude/longitude
3. Gets current hour's UV index
4. Updates the dashboard with real data and color indicators

### No Configuration Required!
Unlike other APIs, Open-Meteo works out of the box. Just make sure your browser allows location access for the best experience.