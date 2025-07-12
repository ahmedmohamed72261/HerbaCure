// Dashboard Connection Configuration

// Get API base URL from local storage or use default
const getApiBaseUrl = () => {
  const savedApiUrl = localStorage.getItem('API_BASE_URL');
  return savedApiUrl || 'http://localhost:5001/api'; // Updated to match backend port in .env
};

// Check API availability
async function checkApiAvailability() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    console.error('API availability check failed:', error);
    return false;
  }
}

// Update connection status in UI
function updateConnectionStatus(isConnected) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status-text');
  
  if (statusIndicator && statusText) {
    if (isConnected) {
      statusIndicator.className = 'status-indicator online';
      statusText.textContent = 'Online';
      statusText.className = 'status-text online';
    } else {
      statusIndicator.className = 'status-indicator offline';
      statusText.textContent = 'Offline';
      statusText.className = 'status-text offline';
    }
  }
}

// Local storage helpers
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to local storage:`, error);
  }
}

function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting ${key} from local storage:`, error);
    return null;
  }
}

function clearLocalStorage() {
  const keys = ['products', 'gallery', 'certificates', 'team'];
  keys.forEach(key => localStorage.removeItem(key));
}

function generateLocalId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Export functions
window.dashboardConnection = {
  getApiBaseUrl,
  checkApiAvailability,
  updateConnectionStatus,
  saveToLocalStorage,
  getFromLocalStorage,
  clearLocalStorage,
  generateLocalId
};