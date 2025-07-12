// API Configuration
// Import connection settings from dashboard-connection.js
const API_BASE_URL = window.dashboardConnection?.getApiBaseUrl() || 'http://localhost:5001/api';

// API Service Classes
class APIService {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.baseURL = API_BASE_URL;
  }

  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  async getAll(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}/${this.endpoint}${queryString ? `?${queryString}` : ''}`;
      const response = await this.request(url);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.warn(`Failed to fetch ${this.endpoint} from API, using local storage fallback`);
      // Return data from local storage as fallback
      return getFromLocalStorage(this.endpoint) || [];
    }
  }

  async getById(id) {
    try {
      const url = `${this.baseURL}/${this.endpoint}/${id}`;
      return await this.request(url);
    } catch (error) {
      console.warn(`Failed to fetch ${this.endpoint}/${id} from API, using local storage fallback`);
      // Try to find the item in local storage
      const items = getFromLocalStorage(this.endpoint) || [];
      return items.find(item => item.id === id || item._id === id);
    }
  }

  async create(data) {
    try {
      const url = `${this.baseURL}/${this.endpoint}`;
      return await this.request(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn(`Failed to create ${this.endpoint} via API, using local storage fallback`);
      // Create item in local storage
      const items = getFromLocalStorage(this.endpoint) || [];
      const newItem = {
        ...data,
        _id: generateLocalId(),
        createdAt: new Date().toISOString()
      };
      items.push(newItem);
      saveToLocalStorage(this.endpoint, items);
      return newItem;
    }
  }

  async update(id, data) {
    try {
      const url = `${this.baseURL}/${this.endpoint}/${id}`;
      return await this.request(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn(`Failed to update ${this.endpoint}/${id} via API, using local storage fallback`);
      // Update item in local storage
      const items = getFromLocalStorage(this.endpoint) || [];
      const index = items.findIndex(item => item.id === id || item._id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
        saveToLocalStorage(this.endpoint, items);
        return items[index];
      }
      throw new Error(`Item with id ${id} not found in local storage`);
    }
  }

  async delete(id) {
    try {
      const url = `${this.baseURL}/${this.endpoint}/${id}`;
      return await this.request(url, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn(`Failed to delete ${this.endpoint}/${id} via API, using local storage fallback`);
      // Delete item from local storage
      const items = getFromLocalStorage(this.endpoint) || [];
      const filteredItems = items.filter(item => item.id !== id && item._id !== id);
      saveToLocalStorage(this.endpoint, filteredItems);
      return { success: true, message: 'Item deleted from local storage' };
    }
  }
}

// Certificates API Service
class CertificatesAPIService extends APIService {
  constructor() {
    super('certificates');
  }

  async create(data) {
    // Transform data to match backend schema
    const certificateData = {
      title: data.title,
      description: data.description,
      issuer: {
        name: data.issuer_name || data.issuer?.name || 'Unknown Issuer',
        website: data.issuer_website || data.issuer?.website,
        logo: data.issuer_logo || data.issuer?.logo
      },
      certificate_number: data.certificate_number,
      issue_date: data.issue_date || data.issueDate,
      expiry_date: data.expiry_date || data.expiryDate,
      image: {
        url: data.image_url || data.image?.url || data.image,
        public_id: data.image_public_id || data.image?.public_id,
        alt_text: data.image_alt_text || data.image?.alt_text || data.title
      },
      category: data.category,
      status: data.status || 'active',
      verification: data.verification || {},
      tags: data.tags || [],
      featured: data.featured || false,
      active: data.active !== false,
      order: data.order || 0
    };

    return await super.create(certificateData);
  }

  async update(id, data) {
    // Transform data to match backend schema
    const certificateData = {
      title: data.title,
      description: data.description,
      issuer: {
        name: data.issuer_name || data.issuer?.name,
        website: data.issuer_website || data.issuer?.website,
        logo: data.issuer_logo || data.issuer?.logo
      },
      certificate_number: data.certificate_number,
      issue_date: data.issue_date || data.issueDate,
      expiry_date: data.expiry_date || data.expiryDate,
      image: {
        url: data.image_url || data.image?.url || data.image,
        public_id: data.image_public_id || data.image?.public_id,
        alt_text: data.image_alt_text || data.image?.alt_text || data.title
      },
      category: data.category,
      status: data.status,
      verification: data.verification,
      tags: data.tags,
      featured: data.featured,
      active: data.active,
      order: data.order
    };

    return await super.update(id, certificateData);
  }

  async getByCategory(category) {
    const url = `${this.baseURL}/${this.endpoint}/category/${category}`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async getActive() {
    const url = `${this.baseURL}/${this.endpoint}/active`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async getExpiring(days = 30) {
    const url = `${this.baseURL}/${this.endpoint}/expiring?days=${days}`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async toggleFeatured(id) {
    const url = `${this.baseURL}/${this.endpoint}/${id}/featured`;
    return await this.request(url, { method: 'PATCH' });
  }

  async verify(id, verificationData = {}) {
    const url = `${this.baseURL}/${this.endpoint}/${id}/verify`;
    return await this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(verificationData),
    });
  }
}

// Gallery API Service
class GalleryAPIService extends APIService {
  constructor() {
    super('gallery');
  }

  async create(data) {
    // Transform data to match backend schema
    const galleryData = {
      title: data.title,
      description: data.description,
      image: {
        url: data.image_url || data.image?.url || data.image,
        public_id: data.image_public_id || data.image?.public_id,
        alt_text: data.image_alt_text || data.image?.alt_text || data.title,
        width: data.image_width || data.image?.width,
        height: data.image_height || data.image?.height
      },
      category: data.category,
      tags: data.tags || [],
      featured: data.featured || false,
      active: data.active !== false,
      order: data.order || 0,
      metadata: data.metadata || {}
    };

    return await super.create(galleryData);
  }

  async update(id, data) {
    // Transform data to match backend schema
    const galleryData = {
      title: data.title,
      description: data.description,
      image: {
        url: data.image_url || data.image?.url || data.image,
        public_id: data.image_public_id || data.image?.public_id,
        alt_text: data.image_alt_text || data.image?.alt_text || data.title,
        width: data.image_width || data.image?.width,
        height: data.image_height || data.image?.height
      },
      category: data.category,
      tags: data.tags,
      featured: data.featured,
      active: data.active,
      order: data.order,
      metadata: data.metadata
    };

    return await super.update(id, galleryData);
  }

  async getByCategory(category) {
    const url = `${this.baseURL}/${this.endpoint}/category/${category}`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async getFeatured() {
    const url = `${this.baseURL}/${this.endpoint}/featured`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async toggleFeatured(id) {
    const url = `${this.baseURL}/${this.endpoint}/${id}/featured`;
    return await this.request(url, { method: 'PATCH' });
  }

  async reorder(itemIds) {
    const url = `${this.baseURL}/${this.endpoint}/reorder`;
    return await this.request(url, {
      method: 'PUT',
      body: JSON.stringify({ itemIds }),
    });
  }
}

// Products API Service (for future use)
class ProductsAPIService extends APIService {
  constructor() {
    super('products');
  }
}

// Team API Service
class TeamAPIService extends APIService {
  constructor() {
    super('team');
  }

  async create(data) {
    // Transform data to match backend schema
    const teamData = {
      name: data.name,
      position: data.position,
      department: data.department,
      bio: data.bio,
      image: {
        url: data.image_url || data.image?.url || data.image,
        public_id: data.image_public_id || data.image?.public_id,
        alt_text: data.image_alt_text || data.image?.alt_text || data.name
      },
      contact: {
        email: data.email || data.contact?.email,
        phone: data.phone || data.contact?.phone,
        extension: data.extension || data.contact?.extension
      },
      social_media: {
        linkedin: data.linkedin || data.social_media?.linkedin,
        twitter: data.twitter || data.social_media?.twitter
      },
      qualifications: data.qualifications || [],
      experience: {
        years: data.experience_years || data.experience?.years,
        previous_companies: data.previous_companies || data.experience?.previous_companies || []
      },
      specializations: data.specializations || [],
      languages: data.languages || [],
      join_date: data.join_date,
      featured: data.featured || false,
      active: data.active !== false,
      order: data.order || 0
    };

    return await super.create(teamData);
  }

  async update(id, data) {
    // Transform data to match backend schema
    const teamData = {
      name: data.name,
      position: data.position,
      department: data.department,
      bio: data.bio,
      image: {
        url: data.image_url || data.image?.url || data.image,
        public_id: data.image_public_id || data.image?.public_id,
        alt_text: data.image_alt_text || data.image?.alt_text || data.name
      },
      contact: {
        email: data.email || data.contact?.email,
        phone: data.phone || data.contact?.phone,
        extension: data.extension || data.contact?.extension
      },
      social_media: {
        linkedin: data.linkedin || data.social_media?.linkedin,
        twitter: data.twitter || data.social_media?.twitter
      },
      qualifications: data.qualifications,
      experience: {
        years: data.experience_years || data.experience?.years,
        previous_companies: data.previous_companies || data.experience?.previous_companies
      },
      specializations: data.specializations,
      languages: data.languages,
      join_date: data.join_date,
      featured: data.featured,
      active: data.active,
      order: data.order
    };

    return await super.update(id, teamData);
  }

  async getByDepartment(department) {
    const url = `${this.baseURL}/${this.endpoint}/department/${department}`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async getFeatured() {
    const url = `${this.baseURL}/${this.endpoint}/featured`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async getManagement() {
    const url = `${this.baseURL}/${this.endpoint}/management`;
    const response = await this.request(url);
    return Array.isArray(response) ? response : response.data || [];
  }

  async getStats() {
    const url = `${this.baseURL}/${this.endpoint}/stats`;
    const response = await this.request(url);
    return response.data || response;
  }

  async toggleFeatured(id) {
    const url = `${this.baseURL}/${this.endpoint}/${id}/featured`;
    return await this.request(url, { method: 'PATCH' });
  }
}

// Upload API Service
class UploadAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async uploadImage(file, folder = 'herbacure') {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  async uploadImages(files, folder = 'herbacure') {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch(`${this.baseURL}/upload/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  async deleteImage(publicId) {
    try {
      const response = await fetch(`${this.baseURL}/upload/image/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}

// Health Check Service
class HealthAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async check() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Create API service instances
const CertificatesAPI = new CertificatesAPIService();
const GalleryAPI = new GalleryAPIService();
const ProductsAPI = new ProductsAPIService();
const TeamAPI = new TeamAPIService();
const UploadAPI = new UploadAPIService();
const HealthAPI = new HealthAPIService();

// Utility function to check API availability
async function checkApiAvailability() {
  try {
    await HealthAPI.check();
    return true;
  } catch (error) {
    console.warn('Backend API is not available:', error.message);
    // Initialize sample data if API is not available
    initializeSampleData();
    return false;
  }
}

// Initialize sample data for offline mode
function initializeSampleData() {
  console.log('Initializing sample data for offline mode');
  
  // Only initialize if local storage is empty
  if (!getFromLocalStorage('products')) {
    const sampleProducts = [
      {
        _id: 'sample_product_1',
        name: 'Organic Basil',
        description: 'Fresh organic basil grown in our farms',
        price: 4.99,
        category: 'herbs',
        image: 'assets/images/BASIL.jpg',
        stock: 100,
        featured: true,
        active: true
      },
      {
        _id: 'sample_product_2',
        name: 'Cinnamon Sticks',
        description: 'Premium quality cinnamon sticks',
        price: 6.99,
        category: 'spices',
        image: 'assets/images/Cinnamon.jpg',
        stock: 75,
        featured: true,
        active: true
      },
      {
        _id: 'sample_product_3',
        name: 'Lemongrass',
        description: 'Fresh lemongrass for cooking and tea',
        price: 3.99,
        category: 'herbs',
        image: 'assets/images/Lemon-grass.jpg',
        stock: 50,
        featured: false,
        active: true
      }
    ];
    saveToLocalStorage('products', sampleProducts);
  }
  
  if (!getFromLocalStorage('gallery')) {
    const sampleGallery = [
      {
        _id: 'sample_gallery_1',
        title: 'Our Farm',
        description: 'View of our organic herb farm',
        image: 'assets/images/gallery-farm1.png',
        category: 'farm',
        featured: true,
        active: true
      },
      {
        _id: 'sample_gallery_2',
        title: 'Processing Facility',
        description: 'Our state-of-the-art processing facility',
        image: 'assets/images/gallery-facility1.jpg',
        category: 'facility',
        featured: true,
        active: true
      },
      {
        _id: 'sample_gallery_3',
        title: 'Herb Festival',
        description: 'Annual herb festival at our farm',
        image: 'assets/images/gallery-event1.jpg',
        category: 'events',
        featured: false,
        active: true
      }
    ];
    saveToLocalStorage('gallery', sampleGallery);
  }
  
  if (!getFromLocalStorage('certificates')) {
    const sampleCertificates = [
      {
        _id: 'sample_cert_1',
        title: 'Organic Certification',
        description: 'Certified organic by international standards',
        image: {
          url: 'assets/images/cert1.png'
        },
        issuer: {
          name: 'Global Organic Alliance'
        },
        category: 'organic',
        featured: true,
        active: true
      },
      {
        _id: 'sample_cert_2',
        title: 'Quality Assurance',
        description: 'Meeting the highest quality standards',
        image: {
          url: 'assets/images/cert2.png'
        },
        issuer: {
          name: 'Quality Assurance International'
        },
        category: 'quality',
        featured: true,
        active: true
      }
    ];
    saveToLocalStorage('certificates', sampleCertificates);
  }
  
  if (!getFromLocalStorage('team')) {
    const sampleTeam = [
      {
        _id: 'sample_team_1',
        name: 'John Smith',
        position: 'CEO & Founder',
        bio: 'Passionate about organic farming for over 20 years',
        image: 'assets/images/team/team-1.jpg',
        department: 'management',
        active: true
      },
      {
        _id: 'sample_team_2',
        name: 'Sarah Johnson',
        position: 'Head of Production',
        bio: 'Expert in sustainable farming practices',
        image: 'assets/images/team/team-2.jpg',
        department: 'production',
        active: true
      }
    ];
    saveToLocalStorage('team', sampleTeam);
  }
}

// Create API service instances
const ProductsAPI = new APIService('products');
const GalleryAPI = new APIService('gallery');
const CertificatesAPI = new APIService('certificates');
const TeamAPI = new APIService('team');
const UploadAPI = new UploadAPIService();
const HealthAPI = new HealthAPIService();

// Export API services and utilities
window.ProductsAPI = ProductsAPI;
window.GalleryAPI = GalleryAPI;
window.CertificatesAPI = CertificatesAPI;
window.TeamAPI = TeamAPI;
window.UploadAPI = UploadAPI;
window.HealthAPI = HealthAPI;
window.checkApiAvailability = checkApiAvailability;
window.getFromLocalStorage = getFromLocalStorage;
window.saveToLocalStorage = saveToLocalStorage;
window.initializeSampleData = initializeSampleData;

// Helper functions for local storage
function getFromLocalStorage(key) {
  // Use the dashboard connection module if available, otherwise fallback to direct implementation
  if (window.dashboardConnection?.getFromLocalStorage) {
    return window.dashboardConnection.getFromLocalStorage(key);
  }
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting data from local storage for key ${key}:`, error);
    return null;
  }
}

function saveToLocalStorage(key, data) {
  // Use the dashboard connection module if available, otherwise fallback to direct implementation
  if (window.dashboardConnection?.saveToLocalStorage) {
    return window.dashboardConnection.saveToLocalStorage(key, data);
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to local storage for key ${key}:`, error);
    return false;
  }
}

function generateLocalId() {
  // Use the dashboard connection module if available, otherwise fallback to direct implementation
  if (window.dashboardConnection?.generateLocalId) {
    return window.dashboardConnection.generateLocalId();
  }
  
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ... rest of the file with service classes

// Health API Service
class HealthAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async check() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// API availability check
async function checkApiAvailability() {
  // Use the dashboard connection module if available, otherwise fallback to direct implementation
  if (window.dashboardConnection?.checkApiAvailability) {
    return await window.dashboardConnection.checkApiAvailability();
  }
  
  try {
    await HealthAPI.check();
    return true;
  } catch (error) {
    console.warn('Backend API is not available:', error.message);
    // Initialize sample data if API is not available
    initializeSampleData();
    return false;
  }
}

// Initialize sample data for offline mode
function initializeSampleData() {
  console.log('Initializing sample data for offline mode');
  
  // Only initialize if local storage is empty
  if (!getFromLocalStorage('products')) {
    const sampleProducts = [
      {
        _id: 'sample_product_1',
        name: 'Organic Basil',
        description: 'Fresh organic basil grown in our farms',
        price: 4.99,
        category: 'herbs',
        image: 'assets/images/BASIL.jpg',
        stock: 100,
        featured: true,
        active: true
      },
      {
        _id: 'sample_product_2',
        name: 'Cinnamon Sticks',
        description: 'Premium quality cinnamon sticks',
        price: 6.99,
        category: 'spices',
        image: 'assets/images/Cinnamon.jpg',
        stock: 75,
        featured: true,
        active: true
      },
      {
        _id: 'sample_product_3',
        name: 'Lemongrass',
        description: 'Fresh lemongrass for cooking and tea',
        price: 3.99,
        category: 'herbs',
        image: 'assets/images/Lemon-grass.jpg',
        stock: 50,
        featured: false,
        active: true
      }
    ];
    saveToLocalStorage('products', sampleProducts);
  }
  
  if (!getFromLocalStorage('gallery')) {
    const sampleGallery = [
      {
        _id: 'sample_gallery_1',
        title: 'Our Farm',
        description: 'View of our organic herb farm',
        image: 'assets/images/gallery-farm1.png',
        category: 'farm',
        featured: true,
        active: true
      },
      {
        _id: 'sample_gallery_2',
        title: 'Processing Facility',
        description: 'Our state-of-the-art processing facility',
        image: 'assets/images/gallery-facility1.jpg',
        category: 'facility',
        featured: true,
        active: true
      },
      {
        _id: 'sample_gallery_3',
        title: 'Herb Festival',
        description: 'Annual herb festival at our farm',
        image: 'assets/images/gallery-event1.jpg',
        category: 'events',
        featured: false,
        active: true
      }
    ];
    saveToLocalStorage('gallery', sampleGallery);
  }
  
  if (!getFromLocalStorage('certificates')) {
    const sampleCertificates = [
      {
        _id: 'sample_cert_1',
        title: 'Organic Certification',
        description: 'Certified organic by international standards',
        image: {
          url: 'assets/images/cert1.png'
        },
        issuer: {
          name: 'Global Organic Alliance'
        },
        category: 'organic',
        featured: true,
        active: true
      },
      {
        _id: 'sample_cert_2',
        title: 'Quality Assurance',
        description: 'Meeting the highest quality standards',
        image: {
          url: 'assets/images/cert2.png'
        },
        issuer: {
          name: 'Quality Assurance International'
        },
        category: 'quality',
        featured: true,
        active: true
      }
    ];
    saveToLocalStorage('certificates', sampleCertificates);
  }
  
  if (!getFromLocalStorage('team')) {
    const sampleTeam = [
      {
        _id: 'sample_team_1',
        name: 'John Smith',
        position: 'CEO & Founder',
        bio: 'Passionate about organic farming for over 20 years',
        image: 'assets/images/team/team-1.jpg',
        department: 'management',
        active: true
      },
      {
        _id: 'sample_team_2',
        name: 'Sarah Johnson',
        position: 'Head of Production',
        bio: 'Expert in sustainable farming practices',
        image: 'assets/images/team/team-2.jpg',
        department: 'production',
        active: true
      }
    ];
    saveToLocalStorage('team', sampleTeam);
  }
}

// Create API service instances
const ProductsAPI = new APIService('products');
const GalleryAPI = new APIService('gallery');
const CertificatesAPI = new APIService('certificates');
const TeamAPI = new APIService('team');
const UploadAPI = new UploadAPIService();
const HealthAPI = new HealthAPIService();

// Export API services and utilities
window.ProductsAPI = ProductsAPI;
window.GalleryAPI = GalleryAPI;
window.CertificatesAPI = CertificatesAPI;
window.TeamAPI = TeamAPI;
window.UploadAPI = UploadAPI;
window.HealthAPI = HealthAPI;
window.checkApiAvailability = checkApiAvailability;
window.getFromLocalStorage = getFromLocalStorage;
window.saveToLocalStorage = saveToLocalStorage;
window.initializeSampleData = initializeSampleData;
window.API_BASE_URL = API_BASE_URL;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CertificatesAPI,
    GalleryAPI,
    ProductsAPI,
    TeamAPI,
    UploadAPI,
    HealthAPI,
    checkApiAvailability,
    API_BASE_URL,
  };
}