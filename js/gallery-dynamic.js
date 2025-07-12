// Dynamic Gallery Loading
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading gallery dynamically...');
    
    try {
        // Check if API is available
        const isApiAvailable = await checkApiAvailability();
        
        if (isApiAvailable) {
            await loadGalleryFromAPI();
        } else {
            console.warn('API not available, using static content');
            // Keep the existing static gallery items
        }
        
        // Initialize filter functionality
        initializeGalleryFilters();
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        // Keep the existing static gallery as fallback
        initializeGalleryFilters();
    }
});

async function loadGalleryFromAPI() {
    try {
        // Show loading state
        showGalleryLoading();
        
        // Fetch gallery items from API
        const galleryItems = await GalleryAPI.getAll();
        
        if (galleryItems && galleryItems.length > 0) {
            // Update the gallery grid
            updateGalleryGrid(galleryItems);
            
            // Update filter buttons based on available categories
            updateFilterButtons(galleryItems);
            
            console.log(`Loaded ${galleryItems.length} gallery items from API`);
        } else {
            // Show empty state
            showEmptyGallery();
        }
    } catch (error) {
        console.error('Failed to load gallery from API:', error);
        showGalleryError();
        throw error;
    }
}

function showGalleryLoading() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = `
        <div class="loading-gallery">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading gallery items...</p>
        </div>
    `;
}

function showEmptyGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = `
        <div class="empty-gallery">
            <i class="fas fa-images"></i>
            <p>No gallery items found.</p>
        </div>
    `;
}

function showGalleryError() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = `
        <div class="error-gallery">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load gallery. Please try again later.</p>
            <button onclick="loadGalleryFromAPI()" class="retry-btn">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

function updateGalleryGrid(galleryItems) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Clear existing items
    galleryGrid.innerHTML = '';
    
    // Add gallery items from API
    galleryItems.forEach((item, index) => {
        const galleryItem = createGalleryItem(item, index);
        galleryGrid.appendChild(galleryItem);
    });
    
    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function createGalleryItem(item, index) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.setAttribute('data-category', item.category);
    galleryItem.setAttribute('data-aos', 'fade-up');
    galleryItem.setAttribute('data-aos-delay', (index * 50).toString());
    
    // Add featured class if item is featured
    if (item.featured) {
        galleryItem.classList.add('featured');
    }
    
    galleryItem.innerHTML = `
        <img src="${item.image.url}" alt="${item.title}" 
             onerror="this.src='assets/images/gallery-placeholder.jpg'"
             loading="lazy">
        <div class="gallery-overlay">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${item.featured ? '<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
            ${item.metadata?.photographer ? `<div class="photo-credit">Photo by: ${item.metadata.photographer}</div>` : ''}
        </div>
    `;
    
    // Add click event to open modal
    galleryItem.addEventListener('click', () => openGalleryModal(item, index));
    
    return galleryItem;
}

function updateFilterButtons(galleryItems) {
    const filterButtons = document.querySelector('.filter-buttons');
    if (!filterButtons) return;
    
    // Get unique categories from gallery items
    const categories = [...new Set(galleryItems.map(item => item.category))];
    
    // Clear existing buttons except "All"
    const allButton = filterButtons.querySelector('[data-filter="all"]');
    filterButtons.innerHTML = '';
    
    // Add "All" button back
    if (allButton) {
        filterButtons.appendChild(allButton);
    } else {
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn active';
        allBtn.setAttribute('data-filter', 'all');
        allBtn.textContent = 'All';
        filterButtons.appendChild(allBtn);
    }
    
    // Add category buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', category);
        button.textContent = formatCategoryName(category);
        filterButtons.appendChild(button);
    });
}

function formatCategoryName(category) {
    const categoryMap = {
        'products': 'Products',
        'facilities': 'Facilities',
        'team': 'Team',
        'events': 'Events',
        'certificates': 'Certificates',
        'process': 'Process',
        'farming': 'Farming'
    };
    
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

function initializeGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery items
            filterGalleryItems(filter);
        });
    });
}

function filterGalleryItems(filter) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            item.style.display = 'block';
            item.style.opacity = '0';
            
            // Animate in
            setTimeout(() => {
                item.style.opacity = '1';
            }, 50);
        } else {
            item.style.opacity = '0';
            
            // Hide after animation
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// Enhanced modal functionality
function openGalleryModal(item, index) {
    const modal = document.querySelector('.gallery-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    
    if (!modal || !modalImage || !modalTitle || !modalDescription) return;
    
    // Update modal content
    modalImage.src = item.image.url;
    modalImage.alt = item.title;
    modalTitle.textContent = item.title;
    modalDescription.innerHTML = `
        ${item.description}
        ${item.metadata?.location ? `<br><strong>Location:</strong> ${item.metadata.location}` : ''}
        ${item.metadata?.date_taken ? `<br><strong>Date:</strong> ${formatDate(item.metadata.date_taken)}` : ''}
        ${item.metadata?.photographer ? `<br><strong>Photographer:</strong> ${item.metadata.photographer}` : ''}
    `;
    
    // Store current index for navigation
    modal.setAttribute('data-current-index', index);
    
    // Show modal
    modal.style.display = 'block';
    
    // Update navigation buttons
    updateModalNavigation(index);
}

function updateModalNavigation(currentIndex) {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const galleryItems = document.querySelectorAll('.gallery-item:not([style*="display: none"])');
    
    if (!prevBtn || !nextBtn) return;
    
    // Update button states
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= galleryItems.length - 1;
    
    // Add click events
    prevBtn.onclick = () => navigateModal(currentIndex - 1);
    nextBtn.onclick = () => navigateModal(currentIndex + 1);
}

function navigateModal(newIndex) {
    const galleryItems = document.querySelectorAll('.gallery-item:not([style*="display: none"])');
    
    if (newIndex < 0 || newIndex >= galleryItems.length) return;
    
    const item = galleryItems[newIndex];
    const category = item.getAttribute('data-category');
    
    // Find the corresponding item data
    // This is a simplified approach - in a real app, you'd store the data more efficiently
    const img = item.querySelector('img');
    const title = item.querySelector('h3').textContent;
    const description = item.querySelector('p').textContent;
    
    const itemData = {
        image: { url: img.src },
        title: title,
        description: description,
        category: category
    };
    
    openGalleryModal(itemData, newIndex);
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Add CSS for new gallery features
const additionalCSS = `
    .loading-gallery,
    .empty-gallery,
    .error-gallery {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #666;
    }
    
    .loading-gallery i,
    .empty-gallery i,
    .error-gallery i {
        font-size: 3em;
        margin-bottom: 20px;
        display: block;
    }
    
    .loading-gallery i {
        animation: spin 1s linear infinite;
    }
    
    .error-gallery .retry-btn {
        margin-top: 20px;
        padding: 10px 20px;
        background: #2c5530;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s ease;
    }
    
    .error-gallery .retry-btn:hover {
        background: #1e3a21;
    }
    
    .gallery-item.featured {
        position: relative;
    }
    
    .featured-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ffc107;
        color: #212529;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .photo-credit {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 5px;
        font-style: italic;
    }
    
    .gallery-item {
        transition: opacity 0.3s ease, transform 0.3s ease;
        cursor: pointer;
    }
    
    .gallery-item:hover {
        transform: scale(1.02);
    }
    
    .filter-btn {
        transition: all 0.3s ease;
    }
    
    .filter-btn:hover {
        background: #f8f9fa;
    }
    
    .filter-btn.active {
        background: #2c5530;
        color: white;
    }
    
    .modal-nav button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Add the additional CSS to the page
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Make functions globally available
window.loadGalleryFromAPI = loadGalleryFromAPI;
window.updateGalleryGrid = updateGalleryGrid;
window.openGalleryModal = openGalleryModal;
window.filterGalleryItems = filterGalleryItems;