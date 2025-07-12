// New Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  console.log('New Dashboard initializing...');
  
  try {
    // Initialize dashboard components
    initSidebar();
    initTabNavigation();
    initModals();
    initFormHandlers();
    updateLastUpdatedTime();
    
    // Check API availability
    const isApiAvailable = await checkApiAvailability();
    updateConnectionStatus(isApiAvailable);
    
    if (isApiAvailable) {
      // Load data from API
      await loadAllData();
      showNotification('Connected to backend server successfully!', 'success');
    } else {
      // Show warning message
      showNotification('Backend server is not available. Using local data.', 'warning');
      
      // Load data from local storage
      loadDataFromLocalStorage();
    }
    
    // Initialize dashboard overview
    updateDashboardStats();
    
    // Add sample activity
    addActivityItem('Dashboard initialized successfully');
    
    console.log('New Dashboard initialized successfully');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showNotification('Error initializing dashboard. Please refresh the page.', 'error');
  }
});

// Global variables
let currentItemId = null;
let currentItemType = null;
let darkModeEnabled = false;
let autoRefreshEnabled = false;
let autoRefreshInterval = null;

// Initialize sidebar functionality
function initSidebar() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all menu items
      menuItems.forEach(mi => mi.classList.remove('active'));
      
      // Add active class to clicked menu item
      this.classList.add('active');
      
      // Show corresponding tab content
      const tabId = this.getAttribute('data-tab');
      showTabContent(tabId);
    });
  });
}

// Initialize tab navigation
function initTabNavigation() {
  // Quick action buttons on dashboard overview
  const actionButtons = document.querySelectorAll('.action-btn');
  
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const action = this.getAttribute('data-action');
      
      switch(action) {
        case 'add-product':
          showTabContent('products');
          document.querySelector('.menu-item[data-tab="products"]').classList.add('active');
          document.querySelector('.menu-item[data-tab="dashboard"]').classList.remove('active');
          openModal('product-modal');
          break;
        case 'add-gallery':
          showTabContent('gallery');
          document.querySelector('.menu-item[data-tab="gallery"]').classList.add('active');
          document.querySelector('.menu-item[data-tab="dashboard"]').classList.remove('active');
          // Open gallery modal (to be implemented)
          break;
        case 'add-certificate':
          showTabContent('certificates');
          document.querySelector('.menu-item[data-tab="certificates"]').classList.add('active');
          document.querySelector('.menu-item[data-tab="dashboard"]').classList.remove('active');
          // Open certificate modal (to be implemented)
          break;
        case 'add-team':
          showTabContent('team');
          document.querySelector('.menu-item[data-tab="team"]').classList.add('active');
          document.querySelector('.menu-item[data-tab="dashboard"]').classList.remove('active');
          // Open team modal (to be implemented)
          break;
      }
    });
  });
  
  // Refresh buttons
  document.getElementById('refresh-all-data').addEventListener('click', async function() {
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> <span>Refreshing...</span>';
    
    try {
      await loadAllData();
      showNotification('All data refreshed successfully!', 'success');
      updateDashboardStats();
      addActivityItem('Refreshed all data');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showNotification('Error refreshing data. Please try again.', 'error');
    } finally {
      this.disabled = false;
      this.innerHTML = '<i class="fas fa-sync-alt"></i> <span>Refresh Data</span>';
    }
  });
  
  // Section-specific refresh buttons
  const sectionRefreshButtons = [
    { id: 'refresh-products-btn', section: 'products' },
    { id: 'refresh-gallery-btn', section: 'gallery' },
    { id: 'refresh-certificates-btn', section: 'certificates' },
    { id: 'refresh-team-btn', section: 'team' }
  ];
  
  sectionRefreshButtons.forEach(({ id, section }) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', async function() {
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
        
        try {
          await refreshSectionData(section);
          showNotification(`${section.charAt(0).toUpperCase() + section.slice(1)} data refreshed successfully!`, 'success');
          updateDashboardStats();
          addActivityItem(`Refreshed ${section} data`);
        } catch (error) {
          console.error(`Error refreshing ${section} data:`, error);
          showNotification(`Error refreshing ${section} data. Please try again.`, 'error');
        } finally {
          this.disabled = false;
          this.innerHTML = '<i class="fas fa-sync-alt"></i>';
        }
      });
    }
  });
  
  // Settings tab functionality
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      darkModeEnabled = this.checked;
      toggleDarkMode(darkModeEnabled);
      localStorage.setItem('darkModeEnabled', darkModeEnabled);
      addActivityItem(`${darkModeEnabled ? 'Enabled' : 'Disabled'} dark mode`);
    });
    
    // Check if dark mode was previously enabled
    const savedDarkMode = localStorage.getItem('darkModeEnabled');
    if (savedDarkMode === 'true') {
      darkModeToggle.checked = true;
      darkModeEnabled = true;
      toggleDarkMode(true);
    }
  }
  
  const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
  if (autoRefreshToggle) {
    autoRefreshToggle.addEventListener('change', function() {
      autoRefreshEnabled = this.checked;
      toggleAutoRefresh(autoRefreshEnabled);
      localStorage.setItem('autoRefreshEnabled', autoRefreshEnabled);
      addActivityItem(`${autoRefreshEnabled ? 'Enabled' : 'Disabled'} auto refresh`);
    });
    
    // Check if auto refresh was previously enabled
    const savedAutoRefresh = localStorage.getItem('autoRefreshEnabled');
    if (savedAutoRefresh === 'true') {
      autoRefreshToggle.checked = true;
      autoRefreshEnabled = true;
      toggleAutoRefresh(true);
    }
  }
  
  // Data management buttons
  const clearStorageBtn = document.getElementById('clear-storage-btn');
  if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all locally stored data? This action cannot be undone.')) {
        clearLocalStorage();
        showNotification('Local storage cleared successfully!', 'success');
        addActivityItem('Cleared local storage');
        loadDataFromLocalStorage(); // Reload with empty data
        updateDashboardStats();
      }
    });
  }
  
  const exportDataBtn = document.getElementById('export-data-btn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', function() {
      exportAllData();
      addActivityItem('Exported all data');
    });
  }
  
  const importDataBtn = document.getElementById('import-data-btn');
  if (importDataBtn) {
    importDataBtn.addEventListener('click', function() {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      
      fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            try {
              const data = JSON.parse(e.target.result);
              importAllData(data);
              showNotification('Data imported successfully!', 'success');
              addActivityItem('Imported data');
              loadDataFromLocalStorage();
              updateDashboardStats();
            } catch (error) {
              console.error('Error importing data:', error);
              showNotification('Error importing data. Please check the file format.', 'error');
            }
          };
          reader.readAsText(file);
        }
        document.body.removeChild(fileInput);
      });
      
      fileInput.click();
    });
  }
  
  // API URL settings
  const saveApiUrlBtn = document.getElementById('save-api-url-btn');
  if (saveApiUrlBtn) {
    saveApiUrlBtn.addEventListener('click', function() {
      const apiUrlInput = document.getElementById('api-url-input');
      if (apiUrlInput) {
        const newApiUrl = apiUrlInput.value.trim();
        if (newApiUrl) {
          localStorage.setItem('API_BASE_URL', newApiUrl);
          showNotification('API URL saved successfully!', 'success');
          addActivityItem('Updated API URL');
        } else {
          showNotification('Please enter a valid API URL.', 'error');
        }
      }
    });
  }
  
  const testConnectionBtn = document.getElementById('test-connection-btn');
  if (testConnectionBtn) {
    testConnectionBtn.addEventListener('click', async function() {
      this.disabled = true;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Testing...</span>';
      
      try {
        const isApiAvailable = await checkApiAvailability();
        updateConnectionStatus(isApiAvailable);
        
        if (isApiAvailable) {
          showNotification('Connection to backend server successful!', 'success');
          addActivityItem('Tested API connection - Success');
        } else {
          showNotification('Failed to connect to backend server.', 'error');
          addActivityItem('Tested API connection - Failed');
        }
      } catch (error) {
        console.error('Error testing connection:', error);
        showNotification('Error testing connection. Please try again.', 'error');
        addActivityItem('Tested API connection - Error');
      } finally {
        this.disabled = false;
        this.innerHTML = '<i class="fas fa-plug"></i> <span>Test</span>';
      }
    });
  }
}

// Initialize modals
function initModals() {
  // Close modal buttons
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Cancel buttons
  const cancelButtons = document.querySelectorAll('.cancel-btn');
  cancelButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Add new buttons
  const addButtons = {
    'add-product-btn': 'product-modal',
    // Add more modals as they are implemented
  };
  
  Object.entries(addButtons).forEach(([buttonId, modalId]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', function() {
        openModal(modalId);
        // Reset form if needed
        resetForm(modalId);
      });
    }
  });
  
  // Close modals when clicking outside
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', function(event) {
      if (event.target === this) {
        closeModal(this.id);
      }
    });
  });
  
  // Image upload preview
  const imageInputs = document.querySelectorAll('input[type="file"]');
  imageInputs.forEach(input => {
    const previewId = input.id + '-preview';
    const preview = document.getElementById(previewId);
    const uploadBtn = document.getElementById(input.id + '-btn');
    
    if (uploadBtn) {
      uploadBtn.addEventListener('click', function() {
        input.click();
      });
    }
    
    if (preview) {
      input.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
          };
          
          reader.readAsDataURL(event.target.files[0]);
        }
      });
    }
  });
}

// Initialize form handlers
function initFormHandlers() {
  // Product form
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      const productId = document.getElementById('product-id').value;
      const isEditing = productId !== '';
      
      // Get form data
      const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        category: document.getElementById('product-category').value,
        featured: document.getElementById('product-featured').checked,
        active: document.getElementById('product-active').checked
      };
      
      // Handle image upload
      const imageInput = document.getElementById('product-image');
      if (imageInput.files && imageInput.files[0]) {
        // In a real implementation, you would upload the image to the server
        // For now, we'll just use a placeholder or local path
        productData.image = URL.createObjectURL(imageInput.files[0]);
      }
      
      try {
        if (isEditing) {
          // Update existing product
          await updateProduct(productId, productData);
          showNotification('Product updated successfully!', 'success');
          addActivityItem(`Updated product: ${productData.name}`);
        } else {
          // Create new product
          await createProduct(productData);
          showNotification('Product created successfully!', 'success');
          addActivityItem(`Created new product: ${productData.name}`);
        }
        
        // Close modal and refresh products list
        closeModal('product-modal');
        await refreshSectionData('products');
        updateDashboardStats();
      } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product. Please try again.', 'error');
      }
    });
  }
  
  // Add more form handlers as needed
}

// Show tab content
function showTabContent(tabId) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  
  // Show selected tab content
  const selectedTab = document.getElementById(`${tabId}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Reset form
function resetForm(modalId) {
  if (modalId === 'product-modal') {
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-image-preview').innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
  }
  
  // Add more form resets as needed
}

// Load all data
async function loadAllData() {
  try {
    await Promise.all([
      loadProducts(),
      loadGallery(),
      loadCertificates(),
      loadTeam()
    ]);
    
    updateLastUpdatedTime();
    return true;
  } catch (error) {
    console.error('Error loading all data:', error);
    throw error;
  }
}

// Load data from local storage
function loadDataFromLocalStorage() {
  try {
    // Load products
    const products = getFromLocalStorage('products') || [];
    renderProducts(products);
    
    // Load gallery
    const gallery = getFromLocalStorage('gallery') || [];
    renderGallery(gallery);
    
    // Load certificates
    const certificates = getFromLocalStorage('certificates') || [];
    renderCertificates(certificates);
    
    // Load team
    const team = getFromLocalStorage('team') || [];
    renderTeam(team);
    
    updateLastUpdatedTime();
    return true;
  } catch (error) {
    console.error('Error loading data from local storage:', error);
    throw error;
  }
}

// Load products
async function loadProducts() {
  try {
    const products = await ProductsAPI.getAll();
    renderProducts(products);
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    throw error;
  }
}

// Load gallery
async function loadGallery() {
  try {
    const gallery = await GalleryAPI.getAll();
    renderGallery(gallery);
    return gallery;
  } catch (error) {
    console.error('Error loading gallery:', error);
    throw error;
  }
}

// Load certificates
async function loadCertificates() {
  try {
    const certificates = await CertificatesAPI.getAll();
    renderCertificates(certificates);
    return certificates;
  } catch (error) {
    console.error('Error loading certificates:', error);
    throw error;
  }
}

// Load team
async function loadTeam() {
  try {
    const team = await TeamAPI.getAll();
    renderTeam(team);
    return team;
  } catch (error) {
    console.error('Error loading team:', error);
    throw error;
  }
}

// Refresh section data
async function refreshSectionData(section) {
  switch(section) {
    case 'products':
      return await loadProducts();
    case 'gallery':
      return await loadGallery();
    case 'certificates':
      return await loadCertificates();
    case 'team':
      return await loadTeam();
    default:
      throw new Error(`Unknown section: ${section}`);
  }
}

// Render products
function renderProducts(products) {
  const productsList = document.getElementById('products-list');
  if (!productsList) return;
  
  productsList.innerHTML = '';
  
  if (products.length === 0) {
    productsList.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table">No products found. Add your first product!</td>
      </tr>
    `;
    return;
  }
  
  products.forEach(product => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>
        <div class="product-image">
          <img src="${product.image || 'assets/images/placeholder.png'}" alt="${product.name}">
        </div>
      </td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>
        <span class="status-badge ${product.active ? 'active' : 'inactive'}">
          ${product.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" data-id="${product._id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${product._id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    productsList.appendChild(row);
  });
  
  // Add event listeners to edit and delete buttons
  const editButtons = productsList.querySelectorAll('.edit-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      editProduct(productId);
    });
  });
  
  const deleteButtons = productsList.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      deleteProduct(productId);
    });
  });
}

// Render gallery
function renderGallery(gallery) {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  
  galleryGrid.innerHTML = '';
  
  if (gallery.length === 0) {
    galleryGrid.innerHTML = `
      <div class="empty-grid">No gallery items found. Add your first gallery item!</div>
    `;
    return;
  }
  
  gallery.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    
    card.innerHTML = `
      <div class="gallery-image">
        <img src="${item.image || 'assets/images/placeholder.png'}" alt="${item.title}">
        <div class="gallery-actions">
          <button class="edit-btn" data-id="${item._id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${item._id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="gallery-info">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <span class="category-badge">${item.category}</span>
      </div>
    `;
    
    galleryGrid.appendChild(card);
  });
  
  // Add event listeners to edit and delete buttons
  // (to be implemented)
}

// Render certificates
function renderCertificates(certificates) {
  const certificatesGrid = document.getElementById('certificates-grid');
  if (!certificatesGrid) return;
  
  certificatesGrid.innerHTML = '';
  
  if (certificates.length === 0) {
    certificatesGrid.innerHTML = `
      <div class="empty-grid">No certificates found. Add your first certificate!</div>
    `;
    return;
  }
  
  certificates.forEach(certificate => {
    const card = document.createElement('div');
    card.className = 'certificate-card';
    
    card.innerHTML = `
      <div class="certificate-image">
        <img src="${certificate.image?.url || 'assets/images/placeholder.png'}" alt="${certificate.title}">
        <div class="certificate-actions">
          <button class="edit-btn" data-id="${certificate._id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${certificate._id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="certificate-info">
        <h3>${certificate.title}</h3>
        <p>${certificate.description}</p>
        <div class="certificate-meta">
          <span class="issuer"><i class="fas fa-building"></i> ${certificate.issuer?.name || 'Unknown'}</span>
          <span class="category-badge">${certificate.category}</span>
        </div>
      </div>
    `;
    
    certificatesGrid.appendChild(card);
  });
  
  // Add event listeners to edit and delete buttons
  // (to be implemented)
}

// Render team
function renderTeam(team) {
  const teamGrid = document.getElementById('team-grid');
  if (!teamGrid) return;
  
  teamGrid.innerHTML = '';
  
  if (team.length === 0) {
    teamGrid.innerHTML = `
      <div class="empty-grid">No team members found. Add your first team member!</div>
    `;
    return;
  }
  
  team.forEach(member => {
    const card = document.createElement('div');
    card.className = 'team-card';
    
    card.innerHTML = `
      <div class="team-image">
        <img src="${member.image || 'assets/images/placeholder.png'}" alt="${member.name}">
        <div class="team-actions">
          <button class="edit-btn" data-id="${member._id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${member._id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="team-info">
        <h3>${member.name}</h3>
        <p class="position">${member.position}</p>
        <p class="bio">${member.bio}</p>
        <span class="department-badge">${member.department}</span>
      </div>
    `;
    
    teamGrid.appendChild(card);
  });
  
  // Add event listeners to edit and delete buttons
  // (to be implemented)
}

// Update dashboard stats
function updateDashboardStats() {
  // Update product count
  const products = getFromLocalStorage('products') || [];
  const productsCount = document.getElementById('products-count');
  if (productsCount) {
    productsCount.textContent = products.length;
  }
  
  // Update gallery count
  const gallery = getFromLocalStorage('gallery') || [];
  const galleryCount = document.getElementById('gallery-count');
  if (galleryCount) {
    galleryCount.textContent = gallery.length;
  }
  
  // Update certificates count
  const certificates = getFromLocalStorage('certificates') || [];
  const certificatesCount = document.getElementById('certificates-count');
  if (certificatesCount) {
    certificatesCount.textContent = certificates.length;
  }
  
  // Update team count
  const team = getFromLocalStorage('team') || [];
  const teamCount = document.getElementById('team-count');
  if (teamCount) {
    teamCount.textContent = team.length;
  }
}

// Update last updated time
function updateLastUpdatedTime() {
  const lastUpdatedTime = document.getElementById('last-updated-time');
  if (lastUpdatedTime) {
    const now = new Date();
    lastUpdatedTime.textContent = now.toLocaleTimeString();
    localStorage.setItem('lastUpdated', now.toISOString());
  }
}

// Update connection status
function updateConnectionStatus(isOnline) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status-text');
  
  if (statusIndicator && statusText) {
    if (isOnline) {
      statusIndicator.className = 'status-indicator online';
      statusText.textContent = 'Online';
    } else {
      statusIndicator.className = 'status-indicator offline';
      statusText.textContent = 'Offline';
    }
  }
}

// Add activity item
function addActivityItem(text) {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  
  const activityItem = document.createElement('div');
  activityItem.className = 'activity-item';
  
  activityItem.innerHTML = `
    <div class="activity-icon">
      <i class="fas fa-check-circle"></i>
    </div>
    <div class="activity-details">
      <p class="activity-text">${text}</p>
      <p class="activity-time">${timeString}</p>
    </div>
  `;
  
  // Add to the beginning of the list
  activityList.insertBefore(activityItem, activityList.firstChild);
  
  // Limit the number of activity items
  const maxItems = 10;
  const items = activityList.querySelectorAll('.activity-item');
  if (items.length > maxItems) {
    for (let i = maxItems; i < items.length; i++) {
      activityList.removeChild(items[i]);
    }
  }
  
  // Save activities to local storage
  saveActivities();
}

// Save activities to local storage
function saveActivities() {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;
  
  const activities = [];
  const items = activityList.querySelectorAll('.activity-item');
  
  items.forEach(item => {
    const text = item.querySelector('.activity-text').textContent;
    const time = item.querySelector('.activity-time').textContent;
    
    activities.push({ text, time });
  });
  
  localStorage.setItem('activities', JSON.stringify(activities));
}

// Load activities from local storage
function loadActivities() {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;
  
  const activities = JSON.parse(localStorage.getItem('activities')) || [];
  
  activityList.innerHTML = '';
  
  activities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    activityItem.innerHTML = `
      <div class="activity-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="activity-details">
        <p class="activity-text">${activity.text}</p>
        <p class="activity-time">${activity.time}</p>
      </div>
    `;
    
    activityList.appendChild(activityItem);
  });
}

// Toggle dark mode
function toggleDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Toggle auto refresh
function toggleAutoRefresh(enabled) {
  if (enabled) {
    // Refresh data every 5 minutes
    autoRefreshInterval = setInterval(async () => {
      try {
        await loadAllData();
        updateDashboardStats();
        addActivityItem('Auto-refreshed data');
      } catch (error) {
        console.error('Error auto-refreshing data:', error);
      }
    }, 5 * 60 * 1000);
  } else {
    // Clear interval
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
}

// Clear local storage
function clearLocalStorage() {
  localStorage.removeItem('products');
  localStorage.removeItem('gallery');
  localStorage.removeItem('certificates');
  localStorage.removeItem('team');
  localStorage.removeItem('activities');
  localStorage.removeItem('lastUpdated');
}

// Export all data
function exportAllData() {
  const data = {
    products: getFromLocalStorage('products') || [],
    gallery: getFromLocalStorage('gallery') || [],
    certificates: getFromLocalStorage('certificates') || [],
    team: getFromLocalStorage('team') || [],
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'herbacure-data.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import all data
function importAllData(data) {
  if (data.products) {
    saveToLocalStorage('products', data.products);
  }
  
  if (data.gallery) {
    saveToLocalStorage('gallery', data.gallery);
  }
  
  if (data.certificates) {
    saveToLocalStorage('certificates', data.certificates);
  }
  
  if (data.team) {
    saveToLocalStorage('team', data.team);
  }
}

// Create product
async function createProduct(productData) {
  try {
    const result = await ProductsAPI.create(productData);
    return result;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Update product
async function updateProduct(productId, productData) {
  try {
    const result = await ProductsAPI.update(productId, productData);
    return result;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Edit product
async function editProduct(productId) {
  try {
    // Get product data
    const product = await ProductsAPI.getById(productId);
    
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    // Set form values
    document.getElementById('product-id').value = product._id;
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-featured').checked = product.featured;
    document.getElementById('product-active').checked = product.active;
    
    // Set image preview
    const imagePreview = document.getElementById('product-image-preview');
    if (imagePreview) {
      if (product.image) {
        imagePreview.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
      } else {
        imagePreview.innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
      }
    }
    
    // Open modal
    openModal('product-modal');
  } catch (error) {
    console.error('Error editing product:', error);
    showNotification('Error loading product data. Please try again.', 'error');
  }
}

// Delete product
async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    try {
      await ProductsAPI.delete(productId);
      showNotification('Product deleted successfully!', 'success');
      addActivityItem('Deleted a product');
      await loadProducts();
      updateDashboardStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product. Please try again.', 'error');
    }
  }
}