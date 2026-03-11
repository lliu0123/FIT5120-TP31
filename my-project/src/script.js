/**
 * SunSafe Core Logic
 */

const uviDisplay = document.getElementById('uvi-value');
const uviLevel = document.getElementById('uvi-level');
const adviceList = document.getElementById('advice-list');
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer');

// 1. Update UI based on UV Index
const updateSunSafeInfo = (uvi) => {
    uviDisplay.textContent = uvi;
    let config = { level: '', color: '', tips: [] };

    if (uvi < 3) {
        config = { 
            level: 'Low', 
            color: '#2ecc71', 
            tips: ['No protection required', 'Safe to stay outside'] 
        };
    } else if (uvi < 6) {
        config = { 
            level: 'Moderate', 
            color: '#f1c40f', 
            tips: ['Apply SPF 30+ sunscreen', 'Seek shade during midday', 'Wear a hat'] 
        };
    } else if (uvi < 8) {
        config = { 
            level: 'High', 
            color: '#e67e22', 
            tips: ['Reduce time outdoors 10am-4pm', 'Wear protective clothing', 'Use UV-rated sunglasses'] 
        };
    } else {
        config = { 
            level: 'Extreme', 
            color: '#e74c3c', 
            tips: ['Stay indoors if possible', 'Reapply sunscreen every hour', 'Total physical coverage required'] 
        };
    }

    uviDisplay.style.color = config.color;
    uviLevel.textContent = config.level;
    uviLevel.style.color = config.color;
    adviceList.innerHTML = config.tips.map(tip => `<li>${tip}</li>`).join('');
};

// 2. Reapply Timer (120 Minutes)
let secondsLeft = 120 * 60;
let timerId = null;

const startTimer = () => {
    // Reset timer if already running
    if (timerId) clearInterval(timerId);
    secondsLeft = 120 * 60; 
    
    timerId = setInterval(() => {
        secondsLeft--;
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        if (secondsLeft <= 0) {
            clearInterval(timerId);
            alert("⏰ SunSafe Alert: Time to reapply your sunscreen!");
        }
    }, 1000);
    
    startBtn.textContent = "Restart Timer";
};

// 3. Initialization (Simulation)
window.onload = () => {
    // Simulating a UV value (0-11 range)
    const mockUVI = (Math.random() * 11).toFixed(1);
    updateSunSafeInfo(mockUVI);
};

startBtn.addEventListener('click', startTimer);