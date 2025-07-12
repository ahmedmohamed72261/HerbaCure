document.addEventListener("DOMContentLoaded", async function () {
  console.log("Dashboard initializing...");

  try {
    // Initialize the dashboard
    initDashboard();

    // Initialize image upload functionality
    initImageUploads();

    // Check if API is available
    const isApiAvailable = await checkApiAvailability();
    console.log("API available:", isApiAvailable);

    if (isApiAvailable) {
      // Load initial data from API
      await loadAllData();
      showNotification("Connected to backend server successfully!");
    } else {
      // Show error message
      showNotification("Failed to connect to backend server. Using local data.", "warning");

      // Load sample data from local storage
      initializeSampleData();

      // Try to load data from local storage
      try {
        const products = getFromLocalStorage("products") || [];
        renderProducts(products);

        const gallery = getFromLocalStorage("gallery") || [];
        renderGallery(gallery);

        const certificates = getFromLocalStorage("certificates") || [];
        renderCertificates(certificates);

        const team = getFromLocalStorage("team") || [];
        renderTeam(team);
      } catch (error) {
        console.error("Error loading data from local storage:", error);
        showNotification("Error loading data. Please refresh the page.", "error");
      }
    }

    // Initialize mobile menu toggle
    initMobileMenu();

    console.log("Dashboard initialized successfully");
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    showNotification("Error initializing dashboard. Please refresh the page.", "error");
  }
});

// Global variables for storing current item being edited or deleted
let currentItemId = null;
let currentItemType = null;

// Initialize dashboard functionality
function initDashboard() {
  // Tab navigation
  const navItems = document.querySelectorAll(".nav-item");

  // Function to switch tabs
  function switchTab(targetTab) {
    // Check if the target tab exists
    const tabElement = document.getElementById(`${targetTab}-tab`);
    if (!tabElement) {
      console.error(`Tab element with ID "${targetTab}-tab" not found`);
      return;
    }

    // Remove active class from all nav items
    navItems.forEach((nav) => nav.classList.remove("active"));

    // Add active class to the nav item with matching data-target
    const navItem = document.querySelector(`.nav-item[data-target="${targetTab}"]`);
    if (navItem) {
      navItem.classList.add("active");
    }

    // Hide all tabs
    const tabs = document.querySelectorAll(".dashboard-tab");
    tabs.forEach((tab) => tab.classList.remove("active"));

    // Show the selected tab
    tabElement.classList.add("active");

    // Log for debugging
    console.log(`Switched to tab: ${targetTab}`);
  }

  // Add click event to each nav item
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Get the target tab
      const targetTab = this.getAttribute("data-target");
      if (!targetTab) return;

      // Switch to the target tab
      switchTab(targetTab);
    });
  });

  // Make switchTab function globally available
  window.switchTab = switchTab;

  // Add new item buttons - with error handling
  function setupAddButton(id, type) {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", function() {
        openModal(type, "add");
      });
      console.log(`Set up ${id} button`);
    } else {
      console.error(`Button with ID "${id}" not found`);
    }
  }

  // Set up all add buttons
  setupAddButton("add-product-btn", "product");
  setupAddButton("add-gallery-btn", "gallery");
  setupAddButton("add-certificate-btn", "certificate");
  setupAddButton("add-team-btn", "team");

  // Cancel buttons
  document
    .getElementById("cancel-product")
    .addEventListener("click", () => closeModal("product"));
  document
    .getElementById("cancel-gallery")
    .addEventListener("click", () => closeModal("gallery"));
  document
    .getElementById("cancel-certificate")
    .addEventListener("click", () => closeModal("certificate"));
  document
    .getElementById("cancel-team")
    .addEventListener("click", () => closeModal("team"));
  document
    .getElementById("cancel-delete")
    .addEventListener("click", () => closeModal("delete"));

  // Close modal buttons
  const closeButtons = document.querySelectorAll(".close-modal");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  });

  // Form submissions
  document
    .getElementById("product-form")
    .addEventListener("submit", handleProductSubmit);
  document
    .getElementById("gallery-form")
    .addEventListener("submit", handleGallerySubmit);
  document
    .getElementById("certificate-form")
    .addEventListener("submit", handleCertificateSubmit);
  document
    .getElementById("team-form")
    .addEventListener("submit", handleTeamSubmit);

  // Confirm delete button
  document
    .getElementById("confirm-delete")
    .addEventListener("click", handleDeleteConfirm);

  // Search functionality
  document
    .getElementById("product-search")
    .addEventListener("input", filterProducts);
  document
    .getElementById("gallery-search")
    .addEventListener("input", filterGallery);
  document
    .getElementById("certificate-search")
    .addEventListener("input", filterCertificates);
  document
    .getElementById("team-search")
    .addEventListener("input", filterTeamMembers);

  // Filter functionality
  document
    .getElementById("product-category")
    .addEventListener("change", filterProducts);
  document
    .getElementById("gallery-category")
    .addEventListener("change", filterGallery);
  document
    .getElementById("certificate-category")
    .addEventListener("change", filterCertificates);
  document
    .getElementById("team-department")
    .addEventListener("change", filterTeamMembers);

  // Set up refresh buttons
  function setupRefreshButton(id, refreshFunction) {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", function() {
        refreshFunction();
      });
      console.log(`Set up ${id} button`);
    } else {
      console.error(`Button with ID "${id}" not found`);
    }
  }

  // Set up all refresh buttons
  setupRefreshButton("refresh-data", refreshAllData);
  setupRefreshButton("refresh-products-btn", refreshProducts);
  setupRefreshButton("refresh-gallery-btn", refreshGallery);
  setupRefreshButton("refresh-certificates-btn", refreshCertificates);
  setupRefreshButton("refresh-team-btn", refreshTeam);
}

// Load all data from local storage or API
async function loadAllData() {
  try {
    await loadProducts();
    await loadGallery();
    await loadCertificates();
    await loadTeamMembers();
  } catch (error) {
    console.error("Error loading data:", error);
    showNotification(
      "Failed to load some data. Please try refreshing.",
      "warning"
    );
  }
}

// Refresh all data from API
async function refreshAllData() {
  // Show loading state on the refresh button
  const refreshBtn = document.getElementById("refresh-data");
  if (refreshBtn) {
    const originalBtnText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;

    try {
      // Clear any cached data
      localStorage.clear();

      // Reload all data from API
      await loadAllData();

      // Show success message
      showNotification("All data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showNotification("Failed to refresh data. Please try again.", "error");
    } finally {
      // Restore button state
      refreshBtn.innerHTML = originalBtnText;
      refreshBtn.disabled = false;
    }
  } else {
    try {
      // Clear any cached data
      localStorage.clear();

      // Reload all data from API
      await loadAllData();

      // Show success message
      showNotification("All data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showNotification("Failed to refresh data. Please try again.", "error");
    }
  }
}

// Refresh products data
async function refreshProducts() {
  // Show loading state on the refresh button
  const refreshBtn = document.getElementById("refresh-products-btn");
  if (refreshBtn) {
    const originalBtnText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
  }

  try {
    // Clear products from local storage
    localStorage.removeItem("products");

    // Reload products data from API
    await loadProducts();

    // Show success message
    showNotification("Products refreshed successfully!");
  } catch (error) {
    console.error("Error refreshing products:", error);
    showNotification("Failed to refresh products. Please try again.", "error");
  } finally {
    // Restore button state if it exists
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
      refreshBtn.disabled = false;
    }
  }
}

// Refresh gallery data
async function refreshGallery() {
  // Show loading state on the refresh button
  const refreshBtn = document.getElementById("refresh-gallery-btn");
  if (refreshBtn) {
    const originalBtnText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
  }

  try {
    // Clear gallery from local storage
    localStorage.removeItem("gallery");

    // Reload gallery data from API
    await loadGallery();

    // Show success message
    showNotification("Gallery refreshed successfully!");
  } catch (error) {
    console.error("Error refreshing gallery:", error);
    showNotification("Failed to refresh gallery. Please try again.", "error");
  } finally {
    // Restore button state if it exists
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
      refreshBtn.disabled = false;
    }
  }
}

// Refresh certificates data
async function refreshCertificates() {
  // Show loading state on the refresh button
  const refreshBtn = document.getElementById("refresh-certificates-btn");
  if (refreshBtn) {
    const originalBtnText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
  }

  try {
    // Clear certificates from local storage
    localStorage.removeItem("certificates");

    // Reload certificates data from API
    await loadCertificates();

    // Show success message
    showNotification("Certificates refreshed successfully!");
  } catch (error) {
    console.error("Error refreshing certificates:", error);
    showNotification("Failed to refresh certificates. Please try again.", "error");
  } finally {
    // Restore button state if it exists
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
      refreshBtn.disabled = false;
    }
  }
}

// Refresh team data
async function refreshTeam() {
  // Show loading state on the refresh button
  const refreshBtn = document.getElementById("refresh-team-btn");
  if (refreshBtn) {
    const originalBtnText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
  }

  try {
    // Clear team from local storage
    localStorage.removeItem("team");

    // Reload team data from API
    await loadTeamMembers();

    // Show success message
    showNotification("Team members refreshed successfully!");
  } catch (error) {
    console.error("Error refreshing team members:", error);
    showNotification("Failed to refresh team members. Please try again.", "error");
  } finally {
    // Restore button state if it exists
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
      refreshBtn.disabled = false;
    }
  }
}

// ===== PRODUCTS FUNCTIONALITY =====

// Load products from API
async function loadProducts() {
  const productsContainer = document.getElementById("products-container");

  if (!productsContainer) return;

  // Show loading state
  productsContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading products...</p>
    </div>
  `;

  try {
    // Check if API is available
    const isApiAvailable = await checkApiAvailability();

    if (!isApiAvailable) {
      // Load from local storage if API is not available
      const products = getFromLocalStorage("products") || [];
      renderProducts(products);
      return;
    }

    // Fetch products from API
    const products = await ProductsAPI.getAll();

    // Save to local storage for offline use
    saveToLocalStorage("products", products);

    // Render products
    renderProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load products. Please try again.</p>
        <button class="retry-btn" onclick="loadProducts()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// Create sample products
function createSampleProducts() {
  return [
    {
      id: generateId(),
      name: "Organic Olive Oil",
      category: "oils",
      price: 12.99,
      description:
        "Premium cold-pressed organic olive oil from sustainable farms. Rich in antioxidants and perfect for cooking or as a salad dressing.",
      image: "assets/images/product1.jpg",
    },
    {
      id: generateId(),
      name: "Dried Rosemary",
      category: "herbs",
      price: 4.99,
      description:
        "Aromatic dried rosemary leaves, perfect for seasoning meats, soups, and stews. Grown in our organic herb gardens.",
      image: "assets/images/product2.jpg",
    },
    {
      id: generateId(),
      name: "Turmeric Powder",
      category: "spices",
      price: 5.99,
      description:
        "High-quality organic turmeric powder with high curcumin content. Adds flavor and health benefits to your dishes.",
      image: "assets/images/product3.jpg",
    },
    {
      id: generateId(),
      name: "Organic Chia Seeds",
      category: "organic",
      price: 8.99,
      description:
        "Nutrient-rich organic chia seeds packed with omega-3 fatty acids, fiber, and protein. Perfect for smoothies, puddings, and baking.",
      image: "assets/images/product4.jpg",
    },
  ];
}

// Create a product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.dataset.id = product._id || product.id;

  card.innerHTML = `
        <div class="item-image">
            <img src="${product.image}" alt="${
    product.name
  }" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="item-badge">${product.category}</div>
        </div>
        <div class="item-content">
            <h3 class="item-title">${product.name}</h3>
            <div class="item-subtitle">$${parseFloat(product.price).toFixed(
              2
            )}</div>
            <p class="item-description">${product.description}</p>
            <div class="item-actions">
                <button class="edit-btn" onclick="openModal('product', 'edit', '${
                  product._id || product.id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="openDeleteModal('product', '${
                  product._id || product.id
                }', '${product.name}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

  return card;
}

// Handle product form submission
async function handleProductSubmit(e) {
  e.preventDefault();

  // Show loading state on the submit button
  const submitBtn = e.target.querySelector(".save-btn");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;

  try {
    const productId = document.getElementById("product-id").value;
    const productName = document.getElementById("product-name").value;
    const productCategory = document.getElementById(
      "product-category-select"
    ).value;
    const productPrice = document.getElementById("product-price").value;
    const productDescription = document.getElementById(
      "product-description"
    ).value;
    const productImage = document.getElementById("product-image").value;

    const product = {
      name: productName,
      category: productCategory,
      price: productPrice,
      description: productDescription,
      image: productImage,
    };

    let result;

    if (productId) {
      // Update existing product
      result = await ProductsAPI.update(productId, product);
    } else {
      // Add new product
      result = await ProductsAPI.create(product);
    }

    // Reload products and close modal
    await loadProducts();
    closeModal("product");

    // Show success message
    showNotification("Product saved successfully!");
  } catch (error) {
    console.error("Error saving product:", error);
    showNotification("Failed to save product. Please try again.", "error");
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
}

// Filter products based on search and category
async function filterProducts() {
  const searchTerm = document
    .getElementById("product-search")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("product-category").value;

  const productsContainer = document.getElementById("products-container");

  // Show loading state
  productsContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Filtering products...</p>
    </div>
  `;

  try {
    // Fetch all products from API
    const products = await ProductsAPI.getAll();

    // Clear container
    productsContainer.innerHTML = "";

    // Filter products
    const filteredProducts = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
      productsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No products match your search criteria.</p>
        </div>
      `;
      return;
    }

    // Render filtered products
    filteredProducts.forEach((product) => {
      const productCard = createProductCard(product);
      productsContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    productsContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to filter products. Please try again.</p>
        <button class="retry-btn" onclick="filterProducts()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// ===== GALLERY FUNCTIONALITY =====

// Load gallery items from API
async function loadGallery() {
  const galleryContainer = document.getElementById("gallery-container");

  if (!galleryContainer) return;

  // Show loading state
  galleryContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading gallery items...</p>
    </div>
  `;

  try {
    // Check if API is available
    const isApiAvailable = await checkApiAvailability();

    if (!isApiAvailable) {
      // Load from local storage if API is not available
      const gallery = getFromLocalStorage("gallery") || [];
      renderGallery(gallery);
      return;
    }

    // Fetch gallery items from API
    const galleryItems = await GalleryAPI.getAll();

    // Save to local storage for offline use
    saveToLocalStorage("gallery", galleryItems);

    // Render gallery items
    renderGallery(galleryItems);
  } catch (error) {
    console.error("Error loading gallery items:", error);
    galleryContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load gallery items. Please try again.</p>
        <button class="retry-btn" onclick="loadGallery()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// Create a gallery card element
function createGalleryCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.dataset.id = item._id || item.id;

  card.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${
    item.title
  }" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="item-badge">${item.category}</div>
        </div>
        <div class="item-content">
            <h3 class="item-title">${item.title}</h3>
            <p class="item-description">${item.description}</p>
            <div class="item-actions">
                <button class="edit-btn" onclick="openModal('gallery', 'edit', '${
                  item._id || item.id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="openDeleteModal('gallery', '${
                  item._id || item.id
                }', '${item.title}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

  return card;
}

// Handle gallery form submission
async function handleGallerySubmit(e) {
  e.preventDefault();

  // Show loading state on the submit button
  const submitBtn = e.target.querySelector(".save-btn");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;

  try {
    const galleryId = document.getElementById("gallery-id").value;
    const galleryTitle = document.getElementById("gallery-title").value;
    const galleryCategory = document.getElementById(
      "gallery-category-select"
    ).value;
    const galleryDescription = document.getElementById(
      "gallery-description"
    ).value;
    const galleryImage = document.getElementById("gallery-image").value;

    const galleryItem = {
      title: galleryTitle,
      category: galleryCategory,
      description: galleryDescription,
      image: galleryImage,
    };

    let result;

    if (galleryId) {
      // Update existing item
      result = await GalleryAPI.update(galleryId, galleryItem);
    } else {
      // Add new item
      result = await GalleryAPI.create(galleryItem);
    }

    // Reload gallery and close modal
    await loadGallery();
    closeModal("gallery");

    // Show success message
    showNotification("Gallery item saved successfully!");
  } catch (error) {
    console.error("Error saving gallery item:", error);
    showNotification("Failed to save gallery item. Please try again.", "error");
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
}

// Filter gallery items based on search and category
async function filterGallery() {
  const searchTerm = document
    .getElementById("gallery-search")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("gallery-category").value;

  const galleryContainer = document.getElementById("gallery-container");

  // Show loading state
  galleryContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Filtering gallery items...</p>
    </div>
  `;

  try {
    // Fetch all gallery items from API
    const galleryItems = await GalleryAPI.getAll();

    // Clear container
    galleryContainer.innerHTML = "";

    // Filter gallery items
    const filteredItems = galleryItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    if (filteredItems.length === 0) {
      galleryContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No gallery items match your search criteria.</p>
        </div>
      `;
      return;
    }

    // Render filtered items
    filteredItems.forEach((item) => {
      const galleryCard = createGalleryCard(item);
      galleryContainer.appendChild(galleryCard);
    });
  } catch (error) {
    console.error("Error filtering gallery items:", error);
    galleryContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to filter gallery items. Please try again.</p>
        <button class="retry-btn" onclick="filterGallery()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// ===== CERTIFICATES FUNCTIONALITY =====

// Load certificates from API
async function loadCertificates() {
  const certificatesContainer = document.getElementById(
    "certificates-container"
  );

  if (!certificatesContainer) return;

  // Show loading state
  certificatesContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading certificates...</p>
    </div>
  `;

  try {
    // Check if API is available
    const isApiAvailable = await checkApiAvailability();

    if (!isApiAvailable) {
      // Load from local storage if API is not available
      const certificates = getFromLocalStorage("certificates") || [];
      renderCertificates(certificates);
      return;
    }

    // Fetch certificates from API
    const certificates = await CertificatesAPI.getAll();

    // Save to local storage for offline use
    saveToLocalStorage("certificates", certificates);

    // Render certificates
    renderCertificates(certificates);
  } catch (error) {
    console.error("Error loading certificates:", error);
    certificatesContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load certificates. Please try again.</p>
        <button class="retry-btn" onclick="loadCertificates()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// Create a certificate card element
function createCertificateCard(certificate) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.dataset.id = certificate._id || certificate.id;

  // Format dates
  const issueDate = new Date(certificate.issueDate).toLocaleDateString();
  const expiryDate = new Date(certificate.expiryDate).toLocaleDateString();

  card.innerHTML = `
        <div class="item-image">
            <img src="${certificate.image}" alt="${
    certificate.title
  }" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="item-badge">${certificate.category}</div>
        </div>
        <div class="item-content">
            <h3 class="item-title">${certificate.title}</h3>
            <div class="item-subtitle">Issued: ${issueDate} | Valid until: ${expiryDate}</div>
            <p class="item-description">${certificate.description}</p>
            <div class="item-actions">
                <button class="edit-btn" onclick="openModal('certificate', 'edit', '${
                  certificate._id || certificate.id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="openDeleteModal('certificate', '${
                  certificate._id || certificate.id
                }', '${certificate.title}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

  return card;
}

// Handle certificate form submission
async function handleCertificateSubmit(e) {
  e.preventDefault();

  // Show loading state on the submit button
  const submitBtn = e.target.querySelector(".save-btn");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;

  try {
    const certificateId = document.getElementById("certificate-id").value;
    const certificateTitle = document.getElementById("certificate-title").value;
    const certificateCategory = document.getElementById(
      "certificate-category-select"
    ).value;
    const certificateDescription = document.getElementById(
      "certificate-description"
    ).value;
    const certificateIssueDate = document.getElementById(
      "certificate-issue-date"
    ).value;
    const certificateExpiryDate = document.getElementById(
      "certificate-expiry-date"
    ).value;
    const certificateImage = document.getElementById("certificate-image").value;

    const certificate = {
      title: certificateTitle,
      category: certificateCategory,
      description: certificateDescription,
      issueDate: certificateIssueDate,
      expiryDate: certificateExpiryDate,
      image: certificateImage,
    };

    let result;

    if (certificateId) {
      // Update existing certificate
      result = await CertificatesAPI.update(certificateId, certificate);
    } else {
      // Add new certificate
      result = await CertificatesAPI.create(certificate);
    }

    // Reload certificates and close modal
    await loadCertificates();
    closeModal("certificate");

    // Show success message
    showNotification("Certificate saved successfully!");
  } catch (error) {
    console.error("Error saving certificate:", error);
    showNotification("Failed to save certificate. Please try again.", "error");
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
}

// Filter certificates based on search and category
async function filterCertificates() {
  const searchTerm = document
    .getElementById("certificate-search")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("certificate-category").value;

  const certificatesContainer = document.getElementById(
    "certificates-container"
  );

  // Show loading state
  certificatesContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Filtering certificates...</p>
    </div>
  `;

  try {
    // Fetch all certificates from API
    const certificates = await CertificatesAPI.getAll();

    // Clear container
    certificatesContainer.innerHTML = "";

    // Filter certificates
    const filteredCertificates = certificates.filter((certificate) => {
      const matchesSearch =
        certificate.title.toLowerCase().includes(searchTerm) ||
        certificate.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        categoryFilter === "all" || certificate.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    if (filteredCertificates.length === 0) {
      certificatesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No certificates match your search criteria.</p>
        </div>
      `;
      return;
    }

    // Render filtered certificates
    filteredCertificates.forEach((certificate) => {
      const certificateCard = createCertificateCard(certificate);
      certificatesContainer.appendChild(certificateCard);
    });
  } catch (error) {
    console.error("Error filtering certificates:", error);
    certificatesContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to filter certificates. Please try again.</p>
        <button class="retry-btn" onclick="filterCertificates()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// ===== TEAM MEMBERS FUNCTIONALITY =====

// Load team members from API
async function loadTeamMembers() {
  const teamContainer = document.getElementById("team-container");

  if (!teamContainer) return;

  // Show loading state
  teamContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading team members...</p>
    </div>
  `;

  try {
    // Check if API is available
    const isApiAvailable = await checkApiAvailability();

    if (!isApiAvailable) {
      // Load from local storage if API is not available
      const team = getFromLocalStorage("team") || [];
      renderTeam(team);
      return;
    }

    // Fetch team members from API
    const teamMembers = await TeamAPI.getAll();

    // Save to local storage for offline use
    saveToLocalStorage("team", teamMembers);

    // Render team members
    renderTeam(teamMembers);
  } catch (error) {
    console.error("Error loading team members:", error);
    teamContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load team members. Please try again.</p>
        <button class="retry-btn" onclick="loadTeamMembers()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// Create a team member card element
function createTeamCard(member) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.dataset.id = member._id || member.id;

  card.innerHTML = `
        <div class="item-image">
            <img src="${member.image}" alt="${
    member.name
  }" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="item-badge">${member.department}</div>
        </div>
        <div class="item-content">
            <h3 class="item-title">${member.name}</h3>
            <div class="item-subtitle">${member.position}</div>
            <p class="item-description">${member.bio}</p>
            <div class="item-actions">
                <button class="edit-btn" onclick="openModal('team', 'edit', '${
                  member._id || member.id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="openDeleteModal('team', '${
                  member._id || member.id
                }', '${member.name}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;

  return card;
}

// Handle team member form submission
async function handleTeamSubmit(e) {
  e.preventDefault();

  // Show loading state on the submit button
  const submitBtn = e.target.querySelector(".save-btn");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;

  try {
    const teamId = document.getElementById("team-id").value;
    const teamName = document.getElementById("team-name").value;
    const teamPosition = document.getElementById("team-position").value;
    const teamDepartment = document.getElementById(
      "team-department-select"
    ).value;
    const teamBio = document.getElementById("team-bio").value;
    const teamEmail = document.getElementById("team-email").value;
    const teamImage = document.getElementById("team-image").value;

    const teamMember = {
      name: teamName,
      position: teamPosition,
      department: teamDepartment,
      bio: teamBio,
      email: teamEmail,
      image: teamImage,
    };

    let result;

    if (teamId) {
      // Update existing team member
      result = await TeamAPI.update(teamId, teamMember);
    } else {
      // Add new team member
      result = await TeamAPI.create(teamMember);
    }

    // Reload team members and close modal
    await loadTeamMembers();
    closeModal("team");

    // Show success message
    showNotification("Team member saved successfully!");
  } catch (error) {
    console.error("Error saving team member:", error);
    showNotification("Failed to save team member. Please try again.", "error");
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
}

// Filter team members based on search and department
async function filterTeamMembers() {
  const searchTerm = document.getElementById("team-search").value.toLowerCase();
  const departmentFilter = document.getElementById("team-department").value;

  const teamContainer = document.getElementById("team-container");

  // Show loading state
  teamContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Filtering team members...</p>
    </div>
  `;

  try {
    // Fetch all team members from API
    const teamMembers = await TeamAPI.getAll();

    // Clear container
    teamContainer.innerHTML = "";

    // Filter team members
    const filteredMembers = teamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm) ||
        member.position.toLowerCase().includes(searchTerm) ||
        member.bio.toLowerCase().includes(searchTerm);
      const matchesDepartment =
        departmentFilter === "all" || member.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });

    if (filteredMembers.length === 0) {
      teamContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No team members match your search criteria.</p>
        </div>
      `;
      return;
    }

    // Render filtered team members
    filteredMembers.forEach((member) => {
      const teamCard = createTeamCard(member);
      teamContainer.appendChild(teamCard);
    });
  } catch (error) {
    console.error("Error filtering team members:", error);
    teamContainer.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to filter team members. Please try again.</p>
        <button class="retry-btn" onclick="filterTeamMembers()">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>
    `;
  }
}

// ===== UTILITY FUNCTIONS =====

// Show notification
function showNotification(message, type = "success") {
  // Create notification element if it doesn't exist
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    document.body.appendChild(notification);
  }

  // Set notification type and message
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle"
      }"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;

  // Show notification
  notification.classList.add("show");

  // Add close button event listener
  const closeButton = notification.querySelector(".notification-close");
  if (closeButton) {
    closeButton.addEventListener("click", function() {
      notification.classList.remove("show");
    });
  }

  // Auto-hide notification after 5 seconds
  setTimeout(() => {
    if (notification) {
      notification.classList.remove("show");
    }
  }, 5000);
}

// Save data to local storage
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to local storage (${key}):`, error);
    return false;
  }
}

// Get data from local storage
function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting from local storage (${key}):`, error);
    return null;
  }
}

// Open modal for adding or editing an item
function openModal(type, action, id = null) {
  const modal = document.getElementById(`${type}-modal`);
  if (!modal) {
    console.error(`Modal with ID "${type}-modal" not found`);
    return;
  }

  // Set current item ID and type
  currentItemId = id;
  currentItemType = type;

  // Set modal title
  const modalTitle = document.getElementById(`${type}-modal-title`);
  if (modalTitle) {
    modalTitle.textContent = action === "add" ? `Add New ${capitalize(type)}` : `Edit ${capitalize(type)}`;
  }

  // Clear form if adding new item
  if (action === "add") {
    const form = document.getElementById(`${type}-form`);
    if (form) {
      form.reset();

      // Clear image preview
      const imagePreview = document.getElementById(`${type}-image-preview`);
      if (imagePreview) {
        clearImagePreview(imagePreview);
      }

      // Clear hidden ID field
      const idField = document.getElementById(`${type}-id`);
      if (idField) {
        idField.value = "";
      }
    }
  } else if (action === "edit" && id) {
    // Populate form with item data
    populateForm(type, id);
  }

  // Show modal
  modal.style.display = "block";

  console.log(`Opened ${action} modal for ${type}${id ? ` with ID ${id}` : ""}`);
}

// Open delete confirmation modal
function openDeleteModal(type, id, name) {
  const modal = document.getElementById("delete-modal");
  if (!modal) {
    console.error(`Modal with ID "delete-modal" not found`);
    return;
  }

  // Set current item ID and type
  currentItemId = id;
  currentItemType = type;

  // Set delete message
  const deleteMessage = document.getElementById("delete-message");
  if (deleteMessage) {
    deleteMessage.textContent = `Are you sure you want to delete ${type === "team" ? "team member" : type} "${name}"?`;
  }

  // Show modal
  modal.style.display = "block";

  console.log(`Opened delete modal for ${type} with ID ${id}`);
}

// Close modal
function closeModal(type) {
  const modal = document.getElementById(`${type}-modal`);
  if (!modal) {
    console.error(`Modal with ID "${type}-modal" not found`);
    return;
  }

  // Hide modal
  modal.style.display = "none";

  console.log(`Closed ${type} modal`);
}

// This section was removed to fix duplicate code

// This section was removed to fix duplicate code

// Handle delete confirmation
async function handleDeleteConfirm() {
  if (!currentItemId || !currentItemType) return;

  // Show loading state on the delete button
  const deleteBtn = document.querySelector("#delete-modal .delete-btn");
  if (!deleteBtn) {
    console.error("Delete button not found");
    return;
  }

  const originalBtnText = deleteBtn.innerHTML;
  deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
  deleteBtn.disabled = true;

  try {
    // Delete the item using the appropriate API
    switch (currentItemType) {
      case "product":
        await ProductsAPI.delete(currentItemId);
        await loadProducts();
        break;
      case "gallery":
        await GalleryAPI.delete(currentItemId);
        await loadGallery();
        break;
      case "certificate":
        await CertificatesAPI.delete(currentItemId);
        await loadCertificates();
        break;
      case "team":
        await TeamAPI.delete(currentItemId);
        await loadTeamMembers();
        break;
    }

    // Close modal
    closeModal("delete");

    // Show success message
    showNotification(`${capitalize(currentItemType)} deleted successfully!`);
  } catch (error) {
    console.error(`Error deleting ${currentItemType}:`, error);
    showNotification(
      `Failed to delete ${currentItemType}. Please try again.`,
      "error"
    );
  } finally {
    // Restore button state
    deleteBtn.innerHTML = originalBtnText;
    deleteBtn.disabled = false;

    // Reset current item
    currentItemId = null;
    currentItemType = null;
  }
}

// Populate form with item data for editing
async function populateForm(type, id) {
  try {
    // Show loading state in the form
    const form = document.getElementById(`${type}-form`);
    const saveBtn = form.querySelector(".save-btn");

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }

    let item;

    // Fetch item data from API based on type
    switch (type) {
      case "product":
        item = await ProductsAPI.getById(id);
        break;
      case "gallery":
        item = await GalleryAPI.getById(id);
        break;
      case "certificate":
        item = await CertificatesAPI.getById(id);
        break;
      case "team":
        item = await TeamAPI.getById(id);
        break;
      default:
        console.error(`Unknown item type: ${type}`);
        return;
    }

    if (!item) {
      console.error(`Item with ID ${id} not found`);
      showNotification(`Failed to load ${type} data. Item not found.`, "error");
      return;
    }

    // Set ID field
    const idField = document.getElementById(`${type}-id`);
    if (idField) {
      idField.value = id;
    }

    // Populate form fields based on item type
    switch (type) {
      case "product":
        document.getElementById("product-name").value = item.name || "";
        document.getElementById("product-category-select").value =
          item.category || "other";
        document.getElementById("product-price").value = item.price || "";
        document.getElementById("product-description").value =
          item.description || "";
        document.getElementById("product-image").value = item.image || "";

        // Update image preview if image exists
        if (item.image) {
          updateImagePreview(
            document.getElementById("product-image-preview"),
            item.image
          );
        }
        break;

      case "gallery":
        document.getElementById("gallery-title").value = item.title || "";
        document.getElementById("gallery-category-select").value =
          item.category || "other";
        document.getElementById("gallery-description").value =
          item.description || "";
        document.getElementById("gallery-image").value = item.image || "";

        // Update image preview if image exists
        if (item.image) {
          updateImagePreview(
            document.getElementById("gallery-image-preview"),
            item.image
          );
        }
        break;

      case "certificate":
        document.getElementById("certificate-title").value = item.title || "";
        document.getElementById("certificate-category-select").value =
          item.category || "other";
        document.getElementById("certificate-description").value =
          item.description || "";
        document.getElementById("certificate-issue-date").value =
          item.issueDate || "";
        document.getElementById("certificate-expiry-date").value =
          item.expiryDate || "";
        document.getElementById("certificate-image").value = item.image || "";

        // Update image preview if image exists
        if (item.image) {
          updateImagePreview(
            document.getElementById("certificate-image-preview"),
            item.image
          );
        }
        break;

      case "team":
        document.getElementById("team-name").value = item.name || "";
        document.getElementById("team-position").value = item.position || "";
        document.getElementById("team-department-select").value =
          item.department || "other";
        document.getElementById("team-bio").value = item.bio || "";
        document.getElementById("team-email").value = item.email || "";
        document.getElementById("team-image").value = item.image || "";

        // Update image preview if image exists
        if (item.image) {
          updateImagePreview(
            document.getElementById("team-image-preview"),
            item.image
          );
        }
        break;
    }

    console.log(`Populated form for ${type} with ID ${id}`);
  } catch (error) {
    console.error(`Error populating form for ${type} with ID ${id}:`, error);
    showNotification(`Failed to load ${type} data. Please try again.`, "error");
  } finally {
    // Restore save button state
    const form = document.getElementById(`${type}-form`);
    const saveBtn = form.querySelector(".save-btn");

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save";
    }
  }
}

// Generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// Capitalize first letter of a string
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Save data to local storage
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved data to local storage: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error saving to local storage (${key}):`, error);
    return false;
  }
}

// Get data from local storage
function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting from local storage (${key}):`, error);
    return null;
  }
}

// Use the showNotification function from notifications.js

// Initialize mobile menu toggle
function initMobileMenu() {
  const mobileMenu = document.querySelector(".mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenu && navLinks) {
    mobileMenu.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      this.classList.toggle("active");
    });
  }
}

// Initialize sample data if none exists
function initializeSampleData() {
  // Check if we already have data
  const hasProducts =
    getFromLocalStorage("products") &&
    getFromLocalStorage("products").length > 0;
  const hasGallery =
    getFromLocalStorage("gallery") && getFromLocalStorage("gallery").length > 0;
  const hasCertificates =
    getFromLocalStorage("certificates") &&
    getFromLocalStorage("certificates").length > 0;
  const hasTeam =
    getFromLocalStorage("team") && getFromLocalStorage("team").length > 0;

  // If we have data in all categories, don't initialize sample data
  if (hasProducts && hasGallery && hasCertificates && hasTeam) {
    return;
  }

  // Sample products data
  if (!hasProducts) {
    const sampleProducts = [
      {
        id: generateId(),
        name: "Organic Olive Oil",
        category: "oils",
        price: 12.99,
        description:
          "Premium cold-pressed organic olive oil from sustainable farms. Rich in antioxidants and perfect for cooking or as a salad dressing.",
        image: "assets/images/product1.jpg",
      },
      {
        id: generateId(),
        name: "Dried Rosemary",
        category: "herbs",
        price: 4.99,
        description:
          "Aromatic dried rosemary leaves, perfect for seasoning meats, soups, and stews. Grown in our organic herb gardens.",
        image: "assets/images/product2.jpg",
      },
      {
        id: generateId(),
        name: "Turmeric Powder",
        category: "spices",
        price: 5.99,
        description:
          "High-quality organic turmeric powder with high curcumin content. Adds flavor and health benefits to your dishes.",
        image: "assets/images/product3.jpg",
      },
      {
        id: generateId(),
        name: "Organic Chia Seeds",
        category: "organic",
        price: 8.99,
        description:
          "Nutrient-rich organic chia seeds packed with omega-3 fatty acids, fiber, and protein. Perfect for smoothies, puddings, and baking.",
        image: "assets/images/product4.jpg",
      },
    ];

    saveToLocalStorage("products", sampleProducts);
  }

  // Sample gallery data
  if (!hasGallery) {
    const sampleGallery = [
      {
        id: generateId(),
        title: "Herb Garden",
        category: "facility",
        description:
          "Our organic herb garden where we grow a variety of medicinal and culinary herbs using sustainable farming practices.",
        image: "assets/images/gallery1.jpg",
      },
      {
        id: generateId(),
        title: "Essential Oil Extraction",
        category: "products",
        description:
          "Our state-of-the-art essential oil extraction process that preserves the natural properties of herbs and plants.",
        image: "assets/images/gallery2.jpg",
      },
      {
        id: generateId(),
        title: "Organic Farming Workshop",
        category: "events",
        description:
          "Annual workshop where we share our knowledge of organic farming techniques with local farmers and enthusiasts.",
        image: "assets/images/gallery3.jpg",
      },
    ];

    saveToLocalStorage("gallery", sampleGallery);
  }

  // Sample certificates data
  if (!hasCertificates) {
    const sampleCertificates = [
      {
        id: generateId(),
        title: "USDA Organic",
        category: "organic",
        description:
          "This certificate confirms that our products meet all USDA organic standards. Our organic certification ensures that our products are grown and processed according to federal guidelines addressing soil quality, animal raising practices, pest and weed control, and use of additives.",
        issueDate: "2020-01-15",
        expiryDate: "2025-01-15",
        image: "assets/images/cert1.jpg",
      },
      {
        id: generateId(),
        title: "Fair Trade Certified",
        category: "quality",
        description:
          "Fair Trade certification demonstrates our commitment to fair prices, direct trade, transparent and accountable relationships, community development, and environmental stewardship.",
        issueDate: "2019-03-10",
        expiryDate: "2024-03-10",
        image: "assets/images/cert2.jpg",
      },
      {
        id: generateId(),
        title: "Halal Certified",
        category: "religious",
        description:
          "This certification confirms that our products are permissible according to Islamic law and have been processed in accordance with these guidelines.",
        issueDate: "2021-08-05",
        expiryDate: "2023-08-05",
        image: "assets/images/cert6.jpg",
      },
    ];

    saveToLocalStorage("certificates", sampleCertificates);
  }

  // Sample team members data
  if (!hasTeam) {
    const sampleTeam = [
      {
        id: generateId(),
        name: "Sarah Johnson",
        position: "CEO & Founder",
        department: "management",
        bio: "With over 15 years of experience in organic farming and herbal medicine, Sarah founded HerbaCure with a vision to bring high-quality organic products to health-conscious consumers worldwide.",
        email: "sarah@herbacure.com",
        image: "assets/images/team1.jpg",
      },
      {
        id: generateId(),
        name: "Michael Chen",
        position: "Head of Production",
        department: "production",
        bio: "Michael oversees all aspects of our production process, ensuring that every product meets our strict quality standards while maintaining sustainable and ethical practices.",
        email: "michael@herbacure.com",
        image: "assets/images/team2.jpg",
      },
      {
        id: generateId(),
        name: "Amina Patel",
        position: "Quality Control Specialist",
        department: "quality",
        bio: "Amina's expertise in biochemistry and herbal science helps ensure that all our products maintain their natural properties and meet international quality standards.",
        email: "amina@herbacure.com",
        image: "assets/images/team3.jpg",
      },
    ];

    saveToLocalStorage("team", sampleTeam);
  }
}

// Use API_BASE_URL from api-services.js

// Initialize image upload functionality
function initImageUploads() {
  // Product image upload
  initImageUploadFor("product");

  // Gallery image upload
  initImageUploadFor("gallery");

  // Certificate image upload
  initImageUploadFor("certificate");

  // Team member image upload
  initImageUploadFor("team");
}

// Initialize image upload for a specific form
function initImageUploadFor(type) {
  const uploadBtn = document.getElementById(`${type}-upload-btn`);
  const fileInput = document.getElementById(`${type}-file-upload`);
  const imageUrlInput = document.getElementById(`${type}-image`);
  const imagePreview = document.getElementById(`${type}-image-preview`);

  if (!uploadBtn || !fileInput || !imageUrlInput || !imagePreview) return;

  // Set initial preview if URL exists
  imageUrlInput.addEventListener("input", function () {
    updateImagePreview(imagePreview, this.value);
  });

  // Show file picker when upload button is clicked
  uploadBtn.addEventListener("click", function () {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener("change", async function () {
    if (this.files && this.files[0]) {
      // Show loading state
      imagePreview.innerHTML = `
        <div class="spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Uploading image...</p>
      `;
      imagePreview.classList.add("has-image");

      try {
        // Check if API is available
        const isApiAvailable = await checkApiAvailability();
        if (!isApiAvailable) {
          throw new Error("Backend server is not available");
        }

        // Upload the image using the UploadAPI service
        const data = await UploadAPI.uploadImage(this.files[0]);

        // Update the image URL input
        imageUrlInput.value = data.url;

        // Update the preview
        updateImagePreview(imagePreview, data.url);

        // Show success message
        showNotification("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        imagePreview.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to upload image. Please try again.</p>
        `;
        showNotification("Failed to upload image. Please try again.", "error");
      }
    }
  });
}

// Update image preview
function updateImagePreview(previewElement, imageUrl) {
  if (imageUrl) {
    previewElement.innerHTML = `
      <img src="${imageUrl}" alt="Preview" />
      <div class="remove-image" onclick="clearImagePreview(this)">
        <i class="fas fa-times"></i>
      </div>
    `;
    previewElement.classList.add("has-image");
  } else {
    previewElement.innerHTML = `
      <i class="fas fa-image"></i>
      <p>No image selected</p>
    `;
    previewElement.classList.remove("has-image");
  }
}

// Clear image preview
function clearImagePreview(element) {
  const previewElement = element.closest(".image-preview");
  const inputId = previewElement.id.replace("-preview", "");
  const input = document.getElementById(inputId);

  if (input) {
    input.value = "";
  }

  previewElement.innerHTML = `
    <i class="fas fa-image"></i>
    <p>No image selected</p>
  `;
  previewElement.classList.remove("has-image");
}

// Render products from data
function renderProducts(products) {
  const productsContainer = document.getElementById("products-container");

  if (!productsContainer) return;

  // Clear container
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-leaf"></i>
        <p>No products found. Add your first product!</p>
      </div>
    `;
    return;
  }

  // Render each product
  products.forEach((product) => {
    const productCard = createProductCard(product);
    productsContainer.appendChild(productCard);
  });
}

// Render gallery items from data
function renderGallery(items) {
  const galleryContainer = document.getElementById("gallery-container");

  if (!galleryContainer) return;

  // Clear container
  galleryContainer.innerHTML = "";

  if (items.length === 0) {
    galleryContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-images"></i>
        <p>No gallery items found. Add your first image!</p>
      </div>
    `;
    return;
  }

  // Render each gallery item
  items.forEach((item) => {
    const galleryCard = createGalleryCard(item);
    galleryContainer.appendChild(galleryCard);
  });
}

// Render certificates from data
function renderCertificates(certificates) {
  const certificatesContainer = document.getElementById("certificates-container");

  if (!certificatesContainer) return;

  // Clear container
  certificatesContainer.innerHTML = "";

  if (certificates.length === 0) {
    certificatesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-certificate"></i>
        <p>No certificates found. Add your first certificate!</p>
      </div>
    `;
    return;
  }

  // Render each certificate
  certificates.forEach((certificate) => {
    const certificateCard = createCertificateCard(certificate);
    certificatesContainer.appendChild(certificateCard);
  });
}

// Render team members from data
function renderTeam(members) {
  const teamContainer = document.getElementById("team-container");

  if (!teamContainer) return;

  // Clear container
  teamContainer.innerHTML = "";

  if (members.length === 0) {
    teamContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>No team members found. Add your first team member!</p>
      </div>
    `;
    return;
  }

  // Render each team member
  members.forEach((member) => {
    const teamCard = createTeamCard(member);
    teamContainer.appendChild(teamCard);
  });
}

// Make functions available globally
window.openModal = openModal;
window.openDeleteModal = openDeleteModal;
window.closeModal = closeModal;
window.clearImagePreview = clearImagePreview;
window.updateImagePreview = updateImagePreview;
window.showNotification = showNotification;
window.renderProducts = renderProducts;
window.renderGallery = renderGallery;
window.renderCertificates = renderCertificates;
window.renderTeam = renderTeam;
window.refreshProducts = refreshProducts;
window.refreshGallery = refreshGallery;
window.refreshCertificates = refreshCertificates;
window.refreshTeam = refreshTeam;
window.refreshAllData = refreshAllData;
window.switchTab = switchTab;
window.generateId = generateId;
window.capitalize = capitalize;
window.initializeSampleData = initializeSampleData;
window.initMobileMenu = initMobileMenu;
window.initImageUploads = initImageUploads;
window.initImageUploadFor = initImageUploadFor;
window.saveToLocalStorage = saveToLocalStorage;
window.getFromLocalStorage = getFromLocalStorage;
