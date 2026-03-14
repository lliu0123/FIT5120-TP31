/**
 * SunSafe - Core Logic
 * Handles skin type storage and cross-page persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Skin Picker if on Profile Page
    const skinOptions = document.querySelectorAll('.skin-option');
    if (skinOptions.length > 0) {
        initSkinTypeManager();
    }

    // 2. Initialize UV Button if on Dashboard
    if (document.getElementById('getUVBtn')) {
        initUVButton();
    }

    // 3. Global UI updates (Optional)
    applySavedPreferences();
});

/**
 * Manages the selection and saving of skin types
 */
function initSkinTypeManager() {
    const options = document.querySelectorAll('.skin-option');
    const statusLabel = document.getElementById('save-status');
    const STORAGE_KEY = 'sunsafe_user_preference';

    // Load existing preference from LocalStorage
    const savedSkin = localStorage.getItem(STORAGE_KEY);
    if (savedSkin) {
        const preselected = document.querySelector(`[data-skin="${savedSkin}"]`);
        if (preselected) preselected.classList.add('selected');
    }

    // Add click listeners to options
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active state from others
            options.forEach(opt => opt.classList.remove('selected'));
            
            // Activate current selection
            option.classList.add('selected');

            // Persist to LocalStorage
            const skinId = option.getAttribute('data-skin');
            localStorage.setItem(STORAGE_KEY, skinId);

            // Show "Saved" feedback
            if (statusLabel) {
                statusLabel.classList.add('show');
                setTimeout(() => {
                    statusLabel.classList.remove('show');
                }, 2000);
            }

            console.log(`Preference saved: Skin Type ${skinId}`);
        });
    });
}

/**
 * This function can be called on any page (like Tools or Dashboard) 
 * to adapt the content based on the user's skin type.
 */
function applySavedPreferences() {
    const savedSkin = localStorage.getItem('sunsafe_user_preference');
    if (savedSkin) {
        // Example: Change logic for sunscreen timer or advice based on savedSkin
        console.log(`App loading with Skin Type: ${savedSkin}`);
    }
}

/**
 * Initialize UV button functionality
 */
function initUVButton() {
    const getUVBtn = document.getElementById('getUVBtn');

    getUVBtn.addEventListener('click', async () => {
        // Show loading state
        getUVBtn.classList.add('loading');
        getUVBtn.textContent = 'Getting Location...';
        getUVBtn.disabled = true;

        try {
            await window.updateUV();
        } catch (error) {
            console.error('Error getting UV data:', error);
        } finally {
            // Reset button state
            getUVBtn.classList.remove('loading');
            getUVBtn.textContent = '📍 Get Current UV Index';
            getUVBtn.disabled = false;
        }
    });
}
