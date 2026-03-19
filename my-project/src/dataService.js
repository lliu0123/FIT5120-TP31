/**
 * Data Service for Awareness Visualizations
 * Data range: 1982 - 2025
 */

const DataService = {
    async getTemperatureTrend() {
        // Mocking 1982-2025 data (Year, Anomaly)
        // In a real scenario, this would be a large array from your SQL database
        const data = [];
        for (let year = 1982; year <= 2025; year++) {
            // Simulating a rising trend with some fluctuations
            const anomaly = (year - 1982) * 0.025 + (Math.random() * 0.2);
            data.push({ year, mean_temp_anomaly: parseFloat(anomaly.toFixed(2)) });
        }
        return data;
    },

    async getSkinCancerTrend() {
        // Mocking 1982-2025 data (Year, Incidence)
        const data = [];
        for (let year = 1982; year <= 2025; year++) {
            // Simulating increasing incidence rate per 100k
            const rate = 25 + (year - 1982) * 0.9 + (Math.random() * 5);
            data.push({ year, incidence_rate: parseFloat(rate.toFixed(1)) });
        }
        return data;
    }
};

export default DataService;