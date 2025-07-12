// Team Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Team page initializing...');
    
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
    
    // Initialize team page functionality
    initializeTeamPage();
});

function initializeTeamPage() {
    // Initialize filter functionality
    initializeFilters();
    
    // Initialize modal functionality
    initializeModal();
    
    // Initialize mobile menu
    initializeMobileMenu();
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter team members
            filterTeamMembers(filter);
        });
    });
}

function filterTeamMembers(filter) {
    const teamCards = document.querySelectorAll('.team-member-card');
    
    teamCards.forEach(card => {
        const department = card.getAttribute('data-department');
        
        if (filter === 'all' || department === filter) {
            card.style.display = 'block';
            card.style.opacity = '0';
            
            // Animate in
            setTimeout(() => {
                card.style.opacity = '1';
            }, 50);
        } else {
            card.style.opacity = '0';
            
            // Hide after animation
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function initializeModal() {
    const modal = document.querySelector('.team-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    // Close modal when clicking close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTeamModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeTeamModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeTeamModal();
        }
    });
}

function openTeamModal(memberId) {
    const modal = document.querySelector('.team-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeTeamModal() {
    const modal = document.querySelector('.team-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function initializeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// Utility functions
function formatDepartment(department) {
    const departmentMap = {
        'management': 'Management',
        'research': 'Research & Development',
        'production': 'Production',
        'quality': 'Quality Control',
        'sales': 'Sales',
        'marketing': 'Marketing',
        'hr': 'Human Resources',
        'finance': 'Finance',
        'it': 'Information Technology'
    };
    
    return departmentMap[department] || department.charAt(0).toUpperCase() + department.slice(1);
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    } catch (error) {
        return dateString;
    }
}

function calculateYearsOfService(joinDate) {
    if (!joinDate) return 0;
    
    const today = new Date();
    const join = new Date(joinDate);
    const diffTime = today - join;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
}

// Make functions globally available
window.openTeamModal = openTeamModal;
window.closeTeamModal = closeTeamModal;
window.filterTeamMembers = filterTeamMembers;
window.formatDepartment = formatDepartment;
window.formatDate = formatDate;
window.calculateYearsOfService = calculateYearsOfService;