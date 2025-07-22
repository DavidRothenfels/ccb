// Initialize PocketBase
const pb = new PocketBase('http://localhost:8091');

// State management
const state = {
    currentUser: null,
    currentProject: null,
    templates: [],
    projects: [],
    documents: [],
    comments: []
};

// DOM Elements
const screens = {
    login: document.getElementById('loginScreen'),
    dashboard: document.getElementById('dashboardScreen'),
    projectEdit: document.getElementById('projectEditScreen')
};

const sections = {
    projects: document.getElementById('projectsSection'),
    templates: document.getElementById('templatesSection'),
    admin: document.getElementById('adminSection')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (pb.authStore.isValid) {
        state.currentUser = pb.authStore.model;
        showDashboard();
    } else {
        showLogin();
    }
    
    // Setup event listeners
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // New project button
    document.getElementById('newProjectBtn').addEventListener('click', handleNewProject);
    
    // Back to dashboard
    document.getElementById('backToDashboard').addEventListener('click', showDashboard);
    
    // Project form
    document.getElementById('projectForm').addEventListener('submit', handleProjectSave);
    
    // Export to API
    document.getElementById('exportToApi').addEventListener('click', handleApiExport);
    
    // Comment modal
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeCommentModal);
    });
    
    document.getElementById('commentForm').addEventListener('submit', handleCommentSave);
    
    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleAdminTab);
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const authData = await pb.collection('users').authWithPassword(
            formData.get('email'),
            formData.get('password')
        );
        
        state.currentUser = authData.record;
        showDashboard();
    } catch (error) {
        alert('Anmeldung fehlgeschlagen: ' + error.message);
    }
}

function handleLogout() {
    pb.authStore.clear();
    state.currentUser = null;
    showLogin();
}

// Screen Navigation
function showLogin() {
    hideAllScreens();
    screens.login.classList.add('active');
}

function showDashboard() {
    hideAllScreens();
    screens.dashboard.classList.add('active');
    
    // Update user info
    document.getElementById('userEmail').textContent = state.currentUser.email;
    
    // Show/hide admin navigation
    const isAdmin = state.currentUser.user_type === 'admin';
    document.getElementById('adminNavItem').style.display = isAdmin ? 'block' : 'none';
    
    // Load initial data
    loadProjects();
    loadTemplates();
}

function showProjectEdit(projectId = null) {
    hideAllScreens();
    screens.projectEdit.classList.add('active');
    
    if (projectId) {
        loadProject(projectId);
    } else {
        // New project
        state.currentProject = null;
        document.getElementById('projectForm').reset();
        loadDynamicFields();
    }
}

function hideAllScreens() {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    const section = e.target.dataset.section;
    
    // Update active nav
    document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
    
    // Show section
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[section].classList.add('active');
    
    // Load section-specific data
    if (section === 'admin' && state.currentUser.user_type === 'admin') {
        loadAdminData();
    }
}

// Projects Management
async function loadProjects() {
    try {
        const records = await pb.collection('projects').getList(1, 50, {
            filter: `user = "${state.currentUser.id}"`,
            sort: '-created'
        });
        
        state.projects = records.items;
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects() {
    const container = document.getElementById('projectsList');
    
    if (state.projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Keine Projekte vorhanden</h3>
                <p>Erstellen Sie Ihr erstes Vergabeprojekt</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.projects.map(project => `
        <div class="project-card" onclick="showProjectEdit('${project.id}')">
            <h3>${project.name}</h3>
            <p>${project.description || 'Keine Beschreibung'}</p>
            <div class="project-meta">
                <span>${project.procurement_type}</span>
                <span>${project.threshold_type}</span>
                <span class="status-badge status-${project.status || 'draft'}">
                    ${getStatusLabel(project.status || 'draft')}
                </span>
            </div>
        </div>
    `).join('');
}

function getStatusLabel(status) {
    const labels = {
        'draft': 'Entwurf',
        'in_review': 'In Prüfung',
        'approved': 'Genehmigt',
        'submitted': 'Eingereicht'
    };
    return labels[status] || status;
}

function handleNewProject() {
    showProjectEdit();
}

async function loadProject(projectId) {
    try {
        const project = await pb.collection('projects').getOne(projectId);
        state.currentProject = project;
        
        // Fill form with project data
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('procurementType').value = project.procurement_type;
        document.getElementById('thresholdType').value = project.threshold_type;
        
        // Load dynamic fields with saved data
        loadDynamicFields(project.form_data);
        
        // Load project documents
        loadProjectDocuments(projectId);
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Fehler beim Laden des Projekts');
        showDashboard();
    }
}

async function handleProjectSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Collect dynamic field data
    const dynamicData = {};
    document.querySelectorAll('#dynamicFormFields input, #dynamicFormFields textarea, #dynamicFormFields select').forEach(field => {
        dynamicData[field.name] = field.value;
    });
    
    const projectData = {
        name: formData.get('name'),
        description: formData.get('description'),
        procurement_type: formData.get('procurement_type'),
        threshold_type: formData.get('threshold_type'),
        form_data: dynamicData,
        status: 'draft',
        user: state.currentUser.id
    };
    
    try {
        if (state.currentProject) {
            // Update existing project
            await pb.collection('projects').update(state.currentProject.id, projectData);
            alert('Projekt aktualisiert');
        } else {
            // Create new project
            const project = await pb.collection('projects').create(projectData);
            state.currentProject = project;
            alert('Projekt erstellt');
        }
        
        // Generate documents
        await generateDocuments();
        
    } catch (error) {
        console.error('Error saving project:', error);
        alert('Fehler beim Speichern: ' + error.message);
    }
}

// Templates Management
async function loadTemplates() {
    try {
        const records = await pb.collection('templates').getList(1, 50, {
            filter: 'active = true',
            sort: 'category,name'
        });
        
        state.templates = records.items;
        renderTemplates();
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

function renderTemplates() {
    const container = document.getElementById('templatesList');
    
    if (state.templates.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Keine Vorlagen verfügbar</h3>
                <p>Bitte kontaktieren Sie den Administrator</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.templates.map(template => `
        <div class="template-item">
            <h4>${template.name}
                <span class="template-category">${template.category}</span>
            </h4>
            <p>Datei: ${template.original_filename}</p>
            <p>Felder: ${Object.keys(template.template_fields).length}</p>
        </div>
    `).join('');
}

// Dynamic Form Fields
function loadDynamicFields(savedData = {}) {
    const container = document.getElementById('dynamicFormFields');
    
    // Get all unique fields from templates
    const allFields = {};
    state.templates.forEach(template => {
        Object.entries(template.template_fields).forEach(([key, field]) => {
            if (!allFields[key]) {
                allFields[key] = field;
            }
        });
    });
    
    // Render fields
    container.innerHTML = Object.entries(allFields).map(([key, field]) => {
        const value = savedData[key] || '';
        return renderFormField(key, field, value);
    }).join('');
}

function renderFormField(name, field, value = '') {
    const required = field.required ? 'required' : '';
    
    switch (field.type) {
        case 'textarea':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}</label>
                    <textarea id="${name}" name="${name}" rows="4" ${required}>${value}</textarea>
                </div>
            `;
        case 'email':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}</label>
                    <input type="email" id="${name}" name="${name}" value="${value}" ${required}>
                </div>
            `;
        case 'datetime':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}</label>
                    <input type="datetime-local" id="${name}" name="${name}" value="${value}" ${required}>
                </div>
            `;
        default:
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}</label>
                    <input type="text" id="${name}" name="${name}" value="${value}" ${required}>
                </div>
            `;
    }
}

// Document Generation
async function generateDocuments() {
    if (!state.currentProject) return;
    
    try {
        // Get applicable templates based on project type
        const applicableTemplates = state.templates.filter(template => {
            // Add logic to filter templates based on project type
            return true; // For now, use all templates
        });
        
        // Generate document for each template
        for (const template of applicableTemplates) {
            const documentData = {
                project: state.currentProject.id,
                template: template.id,
                filled_content: fillTemplateContent(template, state.currentProject.form_data),
                version: 1
            };
            
            await pb.collection('documents').create(documentData);
        }
        
        // Reload documents
        loadProjectDocuments(state.currentProject.id);
    } catch (error) {
        console.error('Error generating documents:', error);
    }
}

function fillTemplateContent(template, formData) {
    const content = JSON.parse(JSON.stringify(template.template_content));
    content.filled_data = formData;
    return content;
}

async function loadProjectDocuments(projectId) {
    try {
        const records = await pb.collection('documents').getList(1, 50, {
            filter: `project = "${projectId}"`,
            expand: 'template',
            sort: '-created'
        });
        
        state.documents = records.items;
        renderDocuments();
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function renderDocuments() {
    const container = document.getElementById('documentsList');
    
    if (state.documents.length === 0) {
        container.innerHTML = '<p>Noch keine Dokumente generiert</p>';
        return;
    }
    
    container.innerHTML = state.documents.map(doc => `
        <div class="document-item">
            <div class="document-info">
                <h4>${doc.expand?.template?.name || 'Dokument'}</h4>
                <div class="document-meta">
                    Version ${doc.version} • ${new Date(doc.created).toLocaleDateString('de-DE')}
                </div>
            </div>
            <div class="document-actions">
                <button class="btn btn-small" onclick="downloadDocument('${doc.id}')">
                    Download
                </button>
                ${state.currentUser.user_type === 'admin' ? `
                    <button class="btn btn-small btn-secondary" onclick="openCommentModal('${doc.id}')">
                        Kommentar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Comments
function openCommentModal(documentId) {
    const modal = document.getElementById('commentModal');
    modal.classList.add('active');
    modal.dataset.documentId = documentId;
}

function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    modal.classList.remove('active');
    document.getElementById('commentForm').reset();
}

async function handleCommentSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const modal = document.getElementById('commentModal');
    const documentId = modal.dataset.documentId;
    
    try {
        await pb.collection('comments').create({
            document: documentId,
            author: state.currentUser.id,
            comment_text: formData.get('comment_text'),
            field_reference: formData.get('field_reference'),
            status: formData.get('status')
        });
        
        alert('Kommentar gespeichert');
        closeCommentModal();
    } catch (error) {
        alert('Fehler beim Speichern: ' + error.message);
    }
}

// Admin Functions
function handleAdminTab(e) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const tab = e.target.dataset.tab;
    loadAdminData(tab);
}

async function loadAdminData(tab = 'comments') {
    const container = document.getElementById('adminContent');
    
    if (tab === 'comments') {
        try {
            const comments = await pb.collection('comments').getList(1, 50, {
                expand: 'document,author,document.project',
                sort: '-created'
            });
            
            container.innerHTML = `
                <h3>Alle Kommentare</h3>
                ${comments.items.map(comment => `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-author">${comment.expand?.author?.email || 'Admin'}</span>
                            <span class="comment-date">${new Date(comment.created).toLocaleDateString('de-DE')}</span>
                        </div>
                        <div>${comment.comment_text}</div>
                        ${comment.field_reference ? `
                            <span class="comment-field">Feld: ${comment.field_reference}</span>
                        ` : ''}
                        <div class="comment-meta">
                            Projekt: ${comment.expand?.document?.expand?.project?.name || 'Unbekannt'}
                        </div>
                    </div>
                `).join('')}
            `;
        } catch (error) {
            container.innerHTML = '<p>Fehler beim Laden der Kommentare</p>';
        }
    } else if (tab === 'api') {
        try {
            const configs = await pb.collection('api_configs').getList();
            
            container.innerHTML = `
                <h3>API Konfigurationen</h3>
                ${configs.items.map(config => `
                    <div class="api-config-item">
                        <h4>${config.name}</h4>
                        <p>URL: ${config.api_url}</p>
                        <p>Format: ${config.data_format}</p>
                        <p>Status: ${config.active ? 'Aktiv' : 'Inaktiv'}</p>
                    </div>
                `).join('')}
            `;
        } catch (error) {
            container.innerHTML = '<p>Fehler beim Laden der API-Konfigurationen</p>';
        }
    }
}

// Export Functions
async function handleApiExport() {
    if (!state.currentProject) return;
    
    try {
        // Get active API config
        const configs = await pb.collection('api_configs').getList(1, 1, {
            filter: 'active = true'
        });
        
        if (configs.items.length === 0) {
            alert('Keine aktive API-Konfiguration vorhanden');
            return;
        }
        
        const config = configs.items[0];
        
        // Prepare data
        const exportData = prepareExportData(config);
        
        // Show confirmation
        if (confirm(`Projekt an ${config.name} senden?`)) {
            // In real implementation, this would make the API call
            console.log('Export data:', exportData);
            alert('Export würde an API gesendet werden:\n' + JSON.stringify(exportData, null, 2));
            
            // Update project status
            await pb.collection('projects').update(state.currentProject.id, {
                status: 'submitted'
            });
        }
    } catch (error) {
        alert('Fehler beim Export: ' + error.message);
    }
}

function prepareExportData(config) {
    const template = JSON.parse(JSON.stringify(config.request_template));
    
    // Replace placeholders
    const replacements = {
        '{{auth_token}}': config.auth_token,
        '{{timestamp}}': new Date().toISOString(),
        '{{vergabenummer}}': state.currentProject.form_data.vergabenummer || '',
        '{{user_email}}': state.currentUser.email,
        '{{date}}': new Date().toISOString().split('T')[0],
        '{{documents}}': state.documents.map(d => d.id)
    };
    
    // Replace in template
    const jsonStr = JSON.stringify(template);
    let result = jsonStr;
    
    Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(key, 'g'), JSON.stringify(value).slice(1, -1));
    });
    
    return JSON.parse(result);
}

// Document Download (placeholder)
async function downloadDocument(documentId) {
    alert('Download-Funktion würde Dokument ' + documentId + ' als DOCX herunterladen');
    // In real implementation, this would generate and download the DOCX file
}

// Export functions for global access
window.showProjectEdit = showProjectEdit;
window.downloadDocument = downloadDocument;
window.openCommentModal = openCommentModal;