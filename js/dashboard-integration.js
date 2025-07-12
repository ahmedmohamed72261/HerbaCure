// Dashboard Integration with Frontend Pages
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard integration initializing...');
    
    // Add integration features to the dashboard
    initializeDashboardIntegration();
});

function initializeDashboardIntegration() {
    // Add preview buttons to each section
    addPreviewButtons();
    
    // Add sync status indicators
    addSyncStatusIndicators();
    
    // Add quick actions
    addQuickActions();
    
    // Initialize real-time updates
    initializeRealTimeUpdates();
}

function addPreviewButtons() {
    // Add preview button to certificates section
    const certificatesHeader = document.querySelector('#certificates-tab .tab-header');
    if (certificatesHeader) {
        const previewBtn = createPreviewButton('certificates.html', 'View Certificates Page');
        certificatesHeader.querySelector('.tab-actions').appendChild(previewBtn);
    }
    
    // Add preview button to gallery section
    const galleryHeader = document.querySelector('#gallery-tab .tab-header');
    if (galleryHeader) {
        const previewBtn = createPreviewButton('gallery.html', 'View Gallery Page');
        galleryHeader.querySelector('.tab-actions').appendChild(previewBtn);
    }
}

function createPreviewButton(url, title) {
    const button = document.createElement('button');
    button.className = 'preview-btn';
    button.title = title;
    button.innerHTML = '<i class="fas fa-external-link-alt"></i> Preview';
    button.onclick = () => window.open(url, '_blank');
    return button;
}

function addSyncStatusIndicators() {
    // Add sync status to each tab header
    const tabHeaders = document.querySelectorAll('.tab-header h2');
    
    tabHeaders.forEach(header => {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'sync-status';
        statusIndicator.innerHTML = '<i class="fas fa-circle"></i> <span>Checking...</span>';
        header.appendChild(statusIndicator);
    });
    
    // Update sync status
    updateSyncStatus();
}

async function updateSyncStatus() {
    try {
        const isApiAvailable = await checkApiAvailability();
        const statusIndicators = document.querySelectorAll('.sync-status');
        
        statusIndicators.forEach(indicator => {
            if (isApiAvailable) {
                indicator.className = 'sync-status online';
                indicator.innerHTML = '<i class="fas fa-circle"></i> <span>Online</span>';
            } else {
                indicator.className = 'sync-status offline';
                indicator.innerHTML = '<i class="fas fa-circle"></i> <span>Offline</span>';
            }
        });
    } catch (error) {
        console.error('Error updating sync status:', error);
    }
}

function addQuickActions() {
    // Add quick actions panel
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;
    
    const quickActionsPanel = document.createElement('div');
    quickActionsPanel.className = 'quick-actions-panel';
    quickActionsPanel.innerHTML = `
        <div class="quick-actions-header">
            <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
            <button class="toggle-panel" onclick="toggleQuickActions()">
                <i class="fas fa-chevron-up"></i>
            </button>
        </div>
        <div class="quick-actions-content">
            <div class="quick-action-group">
                <h4>Frontend Integration</h4>
                <button class="quick-action-btn" onclick="syncAllData()">
                    <i class="fas fa-sync"></i> Sync All Data
                </button>
                <button class="quick-action-btn" onclick="previewWebsite()">
                    <i class="fas fa-globe"></i> Preview Website
                </button>
                <button class="quick-action-btn" onclick="checkFrontendStatus()">
                    <i class="fas fa-heartbeat"></i> Check Status
                </button>
            </div>
            <div class="quick-action-group">
                <h4>Content Management</h4>
                <button class="quick-action-btn" onclick="bulkUpload()">
                    <i class="fas fa-upload"></i> Bulk Upload
                </button>
                <button class="quick-action-btn" onclick="exportData()">
                    <i class="fas fa-download"></i> Export Data
                </button>
                <button class="quick-action-btn" onclick="importData()">
                    <i class="fas fa-file-import"></i> Import Data
                </button>
            </div>
        </div>
    `;
    
    // Insert at the top of dashboard content
    dashboardContent.insertBefore(quickActionsPanel, dashboardContent.firstChild);
}

function toggleQuickActions() {
    const panel = document.querySelector('.quick-actions-panel');
    const content = panel.querySelector('.quick-actions-content');
    const toggleBtn = panel.querySelector('.toggle-panel i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleBtn.className = 'fas fa-chevron-up';
    } else {
        content.style.display = 'none';
        toggleBtn.className = 'fas fa-chevron-down';
    }
}

async function syncAllData() {
    const syncBtn = document.querySelector('[onclick="syncAllData()"]');
    const originalText = syncBtn.innerHTML;
    
    syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    syncBtn.disabled = true;
    
    try {
        // Refresh all data
        await refreshAllData();
        
        // Update sync status
        await updateSyncStatus();
        
        showNotification('All data synced successfully!', 'success');
    } catch (error) {
        console.error('Error syncing data:', error);
        showNotification('Failed to sync data. Please try again.', 'error');
    } finally {
        syncBtn.innerHTML = originalText;
        syncBtn.disabled = false;
    }
}

function previewWebsite() {
    // Open main website in new tab
    window.open('index.html', '_blank');
}

async function checkFrontendStatus() {
    const statusBtn = document.querySelector('[onclick="checkFrontendStatus()"]');
    const originalText = statusBtn.innerHTML;
    
    statusBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    statusBtn.disabled = true;
    
    try {
        const isApiAvailable = await checkApiAvailability();
        
        if (isApiAvailable) {
            showNotification('Backend API is online and responding!', 'success');
        } else {
            showNotification('Backend API is offline. Using local data.', 'warning');
        }
        
        // Update sync status
        await updateSyncStatus();
        
    } catch (error) {
        console.error('Error checking status:', error);
        showNotification('Failed to check status.', 'error');
    } finally {
        statusBtn.innerHTML = originalText;
        statusBtn.disabled = false;
    }
}

function bulkUpload() {
    // Create bulk upload modal
    const modal = createBulkUploadModal();
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function createBulkUploadModal() {
    const modal = document.createElement('div');
    modal.className = 'modal bulk-upload-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeBulkUploadModal()">&times;</span>
            <h2>Bulk Upload</h2>
            <div class="bulk-upload-tabs">
                <button class="bulk-tab active" data-type="images">Images</button>
                <button class="bulk-tab" data-type="certificates">Certificates</button>
                <button class="bulk-tab" data-type="gallery">Gallery Items</button>
            </div>
            <div class="bulk-upload-content">
                <div class="file-drop-zone" id="bulk-drop-zone">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop files here or click to select</p>
                    <input type="file" id="bulk-file-input" multiple accept="image/*" style="display: none;">
                </div>
                <div class="upload-progress" id="bulk-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p class="progress-text">Uploading...</p>
                </div>
                <div class="upload-results" id="bulk-results"></div>
            </div>
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="closeBulkUploadModal()">Cancel</button>
                <button type="button" class="save-btn" onclick="startBulkUpload()">Upload</button>
            </div>
        </div>
    `;
    
    // Initialize bulk upload functionality
    initializeBulkUpload(modal);
    
    return modal;
}

function initializeBulkUpload(modal) {
    const dropZone = modal.querySelector('#bulk-drop-zone');
    const fileInput = modal.querySelector('#bulk-file-input');
    const tabs = modal.querySelectorAll('.bulk-tab');
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // File drop functionality
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleBulkFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleBulkFiles(e.target.files);
    });
}

function handleBulkFiles(files) {
    const resultsDiv = document.getElementById('bulk-results');
    resultsDiv.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <i class="fas fa-file-image"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <span class="file-status">Ready</span>
        `;
        resultsDiv.appendChild(fileItem);
    });
}

async function startBulkUpload() {
    const fileInput = document.getElementById('bulk-file-input');
    const progressDiv = document.getElementById('bulk-progress');
    const progressFill = progressDiv.querySelector('.progress-fill');
    const progressText = progressDiv.querySelector('.progress-text');
    
    if (!fileInput.files.length) {
        showNotification('Please select files to upload.', 'warning');
        return;
    }
    
    progressDiv.style.display = 'block';
    
    try {
        const files = Array.from(fileInput.files);
        let uploaded = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            progressText.textContent = `Uploading ${file.name}...`;
            
            try {
                await UploadAPI.uploadImage(file);
                uploaded++;
                
                // Update file status
                const fileItems = document.querySelectorAll('.file-item');
                if (fileItems[i]) {
                    fileItems[i].querySelector('.file-status').textContent = 'Uploaded';
                    fileItems[i].classList.add('uploaded');
                }
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                
                // Update file status
                const fileItems = document.querySelectorAll('.file-item');
                if (fileItems[i]) {
                    fileItems[i].querySelector('.file-status').textContent = 'Failed';
                    fileItems[i].classList.add('failed');
                }
            }
            
            // Update progress
            const progress = ((i + 1) / files.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        progressText.textContent = `Completed: ${uploaded}/${files.length} files uploaded`;
        showNotification(`Bulk upload completed: ${uploaded}/${files.length} files uploaded`, 'success');
        
    } catch (error) {
        console.error('Bulk upload error:', error);
        showNotification('Bulk upload failed. Please try again.', 'error');
    }
}

function closeBulkUploadModal() {
    const modal = document.querySelector('.bulk-upload-modal');
    if (modal) {
        modal.remove();
    }
}

function exportData() {
    // Create export modal
    const modal = createExportModal();
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function createExportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal export-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeExportModal()">&times;</span>
            <h2>Export Data</h2>
            <div class="export-options">
                <label>
                    <input type="checkbox" value="certificates" checked> Certificates
                </label>
                <label>
                    <input type="checkbox" value="gallery" checked> Gallery Items
                </label>
                <label>
                    <input type="checkbox" value="products"> Products
                </label>
                <label>
                    <input type="checkbox" value="team"> Team Members
                </label>
            </div>
            <div class="export-format">
                <label>Export Format:</label>
                <select id="export-format">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="closeExportModal()">Cancel</button>
                <button type="button" class="save-btn" onclick="performExport()">Export</button>
            </div>
        </div>
    `;
    
    return modal;
}

async function performExport() {
    const checkboxes = document.querySelectorAll('.export-options input[type="checkbox"]:checked');
    const format = document.getElementById('export-format').value;
    
    if (checkboxes.length === 0) {
        showNotification('Please select at least one data type to export.', 'warning');
        return;
    }
    
    try {
        const exportData = {};
        
        for (const checkbox of checkboxes) {
            const type = checkbox.value;
            
            switch (type) {
                case 'certificates':
                    exportData.certificates = await CertificatesAPI.getAll();
                    break;
                case 'gallery':
                    exportData.gallery = await GalleryAPI.getAll();
                    break;
                case 'products':
                    exportData.products = await ProductsAPI.getAll();
                    break;
                case 'team':
                    exportData.team = await TeamAPI.getAll();
                    break;
            }
        }
        
        // Download the data
        downloadData(exportData, format);
        
        showNotification('Data exported successfully!', 'success');
        closeExportModal();
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data. Please try again.', 'error');
    }
}

function downloadData(data, format) {
    let content, filename, mimeType;
    
    if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `herbacure_data_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
    } else if (format === 'csv') {
        content = convertToCSV(data);
        filename = `herbacure_data_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    // Simple CSV conversion - can be enhanced
    let csv = '';
    
    Object.keys(data).forEach(key => {
        csv += `\n\n${key.toUpperCase()}\n`;
        
        if (data[key].length > 0) {
            const headers = Object.keys(data[key][0]);
            csv += headers.join(',') + '\n';
            
            data[key].forEach(item => {
                const values = headers.map(header => {
                    const value = item[header];
                    return typeof value === 'object' ? JSON.stringify(value) : value;
                });
                csv += values.join(',') + '\n';
            });
        }
    });
    
    return csv;
}

function closeExportModal() {
    const modal = document.querySelector('.export-modal');
    if (modal) {
        modal.remove();
    }
}

function importData() {
    showNotification('Import functionality coming soon!', 'info');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initializeRealTimeUpdates() {
    // Check for updates every 30 seconds
    setInterval(async () => {
        try {
            await updateSyncStatus();
        } catch (error) {
            console.error('Error in real-time update:', error);
        }
    }, 30000);
}

// Add CSS for integration features
const integrationCSS = `
    .preview-btn {
        background: #17a2b8;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-left: 10px;
        transition: background 0.3s ease;
    }
    
    .preview-btn:hover {
        background: #138496;
    }
    
    .sync-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-left: 15px;
        font-size: 12px;
        font-weight: normal;
    }
    
    .sync-status.online {
        color: #28a745;
    }
    
    .sync-status.offline {
        color: #dc3545;
    }
    
    .sync-status i {
        font-size: 8px;
    }
    
    .quick-actions-panel {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        overflow: hidden;
    }
    
    .quick-actions-header {
        background: #f8f9fa;
        padding: 15px 20px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .quick-actions-header h3 {
        margin: 0;
        color: #495057;
        font-size: 16px;
    }
    
    .toggle-panel {
        background: none;
        border: none;
        cursor: pointer;
        color: #6c757d;
        font-size: 14px;
    }
    
    .quick-actions-content {
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }
    
    .quick-action-group h4 {
        margin: 0 0 15px 0;
        color: #495057;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .quick-action-btn {
        display: block;
        width: 100%;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        padding: 12px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        text-align: left;
    }
    
    .quick-action-btn:hover {
        background: #e9ecef;
        border-color: #adb5bd;
    }
    
    .quick-action-btn i {
        margin-right: 8px;
        width: 16px;
    }
    
    .bulk-upload-modal .modal-content {
        max-width: 600px;
    }
    
    .bulk-upload-tabs {
        display: flex;
        border-bottom: 1px solid #dee2e6;
        margin-bottom: 20px;
    }
    
    .bulk-tab {
        flex: 1;
        padding: 12px;
        background: none;
        border: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.3s ease;
    }
    
    .bulk-tab.active {
        border-bottom-color: #2c5530;
        color: #2c5530;
        font-weight: 600;
    }
    
    .file-drop-zone {
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;
    }
    
    .file-drop-zone:hover,
    .file-drop-zone.dragover {
        border-color: #2c5530;
        background: #f8f9fa;
    }
    
    .file-drop-zone i {
        font-size: 3em;
        color: #6c757d;
        margin-bottom: 15px;
        display: block;
    }
    
    .upload-progress {
        margin: 20px 0;
    }
    
    .progress-bar {
        background: #e9ecef;
        border-radius: 4px;
        height: 8px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .progress-fill {
        background: #2c5530;
        height: 100%;
        width: 0%;
        transition: width 0.3s ease;
    }
    
    .file-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border-bottom: 1px solid #f1f3f4;
    }
    
    .file-item.uploaded {
        background: #d4edda;
    }
    
    .file-item.failed {
        background: #f8d7da;
    }
    
    .file-name {
        flex: 1;
    }
    
    .file-size,
    .file-status {
        font-size: 12px;
        color: #6c757d;
    }
    
    .export-options {
        margin: 20px 0;
    }
    
    .export-options label {
        display: block;
        margin-bottom: 10px;
        cursor: pointer;
    }
    
    .export-format {
        margin: 20px 0;
    }
    
    .export-format label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
    }
    
    .export-format select {
        width: 100%;
        padding: 8px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
    }
`;

// Add the integration CSS to the page
const style = document.createElement('style');
style.textContent = integrationCSS;
document.head.appendChild(style);

// Make functions globally available
window.toggleQuickActions = toggleQuickActions;
window.syncAllData = syncAllData;
window.previewWebsite = previewWebsite;
window.checkFrontendStatus = checkFrontendStatus;
window.bulkUpload = bulkUpload;
window.exportData = exportData;
window.importData = importData;
window.closeBulkUploadModal = closeBulkUploadModal;
window.startBulkUpload = startBulkUpload;
window.closeExportModal = closeExportModal;
window.performExport = performExport;