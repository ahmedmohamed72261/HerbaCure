// Dashboard Test Script
// This script helps verify the connection between the dashboard and backend

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Dashboard test script loaded');
  
  // Add a test connection button to the dashboard
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    const testButton = document.createElement('button');
    testButton.className = 'test-connection-btn';
    testButton.innerHTML = '<i class="fas fa-vial"></i> <span>Test Connection</span>';
    testButton.onclick = testBackendConnection;
    navActions.prepend(testButton);
  }
});

async function testBackendConnection() {
  try {
    // Get the API base URL from our connection module
    const apiBaseUrl = window.dashboardConnection.getApiBaseUrl();
    console.log('Testing connection to:', apiBaseUrl);
    
    // Show testing notification
    showNotification('Testing backend connection...', 'info');
    
    // Try to connect to the health endpoint
    const isConnected = await window.dashboardConnection.checkApiAvailability();
    
    if (isConnected) {
      console.log('✅ Backend connection successful!');
      showNotification('Backend connection successful! Server is running on port 5001', 'success');
      
      // Update connection status
      window.dashboardConnection.updateConnectionStatus(true);
      
      // Add to activity log if function exists
      if (typeof addActivityItem === 'function') {
        addActivityItem('Backend connection test: Success');
      }
      
      return true;
    } else {
      console.error('❌ Backend connection failed');
      showNotification('Backend connection failed. Please make sure the server is running on port 5001', 'error');
      
      // Update connection status
      window.dashboardConnection.updateConnectionStatus(false);
      
      // Add to activity log if function exists
      if (typeof addActivityItem === 'function') {
        addActivityItem('Backend connection test: Failed');
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error testing backend connection:', error);
    showNotification('Error testing backend connection: ' + error.message, 'error');
    return false;
  }
}

// Helper function to show notifications if the main function isn't available
function showNotification(message, type) {
  // Try to use the dashboard's notification function if available
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // Fallback notification
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Create a simple notification element
  const notification = document.createElement('div');
  notification.className = `test-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    </div>
    <div class="notification-content">
      <p>${message}</p>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  
  // Add some basic styles
  const style = document.createElement('style');
  style.textContent = `
    .test-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 350px;
      animation: slideIn 0.3s ease-out forwards;
    }
    .test-notification.success { background-color: #d4edda; color: #155724; }
    .test-notification.error { background-color: #f8d7da; color: #721c24; }
    .test-notification.info { background-color: #d1ecf1; color: #0c5460; }
    .test-notification .notification-icon { margin-right: 15px; font-size: 24px; }
    .test-notification .notification-close { background: none; border: none; cursor: pointer; margin-left: 10px; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Add close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    });
  }
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}