// Dynamic Team Loading
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Loading team dynamically...');
    
    try {
        // Check if API is available
        const isApiAvailable = await checkApiAvailability();
        
        if (isApiAvailable) {
            await loadTeamFromAPI();
        } else {
            console.warn('API not available, using static content');
            // Initialize with sample data
            initializeSampleTeamData();
        }
        
        // Initialize filter functionality after loading data
        initializeTeamFilters();
        
    } catch (error) {
        console.error('Error loading team:', error);
        // Initialize with sample data as fallback
        initializeSampleTeamData();
        initializeTeamFilters();
    }
});

async function loadTeamFromAPI() {
    try {
        // Show loading states
        showTeamLoading();
        
        // Fetch team data from API
        const [allTeam, managementTeam, teamStats] = await Promise.all([
            TeamAPI.getAll(),
            TeamAPI.getManagement(),
            TeamAPI.getStats().catch(() => null) // Stats might not be available
        ]);
        
        if (allTeam && allTeam.length > 0) {
            // Update team grids
            updateManagementGrid(managementTeam || []);
            updateTeamGrid(allTeam);
            
            // Update statistics
            updateTeamStats(teamStats, allTeam);
            
            // Update filter buttons based on available departments
            updateFilterButtons(allTeam);
            
            console.log(`Loaded ${allTeam.length} team members from API`);
        } else {
            // Show empty state
            showEmptyTeam();
        }
    } catch (error) {
        console.error('Failed to load team from API:', error);
        showTeamError();
        throw error;
    }
}

function showTeamLoading() {
    const managementGrid = document.getElementById('management-grid');
    const teamGrid = document.getElementById('team-grid');
    
    if (managementGrid) {
        managementGrid.innerHTML = `
            <div class="loading-team">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading management team...</p>
            </div>
        `;
    }
    
    if (teamGrid) {
        teamGrid.innerHTML = `
            <div class="loading-team">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading team members...</p>
            </div>
        `;
    }
}

function showEmptyTeam() {
    const managementGrid = document.getElementById('management-grid');
    const teamGrid = document.getElementById('team-grid');
    
    if (managementGrid) {
        managementGrid.innerHTML = `
            <div class="empty-team">
                <i class="fas fa-users"></i>
                <p>No management team members found.</p>
            </div>
        `;
    }
    
    if (teamGrid) {
        teamGrid.innerHTML = `
            <div class="empty-team">
                <i class="fas fa-users"></i>
                <p>No team members found.</p>
            </div>
        `;
    }
}

function showTeamError() {
    const managementGrid = document.getElementById('management-grid');
    const teamGrid = document.getElementById('team-grid');
    
    if (managementGrid) {
        managementGrid.innerHTML = `
            <div class="error-team">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load management team. Please try again later.</p>
                <button onclick="loadTeamFromAPI()" class="retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
    
    if (teamGrid) {
        teamGrid.innerHTML = `
            <div class="error-team">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load team members. Please try again later.</p>
                <button onclick="loadTeamFromAPI()" class="retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

function updateManagementGrid(managementTeam) {
    const managementGrid = document.getElementById('management-grid');
    if (!managementGrid) return;
    
    // Clear existing content
    managementGrid.innerHTML = '';
    
    if (managementTeam.length === 0) {
        managementGrid.innerHTML = `
            <div class="empty-team">
                <i class="fas fa-users"></i>
                <p>No management team members found.</p>
            </div>
        `;
        return;
    }
    
    // Add management team members
    managementTeam.forEach((member, index) => {
        const memberCard = createTeamMemberCard(member, index, true);
        managementGrid.appendChild(memberCard);
    });
    
    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function updateTeamGrid(teamMembers) {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;
    
    // Clear existing content
    teamGrid.innerHTML = '';
    
    if (teamMembers.length === 0) {
        teamGrid.innerHTML = `
            <div class="empty-team">
                <i class="fas fa-users"></i>
                <p>No team members found.</p>
            </div>
        `;
        return;
    }
    
    // Add all team members
    teamMembers.forEach((member, index) => {
        const memberCard = createTeamMemberCard(member, index, false);
        teamGrid.appendChild(memberCard);
    });
    
    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function createTeamMemberCard(member, index, isManagement = false) {
    const card = document.createElement('div');
    card.className = isManagement ? 'management-card' : 'team-member-card';
    card.setAttribute('data-department', member.department);
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index * 100).toString());
    
    // Add featured class if member is featured
    if (member.featured) {
        card.classList.add('featured');
    }
    
    // Calculate years of service
    const yearsOfService = calculateYearsOfService(member.join_date);
    const experienceText = member.experience?.years 
        ? `${member.experience.years} years experience`
        : yearsOfService > 0 
        ? `${yearsOfService} years with us`
        : 'New team member';
    
    card.innerHTML = `
        <div class="team-member-image">
            <img src="${member.image.url}" alt="${member.name}" 
                 onerror="this.src='assets/images/team-placeholder.jpg'"
                 loading="lazy">
            <div class="department-badge">${formatDepartment(member.department)}</div>
        </div>
        <div class="team-member-content">
            <h3 class="team-member-name">${member.name}</h3>
            <p class="team-member-position">${member.position}</p>
            <p class="team-member-bio">${member.bio || 'Dedicated team member contributing to HerbaCure\'s mission.'}</p>
            <div class="team-member-meta">
                <span class="experience-badge">${experienceText}</span>
                <div class="social-links">
                    ${member.contact?.email ? `<a href="mailto:${member.contact.email}" class="social-link" title="Email"><i class="fas fa-envelope"></i></a>` : ''}
                    ${member.social_media?.linkedin ? `<a href="${member.social_media.linkedin}" class="social-link" title="LinkedIn" target="_blank"><i class="fab fa-linkedin"></i></a>` : ''}
                    ${member.social_media?.twitter ? `<a href="${member.social_media.twitter}" class="social-link" title="Twitter" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', () => openTeamMemberModal(member));
    
    return card;
}

function updateTeamStats(stats, allTeam) {
    const statsContainer = document.getElementById('team-stats');
    if (!statsContainer) return;
    
    const statItems = statsContainer.querySelectorAll('.stat-item');
    
    if (statItems.length >= 3) {
        // Update team members count
        const memberCount = statItems[0].querySelector('.stat-number');
        if (memberCount) {
            memberCount.textContent = `${allTeam.length}+`;
        }
        
        // Calculate total experience
        const totalExperience = allTeam.reduce((sum, member) => {
            const experience = member.experience?.years || calculateYearsOfService(member.join_date);
            return sum + experience;
        }, 0);
        
        const experienceCount = statItems[1].querySelector('.stat-number');
        if (experienceCount) {
            experienceCount.textContent = `${totalExperience}+`;
        }
        
        // Calculate unique departments
        const departments = [...new Set(allTeam.map(member => member.department))];
        const departmentCount = statItems[2].querySelector('.stat-number');
        if (departmentCount) {
            departmentCount.textContent = departments.length.toString();
        }
    }
}

function updateFilterButtons(teamMembers) {
    const filterButtons = document.querySelector('.filter-buttons');
    if (!filterButtons) return;
    
    // Get unique departments from team members
    const departments = [...new Set(teamMembers.map(member => member.department))];
    
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
        allBtn.textContent = 'All Team';
        filterButtons.appendChild(allBtn);
    }
    
    // Add department buttons
    departments.forEach(department => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', department);
        button.textContent = formatDepartment(department);
        filterButtons.appendChild(button);
    });
}

function initializeTeamFilters() {
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

// Enhanced modal functionality
function openTeamMemberModal(member) {
    const modal = document.querySelector('.team-modal');
    if (!modal) return;
    
    // Update modal content
    populateTeamModal(member);
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function populateTeamModal(member) {
    // Update basic info
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalPosition = document.getElementById('modal-position');
    const modalDepartment = document.getElementById('modal-department');
    const modalExperience = document.getElementById('modal-experience');
    const modalBio = document.getElementById('modal-bio');
    
    if (modalImage) {
        modalImage.src = member.image.url;
        modalImage.alt = member.name;
    }
    
    if (modalName) modalName.textContent = member.name;
    if (modalPosition) modalPosition.textContent = member.position;
    if (modalDepartment) modalDepartment.textContent = formatDepartment(member.department);
    
    if (modalExperience) {
        const yearsOfService = calculateYearsOfService(member.join_date);
        const joinDate = formatDate(member.join_date);
        modalExperience.innerHTML = `
            ${member.experience?.years ? `${member.experience.years} years of experience` : ''}
            ${yearsOfService > 0 ? `<br>${yearsOfService} years with HerbaCure` : ''}
            ${joinDate ? `<br>Joined: ${joinDate}` : ''}
        `;
    }
    
    if (modalBio) {
        modalBio.textContent = member.bio || 'A dedicated team member contributing to HerbaCure\'s mission of providing premium natural health solutions.';
    }
    
    // Update qualifications
    updateModalQualifications(member.qualifications);
    
    // Update specializations
    updateModalSpecializations(member.specializations);
    
    // Update languages
    updateModalLanguages(member.languages);
    
    // Update contact info
    updateModalContact(member.contact);
    
    // Update social media
    updateModalSocial(member.social_media);
}

function updateModalQualifications(qualifications) {
    const section = document.getElementById('modal-qualifications-section');
    const container = document.getElementById('modal-qualifications');
    
    if (!qualifications || qualifications.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = qualifications.map(qual => `
        <div class="qualification-item">
            <h5>${qual.degree}</h5>
            <p>${qual.institution}${qual.year ? ` (${qual.year})` : ''}</p>
        </div>
    `).join('');
}

function updateModalSpecializations(specializations) {
    const section = document.getElementById('modal-specializations-section');
    const container = document.getElementById('modal-specializations');
    
    if (!specializations || specializations.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = `
        <div class="specialization-tags">
            ${specializations.map(spec => `<span class="specialization-tag">${spec}</span>`).join('')}
        </div>
    `;
}

function updateModalLanguages(languages) {
    const section = document.getElementById('modal-languages-section');
    const container = document.getElementById('modal-languages');
    
    if (!languages || languages.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = languages.map(lang => `
        <div class="language-item">
            <span>${lang.language}</span>
            <span class="language-proficiency">${lang.proficiency}</span>
        </div>
    `).join('');
}

function updateModalContact(contact) {
    const section = document.getElementById('modal-contact-section');
    const container = document.getElementById('modal-contact');
    
    if (!contact || (!contact.email && !contact.phone)) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    let contactHTML = '';
    
    if (contact.email) {
        contactHTML += `
            <p><i class="fas fa-envelope"></i> <a href="mailto:${contact.email}">${contact.email}</a></p>
        `;
    }
    
    if (contact.phone) {
        const phoneText = contact.extension ? `${contact.phone} ext. ${contact.extension}` : contact.phone;
        contactHTML += `
            <p><i class="fas fa-phone"></i> <a href="tel:${contact.phone}">${phoneText}</a></p>
        `;
    }
    
    container.innerHTML = contactHTML;
}

function updateModalSocial(socialMedia) {
    const section = document.getElementById('modal-social-section');
    const container = document.getElementById('modal-social');
    
    if (!socialMedia || (!socialMedia.linkedin && !socialMedia.twitter)) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    let socialHTML = '';
    
    if (socialMedia.linkedin) {
        socialHTML += `
            <a href="${socialMedia.linkedin}" target="_blank" title="LinkedIn">
                <i class="fab fa-linkedin"></i>
            </a>
        `;
    }
    
    if (socialMedia.twitter) {
        socialHTML += `
            <a href="${socialMedia.twitter}" target="_blank" title="Twitter">
                <i class="fab fa-twitter"></i>
            </a>
        `;
    }
    
    container.innerHTML = socialHTML;
}

function initializeSampleTeamData() {
    // Create sample team data for demonstration
    const sampleTeam = [
        {
            _id: '1',
            name: 'Dr. Sarah Johnson',
            position: 'Chief Executive Officer',
            department: 'management',
            bio: 'With over 15 years of experience in herbal medicine and business leadership, Dr. Johnson founded HerbaCure with a vision to make natural health solutions accessible to everyone.',
            image: { url: 'assets/images/team1.jpg' },
            contact: { email: 'sarah.johnson@herbacure.com' },
            experience: { years: 15 },
            join_date: '2010-01-15',
            featured: true,
            specializations: ['Herbal Medicine', 'Business Strategy', 'Product Development'],
            qualifications: [
                { degree: 'PhD in Herbal Medicine', institution: 'University of Natural Health', year: 2008 },
                { degree: 'MBA', institution: 'Business School', year: 2005 }
            ]
        },
        {
            _id: '2',
            name: 'Michael Chen',
            position: 'Head of Production',
            department: 'production',
            bio: 'Michael oversees all production processes, ensuring that every HerbaCure product meets our strict quality standards while maintaining efficiency and sustainability.',
            image: { url: 'assets/images/team2.jpg' },
            contact: { email: 'michael.chen@herbacure.com' },
            experience: { years: 12 },
            join_date: '2012-03-20',
            featured: true,
            specializations: ['Production Management', 'Quality Control', 'Process Optimization']
        },
        {
            _id: '3',
            name: 'Dr. Amina Patel',
            position: 'Research Director',
            department: 'research',
            bio: 'Dr. Patel leads our research team in developing innovative herbal formulations and ensuring the scientific validity of our products.',
            image: { url: 'assets/images/team3.jpg' },
            contact: { email: 'amina.patel@herbacure.com' },
            experience: { years: 10 },
            join_date: '2014-06-10',
            featured: true,
            specializations: ['Herbal Research', 'Product Development', 'Clinical Studies']
        }
    ];
    
    // Update grids with sample data
    updateManagementGrid(sampleTeam.filter(member => member.department === 'management'));
    updateTeamGrid(sampleTeam);
    updateTeamStats(null, sampleTeam);
    updateFilterButtons(sampleTeam);
}

// Add CSS for new team features
const additionalCSS = `
    .team-member-card {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .team-member-card:hover {
        transform: translateY(-5px);
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
`;

// Add the additional CSS to the page
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Make functions globally available
window.loadTeamFromAPI = loadTeamFromAPI;
window.updateTeamGrid = updateTeamGrid;
window.openTeamMemberModal = openTeamMemberModal;
window.filterTeamMembers = filterTeamMembers;