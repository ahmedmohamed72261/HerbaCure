// Dynamic Certificates Loading
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading certificates dynamically...');
    
    try {
        // Check if API is available
        const isApiAvailable = await checkApiAvailability();
        
        if (isApiAvailable) {
            await loadCertificatesFromAPI();
        } else {
            console.warn('API not available, using static content');
            // Keep the existing static certificates
        }
    } catch (error) {
        console.error('Error loading certificates:', error);
        // Keep the existing static certificates as fallback
    }
});

async function loadCertificatesFromAPI() {
    try {
        // Fetch certificates from API
        const certificates = await CertificatesAPI.getAll();
        
        if (certificates && certificates.length > 0) {
            // Update the certificates grid
            updateCertificatesGrid(certificates);
            
            // Update statistics
            updateCertificatesStats(certificates);
            
            console.log(`Loaded ${certificates.length} certificates from API`);
        }
    } catch (error) {
        console.error('Failed to load certificates from API:', error);
        throw error;
    }
}

function updateCertificatesGrid(certificates) {
    const certificatesGrid = document.querySelector('.certificates-grid');
    if (!certificatesGrid) return;
    
    // Clear existing certificates
    certificatesGrid.innerHTML = '';
    
    // Add certificates from API
    certificates.forEach((cert, index) => {
        const certificateCard = createCertificateCard(cert, index);
        certificatesGrid.appendChild(certificateCard);
    });
}

function createCertificateCard(cert, index) {
    const card = document.createElement('div');
    card.className = 'certificate-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index * 100 + 100).toString());
    
    // Determine badge text based on category
    const badgeText = getBadgeText(cert.category);
    
    // Format dates
    const issueDate = formatDate(cert.issue_date);
    const expiryDate = cert.expiry_date ? formatDate(cert.expiry_date) : 'No expiry';
    
    // Check if certificate is expired or expiring soon
    const statusClass = getCertificateStatusClass(cert);
    const statusText = getCertificateStatusText(cert);
    
    card.innerHTML = `
        <div class="certificate-badge ${statusClass}">${badgeText}</div>
        <div class="certificate-image">
            <img src="${cert.image.url}" alt="${cert.title}" 
                 onerror="this.src='assets/images/cert-placeholder.png'">
        </div>
        <div class="certificate-content">
            <h3>${cert.title}</h3>
            <p>${cert.description}</p>
            <p class="cert-date">
                Issued: ${issueDate} | Valid until: ${expiryDate}
            </p>
            ${cert.verification?.verified ? '<div class="verification-badge"><i class="fas fa-check-circle"></i> Verified</div>' : ''}
            ${statusText ? `<div class="status-indicator ${statusClass}">${statusText}</div>` : ''}
            <button class="view-cert btn-rotate" onclick="openCertificateModal('${cert._id}')">
                View Certificate
            </button>
        </div>
    `;
    
    return card;
}

function getBadgeText(category) {
    const categoryMap = {
        'quality': 'Quality',
        'organic': 'Organic',
        'iso': 'ISO Standard',
        'halal': 'Halal',
        'kosher': 'Kosher',
        'gmp': 'GMP',
        'haccp': 'HACCP',
        'fda': 'FDA',
        'other': 'Certified'
    };
    
    return categoryMap[category] || 'Certified';
}

function getCertificateStatusClass(cert) {
    if (!cert.expiry_date) return 'valid';
    
    const now = new Date();
    const expiryDate = new Date(cert.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
}

function getCertificateStatusText(cert) {
    if (!cert.expiry_date) return '';
    
    const now = new Date();
    const expiryDate = new Date(cert.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 30) return `Expires in ${daysUntilExpiry} days`;
    return '';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
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

function updateCertificatesStats(certificates) {
    // Update the statistics in the intro section
    const statItems = document.querySelectorAll('.stat-item');
    
    if (statItems.length >= 3) {
        // Update certificates count
        const certCount = statItems[0].querySelector('.stat-number');
        if (certCount) {
            certCount.textContent = `${certificates.length}+`;
        }
        
        // Calculate organic percentage
        const organicCerts = certificates.filter(cert => 
            cert.category === 'organic' || 
            cert.title.toLowerCase().includes('organic')
        );
        const organicPercentage = certificates.length > 0 
            ? Math.round((organicCerts.length / certificates.length) * 100)
            : 100;
        
        const organicStat = statItems[1].querySelector('.stat-number');
        if (organicStat) {
            organicStat.textContent = `${organicPercentage}%`;
        }
        
        // Quality steps remain the same
        // statItems[2] keeps its original value
    }
}

// Enhanced modal functionality
async function openCertificateModal(certificateId) {
    try {
        // Fetch detailed certificate data
        const certificate = await CertificatesAPI.getById(certificateId);
        
        if (certificate) {
            populateCertificateModal(certificate);
            
            // Show the modal
            const modal = document.querySelector('.certificate-modal');
            if (modal) {
                modal.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading certificate details:', error);
        // Fallback to basic modal functionality
        showBasicCertificateModal();
    }
}

function populateCertificateModal(certificate) {
    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = certificate.title;
    }
    
    // Update modal badge
    const modalBadge = document.getElementById('modal-badge');
    if (modalBadge) {
        modalBadge.textContent = getBadgeText(certificate.category);
        modalBadge.className = `modal-badge ${getCertificateStatusClass(certificate)}`;
    }
    
    // Update modal image
    const modalImage = document.getElementById('modal-image');
    if (modalImage) {
        modalImage.src = certificate.image.url;
        modalImage.alt = certificate.title;
    }
    
    // Update modal description
    const modalDescription = document.getElementById('modal-description');
    if (modalDescription) {
        modalDescription.textContent = certificate.description;
    }
    
    // Update modal date information
    const modalDate = document.getElementById('modal-date');
    if (modalDate) {
        const issueDate = formatDate(certificate.issue_date);
        const expiryDate = certificate.expiry_date ? formatDate(certificate.expiry_date) : 'No expiry';
        
        modalDate.innerHTML = `
            <strong>Issue Date:</strong> ${issueDate}<br>
            <strong>Valid Until:</strong> ${expiryDate}
            ${certificate.certificate_number ? `<br><strong>Certificate Number:</strong> ${certificate.certificate_number}` : ''}
            ${certificate.issuer?.name ? `<br><strong>Issued By:</strong> ${certificate.issuer.name}` : ''}
        `;
    }
    
    // Update modal actions
    updateModalActions(certificate);
}

function updateModalActions(certificate) {
    const downloadBtn = document.querySelector('.download-cert');
    const verifyBtn = document.querySelector('.verify-cert');
    
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadCertificate(certificate);
    }
    
    if (verifyBtn) {
        if (certificate.verification?.verification_url) {
            verifyBtn.onclick = () => window.open(certificate.verification.verification_url, '_blank');
            verifyBtn.style.display = 'inline-block';
        } else {
            verifyBtn.style.display = 'none';
        }
    }
}

function downloadCertificate(certificate) {
    // Create a temporary link to download the certificate image
    const link = document.createElement('a');
    link.href = certificate.image.url;
    link.download = `${certificate.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showBasicCertificateModal() {
    // Fallback modal functionality
    const modal = document.querySelector('.certificate-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Add CSS for new status indicators
const additionalCSS = `
    .certificate-badge.expired {
        background-color: #dc3545;
        color: white;
    }
    
    .certificate-badge.expiring {
        background-color: #ffc107;
        color: #212529;
    }
    
    .certificate-badge.valid {
        background-color: #28a745;
        color: white;
    }
    
    .verification-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #d4edda;
        color: #155724;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin: 10px 0;
    }
    
    .status-indicator {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin: 5px 0;
        display: inline-block;
    }
    
    .status-indicator.expired {
        background: #f8d7da;
        color: #721c24;
    }
    
    .status-indicator.expiring {
        background: #fff3cd;
        color: #856404;
    }
    
    .certificate-card {
        position: relative;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .certificate-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .loading-certificates {
        text-align: center;
        padding: 40px;
        color: #666;
    }
    
    .loading-certificates i {
        font-size: 2em;
        margin-bottom: 10px;
        animation: spin 1s linear infinite;
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
window.openCertificateModal = openCertificateModal;
window.loadCertificatesFromAPI = loadCertificatesFromAPI;
window.updateCertificatesGrid = updateCertificatesGrid;