// Initialize PocketBase
const pb = new PocketBase('http://localhost:8091');

// Enable auto-cancellation of pending requests
pb.autoCancellation(false);

// State management
const state = {
    currentUser: null,
    currentProject: null,
    templates: [],
    projects: [],
    documents: [],
    comments: [],
    selectedTemplateId: null,
    selectedTemplates: new Set(), // Track which templates are selected
    formData: {} // Store form data for auto-save
};

// DOM Elements
const screens = {
    login: document.getElementById('loginScreen'),
    dashboard: document.getElementById('dashboardScreen'),
    projectEdit: document.getElementById('projectEditScreen')
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
    
    // Sidebar logout button (if exists)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Navigate to admin section
            const adminNavItem = document.querySelector('[data-section="admin"]');
            if (adminNavItem) {
                adminNavItem.click();
            }
        });
    }
    
    
    // Navigation - Updated for new structure
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // New project buttons (removed since we now have the form on main page)
    
    // Header logout button
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', handleLogout);
    }
    
    
    // Back to dashboard
    document.getElementById('backToDashboard').addEventListener('click', showDashboard);
    
    // Project form
    document.getElementById('projectForm').addEventListener('submit', handleProjectSave);
    
    // Export to API
    const exportBtn = document.getElementById('exportToApi');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleApiExport);
    }
    
    // Download all button
    const downloadBtn = document.getElementById('downloadAllBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownloadAll);
    }
    
    // Comment modal
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeCommentModal);
    });
    
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSave);
    }
    
    // Admin tabs removed - no longer needed
    
    // Template selector
    const templateSelector = document.getElementById('templateSelector');
    if (templateSelector) {
        templateSelector.addEventListener('change', handleTemplateChange);
    }
    
    // Basic Data Form
    const basicDataForm = document.getElementById('basicDataForm');
    if (basicDataForm) {
        basicDataForm.addEventListener('submit', handleBasicDataSubmit);
    }
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
    
    // Update user info in sidebar
    document.getElementById('sidebarUserName').textContent = state.currentUser.name || 'Benutzer';
    document.getElementById('sidebarUserEmail').textContent = state.currentUser.email;
    
    // Show admin section if user is admin
    const isAdmin = state.currentUser.user_type === 'admin' || state.currentUser.email.includes('admin');
    const adminSettings = document.getElementById('adminSettings');
    if (adminSettings) {
        adminSettings.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Initialize Feather icons
    setTimeout(() => feather.replace(), 100);
    
    // Reset to projects view
    document.querySelector('[data-section="projects"]').click();
    
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
        state.selectedTemplates.clear();
        state.formData = {};
        document.getElementById('projectForm').reset();
        
        // Reset template selection and form fields
        clearTemplateSelection();
        clearFormFields();
        clearDocumentPreview();
        
        // Update project summary
        updateProjectSummary();
    }
}

function hideAllScreens() {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const navItem = e.currentTarget;
    const section = navItem.dataset.section;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    navItem.classList.add('active');
    
    // Show section
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(section + 'Section').classList.add('active');
    
    // Update page title
    const titles = {
        projects: 'Meine Projekte',
        admin: 'Administration'
    };
    document.getElementById('pageTitle').textContent = titles[section];
    
    // Update header actions based on section
    const headerActions = document.getElementById('headerActions');
    if (section === 'projects') {
        headerActions.innerHTML = `
            <button id="newProjectBtn" class="btn btn-primary">
                <i data-feather="plus"></i>
                <span>Neues Projekt</span>
            </button>
        `;
        feather.replace(); // Re-initialize icons
        // Re-attach event listener
        document.getElementById('newProjectBtn').addEventListener('click', handleNewProject);
    } else {
        headerActions.innerHTML = '';
    }
    
    // Load section-specific data
    if (section === 'admin' && (state.currentUser.user_type === 'admin' || state.currentUser.email.includes('admin'))) {
        loadAdminData();
    }
}

// Projects Management
async function loadProjects() {
    try {
        console.log('Loading projects for user:', state.currentUser?.id);
        console.log('Auth valid:', pb.authStore.isValid);
        console.log('Auth token present:', !!pb.authStore.token);
        
        // Check if we're authenticated
        if (!pb.authStore.isValid) {
            console.error('Not authenticated, redirecting to login');
            showLogin();
            return;
        }
        
        // Load all projects and filter client-side
        // Note: projects table has no 'created' field, so we sort by id instead
        const records = await pb.collection('projects').getFullList({
            sort: '-id'
        });
        
        // Filter to only show current user's projects
        // Handle both string IDs (old data) and relations (new data)
        state.projects = records.filter(project => {
            let projectUserId;
            
            // Check if project.user is an object (expanded relation)
            if (typeof project.user === 'object' && project.user !== null && project.user.id) {
                projectUserId = project.user.id;
            } else if (typeof project.user === 'string') {
                // It's a string (direct user ID)
                projectUserId = project.user;
            } else if (Array.isArray(project.user) && project.user.length > 0) {
                // If it's an array (relation stored as array), take first ID
                projectUserId = project.user[0];
            } else {
                // Invalid or missing value
                projectUserId = null;
            }
            
            return projectUserId === state.currentUser.id;
        });
        console.log('Loaded projects:', state.projects.length, 'for user:', state.currentUser.id);
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            response: error.response,
            url: error.url,
            data: error.data,
            originalError: error.originalError
        });
        
        // Detailliertes Logging für besseres Debugging
        if (error.response) {
            console.error('Response headers:', error.response.headers);
            console.error('Response body:', error.response.body);
            console.error('Response data:', error.response.data);
            if (error.response.data) {
                console.error('Error code:', error.response.data.code);
                console.error('Error message:', error.response.data.message);
                console.error('Error details:', error.response.data.details);
            }
        }
        
        // Check if it's a 404 error
        if (error.status === 404) {
            console.error('Projects collection not found. Please check PocketBase setup.');
            showToast('Fehler: Projekte-Sammlung nicht gefunden. Bitte PocketBase neu starten.', 'error');
        } else if (error.status === 401) {
            console.error('Authentication error, redirecting to login');
            pb.authStore.clear();
            showLogin();
            return;
        }
        
        // If error, show empty state
        state.projects = [];
        renderProjects();
    }
}

function renderProjects() {
    const container = document.getElementById('projectsList');
    
    if (state.projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i data-feather="folder" style="width: 48px; height: 48px; stroke-width: 1;"></i>
                <h3>Keine Projekte vorhanden</h3>
                <p>Erstellen Sie Ihr erstes Vergabeprojekt</p>
                <button onclick="handleNewProject()" class="btn btn-ai-generate">
                    <i data-feather="plus"></i>
                    <span>Neues Projekt erstellen</span>
                </button>
            </div>
        `;
        feather.replace();
        return;
    }
    
    container.innerHTML = state.projects.map(project => `
        <div class="project-card" onclick="showProjectEdit('${project.id}')" style="cursor: pointer; transition: all 0.2s ease; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <h3 style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary);">
                    <i data-feather="folder" style="width: 20px; height: 20px;"></i>
                    ${project.name}
                </h3>
                <span class="status ${project.status || 'draft'}">${getStatusLabel(project.status || 'draft')}</span>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 1rem;">${project.description || 'Keine Beschreibung'}</p>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; font-size: 0.875rem; color: var(--gray);">
                <span><i data-feather="tag" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${project.procurement_type || 'Nicht definiert'}</span>
                <span>•</span>
                <span><i data-feather="layers" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${project.threshold_type || 'Nicht definiert'}</span>
                <span>•</span>
                <span><i data-feather="calendar" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${new Date(project.created).toLocaleDateString('de-DE')}</span>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to right, var(--primary), var(--primary-dark)); height: 3px; transform: scaleX(0); transition: transform 0.2s ease;"></div>
        </div>
    `).join('');
    
    // Re-initialize Feather icons for the newly added content
    feather.replace();
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
    // Show simple project creation modal instead of full edit screen
    const modal = document.getElementById('createProjectModal');
    modal.classList.add('show');
    document.getElementById('quickProjectName').focus();
}

function closeCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    modal.classList.remove('show');
    document.getElementById('createProjectForm').reset();
}

async function handleQuickProjectCreate(e) {
    e.preventDefault();
    
    const name = document.getElementById('quickProjectName').value.trim();
    const description = document.getElementById('quickProjectDescription').value.trim();
    
    if (!name) {
        showToast('Bitte geben Sie einen Projektnamen ein', 'error');
        return;
    }
    
    try {
        // Create project with minimal data
        const projectData = {
            name: name,
            description: description,
            user: state.currentUser.id,
            status: 'draft',
            procurement_type: 'service', // Default value
            threshold_type: 'unterschwellig', // Default value
            form_data: {}
        };
        
        const project = await pb.collection('projects').create(projectData);
        
        closeCreateProjectModal();
        showToast('Projekt erstellt', 'success');
        
        // Reload projects list
        await loadProjects();
        
        // Open the project for editing
        showProjectEdit(project.id);
        
    } catch (error) {
        console.error('Error creating project:', error);
        showToast('Fehler beim Erstellen des Projekts: ' + error.message, 'error');
    }
}

async function loadProject(projectId) {
    try {
        const project = await pb.collection('projects').getOne(projectId);
        state.currentProject = project;
        
        // Load selected templates from project data
        if (project.selected_templates) {
            state.selectedTemplates = new Set(project.selected_templates);
        } else {
            state.selectedTemplates.clear();
        }
        
        // Load form data
        state.formData = project.form_data || {};
        
        // Update state.formData with project data for the summary
        state.formData.projectName = project.name;
        state.formData.projectDescription = project.description || '';
        state.formData.procurementType = project.procurement_type || '';
        state.formData.thresholdType = project.threshold_type;
        
        // Update project summary display
        updateProjectSummary();
        
        // Update template selection UI
        updateTemplateCheckboxes();
        
        // Load form fields and documents
        loadFormFieldsFromSelectedTemplates();
        updateDocumentPreview();
        
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Fehler beim Laden des Projekts: ' + error.message, 'error');
        showDashboard();
    }
}

async function handleProjectSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Collect dynamic field data
    const dynamicData = {};
    document.querySelectorAll('#dynamicFormFields input, #dynamicFormFields textarea, #dynamicFormFields select').forEach(field => {
        if (field.type === 'checkbox') {
            dynamicData[field.name] = field.checked;
        } else {
            dynamicData[field.name] = field.value;
        }
    });
    
    // Ensure we have some form_data even if empty
    if (Object.keys(dynamicData).length === 0) {
        dynamicData.placeholder = ""; // Add a placeholder to avoid empty object
    }
    
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

// Templates Management (loaded but not displayed in navigation)
async function loadTemplates() {
    try {
        console.log('Loading templates...');
        
        const records = await pb.collection('templates').getList(1, 50, {
            filter: 'active = true',
            sort: 'category,name'
        });
        
        state.templates = records.items;
        console.log('Loaded templates:', state.templates.length);
        
        // Populate template selector dropdown
        populateTemplateSelector();
    } catch (error) {
        console.error('Error loading templates:', error);
        console.error('Templates error details:', {
            message: error.message,
            status: error.status,
            response: error.response
        });
        
        // Check if it's a 404 error
        if (error.status === 404) {
            console.error('Templates collection not found.');
            showToast('Fehler: Vorlagen-Sammlung nicht gefunden.', 'error');
        }
        
        // Show error message to user
        const selector = document.getElementById('templateSelector');
        if (selector) {
            selector.disabled = true;
            selector.innerHTML = '<option value="">Fehler beim Laden der Vorlagen</option>';
        }
        
        // Show error in fields and documents area
        const fieldsContainer = document.getElementById('dynamicFormFields');
        if (fieldsContainer) {
            fieldsContainer.innerHTML = '<div class="empty-state"><p style="color: var(--danger);">Fehler beim Laden der Vorlagen. Bitte aktualisieren Sie die Seite.</p></div>';
        }
        
        const docsContainer = document.getElementById('documentsList');
        if (docsContainer) {
            docsContainer.innerHTML = '<div class="empty-state"><p style="color: var(--danger);">Fehler beim Laden der Vorlagen.</p></div>';
        }
    }
}

// Populate template selector dropdown
function populateTemplateSelector() {
    const selector = document.getElementById('templateSelector');
    if (!selector) return;
    
    // Clear existing options
    selector.innerHTML = '<option value="">Bitte wählen Sie eine Vorlage...</option>';
    
    // Get applicable templates based on threshold type
    const thresholdType = document.getElementById('thresholdType')?.value;
    
    // If no threshold type selected, show instruction
    if (!thresholdType) {
        selector.disabled = true;
        selector.innerHTML = '<option value="">Bitte zuerst Schwellenwert wählen</option>';
        // Clear fields and documents
        document.getElementById('dynamicFormFields').innerHTML = '<div class="empty-state"><p>Bitte wählen Sie zuerst einen Schwellenwert.</p></div>';
        document.getElementById('documentsList').innerHTML = '<div class="empty-state"><p>Bitte wählen Sie zuerst einen Schwellenwert und eine Vorlage.</p></div>';
        return;
    }
    
    selector.disabled = false;
    
    const applicableTemplates = state.templates.filter(template => {
        if (thresholdType === 'oberschwellig') {
            return ['VgV', 'VgV_UVgO', 'SektVO'].includes(template.category);
        } else {
            return ['UVgO', 'VgV_UVgO'].includes(template.category);
        }
    });
    
    // Handle no templates available
    if (applicableTemplates.length === 0) {
        selector.disabled = true;
        selector.innerHTML = '<option value="">Keine Vorlagen für diesen Schwellenwert verfügbar</option>';
        // Clear fields and documents
        document.getElementById('dynamicFormFields').innerHTML = '<div class="empty-state"><p>Keine Vorlagen für diesen Schwellenwert verfügbar.</p></div>';
        document.getElementById('documentsList').innerHTML = '<div class="empty-state"><p>Keine Vorlagen verfügbar.</p></div>';
        return;
    }
    
    // Add options for each applicable template
    applicableTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        selector.appendChild(option);
    });
    
    // Select first template by default if available
    if (applicableTemplates.length > 0) {
        // Check if previously selected template is still available
        const previouslySelected = applicableTemplates.find(t => t.id === state.selectedTemplateId);
        if (previouslySelected) {
            selector.value = previouslySelected.id;
        } else {
            selector.value = applicableTemplates[0].id;
            state.selectedTemplateId = applicableTemplates[0].id;
        }
        // Trigger change event to load fields and document
        handleTemplateChange();
    }
}

// Handle template selection change
function handleTemplateChange() {
    const selector = document.getElementById('templateSelector');
    if (!selector) return;
    
    state.selectedTemplateId = selector.value;
    
    // Reload form fields for selected template
    const savedData = state.currentProject?.form_data || {};
    loadDynamicFields(savedData);
    
    // Reload document preview for selected template
    renderDocuments();
}

// Removed handleThresholdChange - no longer needed

// Dynamic Form Fields
function loadDynamicFields(savedData = {}) {
    const container = document.getElementById('dynamicFormFields');
    
    // If no template is selected, show empty state
    if (!state.selectedTemplateId) {
        container.innerHTML = '<div class="empty-state"><p>Bitte wählen Sie eine Vorlage aus.</p></div>';
        return;
    }
    
    // Get the selected template
    const selectedTemplate = state.templates.find(t => t.id === state.selectedTemplateId);
    if (!selectedTemplate) {
        container.innerHTML = '<div class="empty-state"><p>Vorlage nicht gefunden.</p></div>';
        return;
    }
    
    // Get fields from selected template only
    const allFields = {};
    const fieldGroups = {};
    
    Object.entries(selectedTemplate.template_fields).forEach(([key, field]) => {
        allFields[key] = field;
        const section = field.section || 'general';
        if (!fieldGroups[section]) {
            fieldGroups[section] = {};
        }
        fieldGroups[section][key] = field;
    });
    
    // Render fields by section
    const sectionTitles = {
        vergabestelle: 'Vergabestelle',
        empfaenger: 'Empfänger',
        projekt: 'Projektinformationen',
        verfahren: 'Verfahren',
        fristen: 'Fristen',
        auftrag: 'Auftragsbeschreibung',
        wert: 'Wertangaben',
        zuschlag: 'Zuschlagskriterien',
        sonstiges: 'Sonstiges',
        kommunikation: 'Kommunikation',
        bewerber: 'Bewerber',
        general: 'Allgemeine Angaben'
    };
    
    // Order sections
    const sectionOrder = ['vergabestelle', 'auftrag', 'verfahren', 'wert', 'fristen', 'zuschlag', 'sonstiges'];
    const orderedSections = {};
    
    // First add ordered sections
    sectionOrder.forEach(section => {
        if (fieldGroups[section]) {
            orderedSections[section] = fieldGroups[section];
        }
    });
    
    // Then add any remaining sections
    Object.entries(fieldGroups).forEach(([section, fields]) => {
        if (!orderedSections[section]) {
            orderedSections[section] = fields;
        }
    });
    
    container.innerHTML = Object.entries(orderedSections).map(([section, fields]) => `
        <div class="form-section">
            <h4 class="form-section-title">${sectionTitles[section] || section}</h4>
            ${Object.entries(fields).map(([key, field]) => {
                const value = savedData[key] || field.default || '';
                return renderFormField(key, field, value);
            }).join('')}
        </div>
    `).join('');
    
    // Add input event listeners for live preview
    setupLivePreview();
}

function renderFormField(name, field, value = '') {
    const required = field.required ? 'required' : '';
    
    switch (field.type) {
        case 'textarea':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <textarea id="${name}" name="${name}" rows="4" ${required} 
                        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>${value}</textarea>
                </div>
            `;
        case 'email':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <input type="email" id="${name}" name="${name}" value="${value}" ${required}
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                </div>
            `;
        case 'phone':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <input type="tel" id="${name}" name="${name}" value="${value}" ${required}
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                </div>
            `;
        case 'date':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <input type="date" id="${name}" name="${name}" value="${value}" ${required}>
                </div>
            `;
        case 'time':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <input type="time" id="${name}" name="${name}" value="${value}" ${required}>
                </div>
            `;
        case 'datetime':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <input type="datetime-local" id="${name}" name="${name}" value="${value}" ${required}>
                </div>
            `;
        case 'number':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <input type="number" id="${name}" name="${name}" value="${value}" ${required} 
                        ${field.min !== undefined ? `min="${field.min}"` : ''} 
                        ${field.max !== undefined ? `max="${field.max}"` : ''}>
                </div>
            `;
        case 'currency':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="number" id="${name}" name="${name}" value="${value}" ${required} 
                            step="0.01" min="0"
                            ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                        <span>€</span>
                    </div>
                </div>
            `;
        case 'checkbox':
            return `
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="${name}" name="${name}" ${value === true || value === 'true' ? 'checked' : ''}>
                        <span>${field.label}</span>
                    </label>
                </div>
            `;
        case 'select':
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <select id="${name}" name="${name}" ${required}>
                        <option value="">Bitte wählen</option>
                        ${field.options.map(opt => `
                            <option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        default:
            return `
                <div class="form-group">
                    <label for="${name}">${field.label}${required ? ' *' : ''}</label>
                    <input type="text" id="${name}" name="${name}" value="${value}" ${required}
                        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
                        ${field.pattern ? `pattern="${field.pattern}"` : ''}
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                </div>
            `;
    }
}

// Document Generation
async function generateDocuments() {
    if (!state.currentProject) return;
    
    try {
        // Delete existing documents for this project
        const existingDocs = await pb.collection('documents').getList(1, 100, {
            filter: `project = "${state.currentProject.id}"`
        });
        
        for (const doc of existingDocs.items) {
            await pb.collection('documents').delete(doc.id);
        }
        
        // Get applicable templates based on project type
        const applicableTemplates = state.templates.filter(template => {
            // Filter based on threshold type
            if (state.currentProject.threshold_type === 'oberschwellig') {
                return ['VgV', 'VgV_UVgO', 'SektVO'].includes(template.category);
            } else {
                return ['UVgO', 'VgV_UVgO'].includes(template.category);
            }
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
        
        // Load comments for admins
        if (state.currentUser.user_type === 'admin' || state.currentUser.email.includes('admin')) {
            state.documents.forEach(doc => loadDocumentComments(doc.id));
        }
    } catch (error) {
        console.error('Error generating documents:', error);
        alert('Fehler beim Generieren der Dokumente: ' + error.message);
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
    
    // If no template is selected, show empty state
    if (!state.selectedTemplateId) {
        container.innerHTML = '<div class="empty-state"><p>Bitte wählen Sie eine Vorlage aus.</p></div>';
        return;
    }
    
    // Find the document for the selected template
    const selectedDoc = state.documents.find(doc => 
        doc.expand?.template?.id === state.selectedTemplateId
    );
    
    if (!selectedDoc) {
        // If no document exists for this template, show preview
        renderTemplatePreview();
        return;
    }
    
    // Render only the selected document
    const template = selectedDoc.expand?.template;
    const content = selectedDoc.filled_content;
    const formData = content.filled_data || {};
    
    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-header">
                <h3 class="card-title">${template?.name || 'Dokument'}</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-secondary" onclick="downloadDocumentAsDocx('${selectedDoc.id}')">
                        <i data-feather="download"></i>
                        <span>DOCX</span>
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="copyDocument('${selectedDoc.id}')">
                        <i data-feather="copy"></i>
                        <span>Kopieren</span>
                    </button>
                    ${state.currentUser.user_type === 'admin' || state.currentUser.email.includes('admin') ? `
                        <button class="btn btn-small btn-primary" onclick="openCommentModal('${selectedDoc.id}')">
                            <i data-feather="message-circle"></i>
                            <span>Kommentar</span>
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="document-preview" id="doc-${selectedDoc.id}">
                ${renderDocumentContent(template, content, formData)}
            </div>
            <div id="comments-${selectedDoc.id}" style="margin-top: 1rem;">
                <!-- Comments will be loaded here -->
            </div>
        </div>
    `;
    
    // Re-initialize Feather icons for the newly added content
    setTimeout(() => feather.replace(), 100);
    
    // Load comments for this document
    loadDocumentComments(selectedDoc.id);
}

// Collect form data from all input fields
function collectFormData() {
    const formData = {};
    
    // Get all dynamic form fields
    const dynamicFields = document.querySelectorAll('#dynamicFormFields input, #dynamicFormFields select, #dynamicFormFields textarea');
    dynamicFields.forEach(field => {
        if (field.name) {
            formData[field.name] = field.value;
        }
    });
    
    // Get basic form fields
    const basicFields = document.querySelectorAll('#projectForm input, #projectForm select, #projectForm textarea');
    basicFields.forEach(field => {
        if (field.name && !formData[field.name]) {
            formData[field.name] = field.value;
        }
    });
    
    return formData;
}

// Render template preview when no document exists
function renderTemplatePreview() {
    const container = document.getElementById('documentsList');
    const selectedTemplate = state.templates.find(t => t.id === state.selectedTemplateId);
    
    if (!selectedTemplate) {
        container.innerHTML = '<div class="empty-state"><p>Vorlage nicht gefunden.</p></div>';
        return;
    }
    
    const formData = collectFormData();
    
    container.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div class="card-header">
                <h3 class="card-title">${selectedTemplate.name} (Vorschau)</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <span class="badge">Vorschau</span>
                </div>
            </div>
            <div class="document-preview">
                ${renderDocumentContent(selectedTemplate, selectedTemplate.template_content, formData)}
            </div>
        </div>
    `;
}

function renderDocumentContent(template, content, formData) {
    if (!content.sections) return '<p>Keine Inhalte verfügbar</p>';
    
    return content.sections.map(section => {
        switch (section.type) {
            case 'letterhead':
                return `
                    <div style="margin-bottom: 2rem;">
                        <strong>${section.title}:</strong><br>
                        ${section.fields.map(field => 
                            formData[field] ? `${formData[field]}<br>` : ''
                        ).join('')}
                    </div>
                `;
            
            case 'recipient':
                return `
                    <div style="margin-bottom: 2rem;">
                        <strong>${section.title}:</strong><br>
                        ${section.fields.map(field => 
                            formData[field] ? `${formData[field]}<br>` : ''
                        ).join('')}
                    </div>
                `;
            
            case 'reference':
                return `
                    <div style="margin-bottom: 2rem;">
                        ${section.fields.map(field => {
                            const fieldDef = template.template_fields[field];
                            return formData[field] ? 
                                `<strong>${fieldDef?.label || field}:</strong> <span class="field-value">${formData[field]}</span><br>` : '';
                        }).join('')}
                    </div>
                `;
            
            case 'title':
                return `<h1 style="text-align: center; margin: 2rem 0;">${section.content}</h1>`;
            
            case 'header':
                return `<h2 style="margin: 1.5rem 0;">${section.content}</h2>`;
            
            case 'content':
            case 'paragraph':
                let content = section.content || '';
                if (section.fields) {
                    section.fields.forEach(field => {
                        if (formData[field]) {
                            content += ` <span class="field-value">${formData[field]}</span>`;
                        }
                    });
                }
                return `<p style="margin-bottom: 1rem;">${content}</p>`;
            
            case 'field_group':
                return `
                    <div style="margin-bottom: 1rem;">
                        ${section.label ? `<strong>${section.label}</strong> ` : ''}
                        ${section.fields.map(field => {
                            return formData[field] ? `<span class="field-value">${formData[field]}</span>` : '';
                        }).join(' ')}
                    </div>
                `;
            
            case 'numbered_section':
                return `
                    <div style="margin: 2rem 0;">
                        <h3>${section.number}. ${section.title}</h3>
                        ${section.content ? `<p>${section.content}</p>` : ''}
                        ${section.fields ? section.fields.map(field => {
                            const fieldDef = template.template_fields[field];
                            return formData[field] ? 
                                `<p><strong>${fieldDef?.label || field}:</strong> <span class="field-value">${formData[field]}</span></p>` : '';
                        }).join('') : ''}
                        ${section.subsections ? section.subsections.map(sub => 
                            renderDocumentContent(template, {sections: [sub]}, formData)
                        ).join('') : ''}
                    </div>
                `;
            
            case 'options':
                return `
                    <div style="margin-bottom: 1rem;">
                        <strong>${section.title}:</strong><br>
                        ${section.fields.map(field => {
                            return formData[field] ? `☑ ${formData[field]}` : '';
                        }).filter(Boolean).join('<br>')}
                    </div>
                `;
            
            case 'deadline':
            case 'deadlines':
                return `
                    <div style="margin-bottom: 1rem;">
                        <strong>${section.title}:</strong><br>
                        ${section.fields.map(field => {
                            const fieldDef = template.template_fields[field];
                            if (formData[field]) {
                                const value = field.includes('datum') || field.includes('date') ? 
                                    new Date(formData[field]).toLocaleDateString('de-DE') : 
                                    formData[field];
                                return `${fieldDef?.label || field}: <span class="field-value">${value}</span>`;
                            }
                            return '';
                        }).filter(Boolean).join('<br>')}
                    </div>
                `;
            
            case 'attachments':
                return `
                    <div style="margin: 2rem 0;">
                        <strong>${section.title}:</strong>
                        <ul>
                            ${section.content.map(item => `<li>☐ ${item}</li>`).join('')}
                        </ul>
                    </div>
                `;
            
            case 'footer':
                return `
                    <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ccc;">
                        <strong>${section.title}:</strong><br>
                        ${section.content.replace(/\\n/g, '<br>')}
                    </div>
                `;
            
            default:
                return `<div>${JSON.stringify(section)}</div>`;
        }
    }).join('');
}

// Comments
async function loadDocumentComments(documentId) {
    try {
        const comments = await pb.collection('comments').getList(1, 50, {
            filter: `document = "${documentId}"`,
            expand: 'author',
            sort: '-created'
        });
        
        const container = document.getElementById(`comments-${documentId}`);
        if (comments.items.length > 0) {
            container.innerHTML = `
                <div style="border-top: 1px solid var(--gray-200); padding-top: 1rem;">
                    <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Kommentare</h4>
                    ${comments.items.map(comment => `
                        <div style="background: var(--gray-50); padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                <strong style="font-size: 0.75rem;">${comment.expand?.author?.email || 'Admin'}</strong>
                                <span style="font-size: 0.75rem; color: var(--gray-500);">
                                    ${new Date(comment.created).toLocaleDateString('de-DE')}
                                </span>
                            </div>
                            ${comment.field_reference ? `
                                <span style="font-size: 0.75rem; background: var(--gray-200); padding: 0.125rem 0.5rem; border-radius: 4px;">
                                    Feld: ${comment.field_reference}
                                </span>
                            ` : ''}
                            <div style="margin-top: 0.5rem; font-size: 0.875rem;">${comment.comment_text}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

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
        loadDocumentComments(documentId);
    } catch (error) {
        alert('Fehler beim Speichern: ' + error.message);
    }
}

// Admin Functions
async function loadAdminData() {
    const container = document.getElementById('adminContent');
    
    // Only show API configuration
        try {
            const configs = await pb.collection('api_configs').getList();
            
            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>API Konfigurationen</h3>
                    <button class="btn btn-primary btn-small" onclick="openApiSettingsModal()">
                        <i data-feather="plus"></i>
                        <span>Neue Konfiguration</span>
                    </button>
                </div>
                ${configs.items.length === 0 ? `
                    <div class="empty-state">
                        <p>Keine API-Konfigurationen vorhanden</p>
                    </div>
                ` : configs.items.map(config => `
                    <div style="padding: 1.5rem; background: var(--gray-50); border-radius: 8px; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h4 style="margin-bottom: 0.5rem;">${config.name}</h4>
                                <p style="font-size: 0.875rem; color: var(--gray-600);">URL: ${config.api_url}</p>
                                <p style="font-size: 0.875rem; color: var(--gray-600);">Format: ${config.data_format}</p>
                                <p style="font-size: 0.875rem;">
                                    Status: <span class="badge badge-${config.active ? 'completed' : 'draft'}">
                                        ${config.active ? 'Aktiv' : 'Inaktiv'}
                                    </span>
                                </p>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-small btn-secondary" onclick="editApiConfig('${config.id}')">
                                    <i data-feather="edit-3"></i>
                                    <span>Bearbeiten</span>
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="deleteApiConfig('${config.id}')">
                                    <i data-feather="trash-2"></i>
                                    <span>Löschen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
            
            // Re-initialize Feather icons for the newly added content
            setTimeout(() => feather.replace(), 100);
        } catch (error) {
            container.innerHTML = '<p>Fehler beim Laden der API-Konfigurationen</p>';
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
        if (confirm(`Projekt an ${config.name} senden?\n\nDie folgenden Daten werden übermittelt:\n${JSON.stringify(exportData, null, 2)}`)) {
            // Make actual API call
            try {
                const response = await fetch(config.api_url, {
                    method: 'POST',
                    headers: {
                        ...config.headers,
                        'Authorization': `Bearer ${config.auth_token}`
                    },
                    body: JSON.stringify(exportData)
                });
                
                if (response.ok) {
                    alert('Erfolgreich an Vergabeplattform gesendet!');
                    
                    // Update project status
                    await pb.collection('projects').update(state.currentProject.id, {
                        status: 'submitted'
                    });
                } else {
                    const error = await response.text();
                    alert('Fehler beim Senden: ' + error);
                }
            } catch (error) {
                // For demo purposes, just show success
                alert('Demo-Modus: Daten würden an API gesendet werden');
                console.log('Export data:', exportData);
            }
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
        '{{documents}}': state.documents.map(d => ({
            id: d.id,
            template: d.expand?.template?.name,
            created: d.created
        }))
    };
    
    // Replace in template
    const jsonStr = JSON.stringify(template);
    let result = jsonStr;
    
    Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
            JSON.stringify(value).slice(1, -1));
    });
    
    return JSON.parse(result);
}

// Document Actions - Download aktuell angezeigtes Dokument als DOCX
async function downloadDocumentAsDocx(documentId) {
    const doc = state.documents.find(d => d.id === documentId);
    if (!doc) return;
    
    try {
        showToast('DOCX wird generiert...', 'info');
        
        const template = doc.expand?.template;
        const projectName = state.currentProject.name.replace(/[^a-zA-Z0-9]/g, '_');
        const templateName = template?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'dokument';
        
        // HTML-Inhalt des angezeigten Dokuments holen
        const content = document.getElementById(`doc-${documentId}`).innerHTML;
        
        // Saubere HTML-zu-DOCX Konvertierung
        const cleanHtml = content
            .replace(/<button[^>]*>.*?<\/button>/gi, '') // Buttons entfernen
            .replace(/<i[^>]*data-feather[^>]*><\/i>/gi, '') // Feather Icons entfernen
            .replace(/\s+/g, ' ') // Mehrfache Leerzeichen
            .trim();
        
        const fullHtml = `
            <!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head>
                <meta charset='utf-8'>
                <title>${template?.name || 'Dokument'}</title>
                <style>
                    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.4; margin: 2cm; }
                    h1, h2, h3 { color: #333; margin-top: 1.5em; margin-bottom: 0.5em; }
                    h1 { font-size: 16pt; }
                    h2 { font-size: 14pt; }
                    h3 { font-size: 12pt; }
                    .card { margin-bottom: 1em; }
                    .card-header { font-weight: bold; margin-bottom: 0.5em; }
                    .document-preview { margin: 1em 0; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 2em;">
                    <h1>${template?.name || 'Vergabedokument'}</h1>
                    <p><strong>Projekt:</strong> ${state.currentProject.name}</p>
                    <p><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
                </div>
                ${cleanHtml}
            </body>
            </html>
        `;
        
        // Als DOCX-kompatible HTML-Datei herunterladen
        const blob = new Blob([fullHtml], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}_${templateName}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('DOCX-Dokument heruntergeladen', 'success');
        
    } catch (error) {
        console.error('Error generating DOCX:', error);
        showToast('Fehler beim Erstellen der DOCX-Datei: ' + error.message, 'error');
    }
}

function renderDocxContent(template, content, formData) {
    // This would be properly implemented with docx library
    // For now, return simple paragraphs
    const paragraphs = [];
    
    if (content.sections) {
        content.sections.forEach(section => {
            if (section.type === 'title') {
                paragraphs.push(new Paragraph({
                    text: section.content,
                    heading: HeadingLevel.HEADING_1,
                    alignment: 'center'
                }));
            } else if (section.content) {
                paragraphs.push(new Paragraph({
                    text: section.content
                }));
            }
        });
    }
    
    return paragraphs;
}

function copyDocument(documentId) {
    const content = document.getElementById(`doc-${documentId}`).innerText;
    navigator.clipboard.writeText(content).then(() => {
        alert('Dokument in Zwischenablage kopiert');
    });
}

function handleCopyAll() {
    let allContent = '';
    state.documents.forEach(doc => {
        const content = document.getElementById(`doc-${doc.id}`).innerText;
        allContent += `\n\n=== ${doc.expand?.template?.name || 'Dokument'} ===\n\n${content}`;
    });
    
    navigator.clipboard.writeText(allContent).then(() => {
        const btn = document.getElementById('copyAllBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Kopiert!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    });
}

// Live Preview Functions
function setupLivePreview() {
    const formFields = document.querySelectorAll('#dynamicFormFields input, #dynamicFormFields textarea, #dynamicFormFields select');
    
    formFields.forEach(field => {
        field.addEventListener('input', debounce(() => updateLivePreview(), 300));
        field.addEventListener('change', () => updateLivePreview());
    });
    
    // Also update on threshold type change
    document.getElementById('thresholdType').addEventListener('change', () => {
        loadDynamicFields(getCurrentFormData());
        updateLivePreview();
    });
}

function getCurrentFormData() {
    const formData = {};
    document.querySelectorAll('#dynamicFormFields input, #dynamicFormFields textarea, #dynamicFormFields select').forEach(field => {
        if (field.type === 'checkbox') {
            formData[field.name] = field.checked;
        } else {
            formData[field.name] = field.value;
        }
    });
    
    // Add basic project data
    formData.projectName = document.getElementById('projectName').value;
    formData.projectDescription = document.getElementById('projectDescription').value;
    formData.procurementType = document.getElementById('procurementType').value;
    formData.thresholdType = document.getElementById('thresholdType').value;
    
    return formData;
}

function updateLivePreview() {
    // Use the new renderDocuments function which handles template selection
    renderDocuments();
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Download all documents as ZIP
async function handleDownloadAll() {
    if (!state.documents || state.documents.length === 0) {
        showToast('Keine Dokumente zum Herunterladen vorhanden', 'warning');
        return;
    }
    
    if (!window.JSZip) {
        showToast('ZIP-Bibliothek nicht geladen', 'error');
        return;
    }
    
    try {
        showToast('Erstelle ZIP-Archiv...', 'info');
        const zip = new JSZip();
        const projectName = state.currentProject.name.replace(/[^a-z0-9]/gi, '_');
        
        // Generate HTML-to-DOCX for each document
        for (const doc of state.documents) {
            const template = doc.expand?.template;
            if (!template) continue;
            
            try {
                // HTML-Inhalt des Dokuments holen (simuliert)
                const templateName = template.name.replace(/[^a-zA-Z0-9]/g, '_');
                
                // Erstelle HTML-Inhalt für das Dokument
                const documentHtml = `
                    <!DOCTYPE html>
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
                    <head>
                        <meta charset='utf-8'>
                        <title>${template.name}</title>
                        <style>
                            body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.4; margin: 2cm; }
                            h1, h2, h3 { color: #333; margin-top: 1.5em; margin-bottom: 0.5em; }
                            h1 { font-size: 16pt; }
                            h2 { font-size: 14pt; }
                            h3 { font-size: 12pt; }
                        </style>
                    </head>
                    <body>
                        <div style="text-align: center; margin-bottom: 2em;">
                            <h1>${template.name}</h1>
                            <p><strong>Projekt:</strong> ${state.currentProject.name}</p>
                            <p><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
                        </div>
                        ${renderDocumentContent(template, doc.filled_content, doc.filled_content?.filled_data || {})}
                    </body>
                    </html>
                `;
                
                const blob = new Blob([documentHtml], { 
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
                });
                
                zip.file(`${templateName}.docx`, blob);
                
            } catch (docError) {
                console.warn(`Failed to generate document for ${template.name}:`, docError);
            }
        }
        
        // Check if we have any files in the ZIP
        const fileCount = Object.keys(zip.files).length;
        if (fileCount === 0) {
            showToast('Keine Dokumente zum Herunterladen gefunden', 'warning');
            return;
        }
        
        // Generate ZIP and download
        const content = await zip.generateAsync({type: 'blob'});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}_Vergabedokumente.zip`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast(`${fileCount} Dokumente als ZIP heruntergeladen`, 'success');
        
    } catch (error) {
        console.error('Error creating ZIP:', error);
        showToast('Fehler beim Erstellen der ZIP-Datei: ' + error.message, 'error');
    }
}

// Generate comments summary document
async function generateCommentsDocument() {
    const docx = window.docx;
    if (!docx) return null;
    
    const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = docx;
    
    const children = [
        new Paragraph({
            text: 'Kommentar-Übersicht',
            heading: HeadingLevel.HEADING_1,
            alignment: 'center',
            spacing: { after: 400 }
        }),
        new Paragraph({
            text: `Projekt: ${state.currentProject.name}`,
            spacing: { after: 200 }
        }),
        new Paragraph({
            text: `Datum: ${new Date().toLocaleDateString('de-DE')}`,
            spacing: { after: 400 }
        })
    ];
    
    // Collect all comments for all documents
    for (const doc of state.documents) {
        const template = doc.expand?.template;
        if (!template) continue;
        
        // Get comments for this document
        const comments = await pb.collection('comments').getList(1, 50, {
            filter: `document = "${doc.id}"`,
            expand: 'author',
            sort: '-created'
        });
        
        if (comments.items.length > 0) {
            children.push(
                new Paragraph({
                    text: template.name,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );
            
            // Create table for comments
            const rows = [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ text: 'Feld', bold: true })],
                            width: { size: 20, type: WidthType.PERCENTAGE }
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: 'Kommentar', bold: true })],
                            width: { size: 50, type: WidthType.PERCENTAGE }
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: 'Status', bold: true })],
                            width: { size: 15, type: WidthType.PERCENTAGE }
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: 'Autor', bold: true })],
                            width: { size: 15, type: WidthType.PERCENTAGE }
                        })
                    ]
                })
            ];
            
            comments.items.forEach(comment => {
                rows.push(
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph(comment.field_reference || '-')]
                            }),
                            new TableCell({
                                children: [new Paragraph(comment.comment_text)]
                            }),
                            new TableCell({
                                children: [new Paragraph(comment.status || 'open')]
                            }),
                            new TableCell({
                                children: [new Paragraph(comment.expand?.author?.email || 'Admin')]
                            })
                        ]
                    })
                );
            });
            
            children.push(
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: rows
                })
            );
            
            children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
        }
    }
    
    return new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1134,
                        right: 1134,
                        bottom: 1134,
                        left: 1134
                    }
                }
            },
            children: children
        }]
    });
}

// API Settings Functions
function openApiSettingsModal(configId = null) {
    const modal = document.getElementById('apiSettingsModal');
    modal.classList.add('active');
    
    if (configId) {
        // Load existing config
        loadApiConfig(configId);
    } else {
        // Reset form for new config
        document.getElementById('apiSettingsForm').reset();
        document.getElementById('jsonMapping').value = JSON.stringify({
            "vergabenummer": "{{vergabenummer}}",
            "bezeichnung": "{{auftrag_bezeichnung}}",
            "vergabestelle": "{{vergabestelle_name}}",
            "auftragswert": "{{geschaetzter_auftragswert}}",
            "angebotsfrist": "{{angebotsfrist_datum}}",
            "documents": "{{documents}}"
        }, null, 2);
    }
}

async function loadApiConfig(configId) {
    try {
        const config = await pb.collection('api_configs').getOne(configId);
        document.getElementById('apiName').value = config.name;
        document.getElementById('apiUrl').value = config.api_url;
        document.getElementById('apiToken').value = config.auth_token || '';
        document.getElementById('dataFormat').value = config.data_format;
        document.getElementById('jsonMapping').value = JSON.stringify(config.request_template, null, 2);
        document.getElementById('apiActive').checked = config.active;
        
        // Store config ID for update
        document.getElementById('apiSettingsForm').dataset.configId = configId;
    } catch (error) {
        alert('Fehler beim Laden der Konfiguration');
    }
}

function closeApiSettingsModal() {
    const modal = document.getElementById('apiSettingsModal');
    modal.classList.remove('active');
    document.getElementById('apiSettingsForm').reset();
    delete document.getElementById('apiSettingsForm').dataset.configId;
}

async function handleApiSettingsSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const configId = e.target.dataset.configId;
    
    try {
        const requestTemplate = JSON.parse(formData.get('request_template'));
        const configData = {
            name: formData.get('name'),
            api_url: formData.get('api_url'),
            auth_token: formData.get('auth_token') || '',
            data_format: formData.get('data_format'),
            request_template: requestTemplate,
            headers: {
                'Content-Type': formData.get('data_format') === 'json' ? 'application/json' : 'application/xml'
            },
            active: formData.has('active')
        };
        
        if (configData.active) {
            // Deactivate all other configs
            const configs = await pb.collection('api_configs').getList(1, 50, {
                filter: 'active = true'
            });
            for (const config of configs.items) {
                if (config.id !== configId) {
                    await pb.collection('api_configs').update(config.id, { active: false });
                }
            }
        }
        
        if (configId) {
            await pb.collection('api_configs').update(configId, configData);
            alert('Konfiguration aktualisiert');
        } else {
            await pb.collection('api_configs').create(configData);
            alert('Konfiguration erstellt');
        }
        
        closeApiSettingsModal();
        loadAdminData('api');
    } catch (error) {
        alert('Fehler beim Speichern: ' + error.message);
    }
}

async function deleteApiConfig(configId) {
    if (confirm('Möchten Sie diese API-Konfiguration wirklich löschen?')) {
        try {
            await pb.collection('api_configs').delete(configId);
            alert('Konfiguration gelöscht');
            loadAdminData('api');
        } catch (error) {
            alert('Fehler beim Löschen: ' + error.message);
        }
    }
}

// Setup API settings event listeners
document.getElementById('apiSettingsForm').addEventListener('submit', handleApiSettingsSave);
document.querySelectorAll('#apiSettingsModal .close-btn').forEach(btn => {
    btn.addEventListener('click', closeApiSettingsModal);
});

// Toast Notification System
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type} fade-in`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span style="font-size: 1.25rem;">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Replace all alert() calls with showToast()
const originalAlert = window.alert;
window.alert = function(message) {
    if (message.includes('Fehler') || message.includes('fehlgeschlagen')) {
        showToast(message, 'error');
    } else if (message.includes('erfolgreich') || message.includes('gespeichert') || message.includes('erstellt')) {
        showToast(message, 'success');
    } else {
        showToast(message, 'info');
    }
};

// Project deletion
async function deleteProject(projectId) {
    if (confirm('Möchten Sie dieses Projekt wirklich löschen? Alle zugehörigen Dokumente werden ebenfalls gelöscht.')) {
        try {
            // First delete all documents for this project
            const documents = await pb.collection('documents').getList(1, 100, {
                filter: `project = "${projectId}"`
            });
            
            for (const doc of documents.items) {
                // Delete comments for each document
                const comments = await pb.collection('comments').getList(1, 100, {
                    filter: `document = "${doc.id}"`
                });
                
                for (const comment of comments.items) {
                    await pb.collection('comments').delete(comment.id);
                }
                
                await pb.collection('documents').delete(doc.id);
            }
            
            // Then delete the project
            await pb.collection('projects').delete(projectId);
            
            showToast('Projekt erfolgreich gelöscht', 'success');
            
            // Reload projects
            loadProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast('Fehler beim Löschen des Projekts: ' + error.message, 'error');
        }
    }
}

// Removed duplicate handleThresholdChange

function loadTemplateSelection() {
    const thresholdType = document.getElementById('thresholdType').value;
    const container = document.getElementById('templateSelection');
    
    if (!thresholdType || state.templates.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Bitte wählen Sie zuerst einen Schwellenwert.</p></div>';
        return;
    }
    
    // Filter templates based on threshold type
    const applicableTemplates = state.templates.filter(template => {
        if (thresholdType === 'oberschwellig') {
            return ['VgV', 'VgV_UVgO', 'SektVO'].includes(template.category);
        } else {
            return ['UVgO', 'VgV_UVgO'].includes(template.category);
        }
    });
    
    if (applicableTemplates.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Keine Templates für diesen Schwellenwert verfügbar.</p></div>';
        return;
    }
    
    // Group templates by category
    const groupedTemplates = {};
    applicableTemplates.forEach(template => {
        const category = template.category || 'Sonstige';
        if (!groupedTemplates[category]) {
            groupedTemplates[category] = [];
        }
        groupedTemplates[category].push(template);
    });
    
    // Render template checkboxes by category
    const categoryTitles = {
        'VgV': 'Oberschwellige Vergabe (VgV)',
        'UVgO': 'Unterschwellige Vergabe (UVgO)', 
        'VgV_UVgO': 'Allgemeine Dokumente',
        'SektVO': 'Sektorenvergabe',
        'Sonstige': 'Sonstige Dokumente'
    };
    
    container.innerHTML = Object.entries(groupedTemplates).map(([category, templates]) => `
        <div class="template-category" style="margin-bottom: 1rem;">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary); font-size: 0.875rem; font-weight: 600;">
                ${categoryTitles[category] || category}
            </h4>
            <div class="template-list" style="margin-left: 0.5rem;">
                ${templates.map(template => `
                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                        <input type="checkbox" 
                               id="template-${template.id}" 
                               value="${template.id}" 
                               onchange="handleTemplateSelectionChange('${template.id}', this.checked)"
                               ${state.selectedTemplates.has(template.id) ? 'checked' : ''}>
                        <span>${template.name}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function handleTemplateSelectionChange(templateId, isSelected) {
    if (isSelected) {
        state.selectedTemplates.add(templateId);
    } else {
        state.selectedTemplates.delete(templateId);
    }
    
    // Update form fields and documents
    loadFormFieldsFromSelectedTemplates();
    updateDocumentPreview();
    
    // Auto-save project data
    autoSaveProject();
}

function loadFormFieldsFromSelectedTemplates() {
    const container = document.getElementById('dynamicFormFields');
    
    if (state.selectedTemplates.size === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="edit-3" style="width: 48px; height: 48px; stroke-width: 1;"></i>
                <h4>Keine Felder geladen</h4>
                <p>Wählen Sie Templates links aus, um Felder zu laden.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    // Collect all fields from selected templates
    const allFields = {};
    const fieldGroups = {};
    
    Array.from(state.selectedTemplates).forEach(templateId => {
        const template = state.templates.find(t => t.id === templateId);
        if (template && template.template_fields) {
            Object.entries(template.template_fields).forEach(([key, field]) => {
                // Avoid duplicating fields
                if (!allFields[key]) {
                    allFields[key] = field;
                    const section = field.section || 'general';
                    if (!fieldGroups[section]) {
                        fieldGroups[section] = {};
                    }
                    fieldGroups[section][key] = field;
                }
            });
        }
    });
    
    // Render fields by section (compact layout)
    const sectionTitles = {
        vergabestelle: 'Vergabestelle',
        empfaenger: 'Empfänger',
        projekt: 'Projektinformationen',
        verfahren: 'Verfahren',
        fristen: 'Fristen',
        auftrag: 'Auftragsbeschreibung',
        wert: 'Wertangaben',
        zuschlag: 'Zuschlagskriterien',
        sonstiges: 'Sonstiges',
        kommunikation: 'Kommunikation',
        bewerber: 'Bewerber',
        general: 'Allgemeine Angaben'
    };
    
    // Order sections logically
    const sectionOrder = ['vergabestelle', 'auftrag', 'projekt', 'verfahren', 'wert', 'fristen', 'zuschlag', 'sonstiges'];
    const orderedSections = {};
    
    sectionOrder.forEach(section => {
        if (fieldGroups[section]) {
            orderedSections[section] = fieldGroups[section];
        }
    });
    
    // Add remaining sections
    Object.entries(fieldGroups).forEach(([section, fields]) => {
        if (!orderedSections[section]) {
            orderedSections[section] = fields;
        }
    });
    
    container.innerHTML = Object.entries(orderedSections).map(([section, fields]) => `
        <div class="form-section" style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid var(--gray-200); border-radius: 8px;">
            <h4 class="form-section-title" style="margin: 0 0 1rem 0; color: var(--primary); font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">
                ${sectionTitles[section] || section}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                ${Object.entries(fields).map(([key, field]) => {
                    const value = state.formData[key] || field.default || '';
                    return renderCompactFormField(key, field, value);
                }).join('')}
            </div>
        </div>
    `).join('');
    
    // Setup auto-save on field changes
    setupAutoSave();
}

function renderCompactFormField(name, field, value = '') {
    const required = field.required ? 'required' : '';
    const requiredMark = field.required ? ' *' : '';
    
    switch (field.type) {
        case 'textarea':
            return `
                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="${name}" style="font-size: 0.875rem; font-weight: 500;">${field.label}${requiredMark}</label>
                    <textarea id="${name}" name="${name}" rows="2" ${required} 
                        style="font-size: 0.875rem;"
                        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>${value}</textarea>
                </div>
            `;
        case 'email':
        case 'phone':
        case 'date':
        case 'time':
        case 'datetime':
            const inputType = field.type === 'phone' ? 'tel' : field.type === 'datetime' ? 'datetime-local' : field.type;
            return `
                <div class="form-group">
                    <label for="${name}" style="font-size: 0.875rem; font-weight: 500;">${field.label}${requiredMark}</label>
                    <input type="${inputType}" id="${name}" name="${name}" value="${value}" ${required}
                        style="font-size: 0.875rem;"
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                </div>
            `;
        case 'number':
            return `
                <div class="form-group">
                    <label for="${name}" style="font-size: 0.875rem; font-weight: 500;">${field.label}${requiredMark}</label>
                    <input type="number" id="${name}" name="${name}" value="${value}" ${required}
                        style="font-size: 0.875rem;"
                        ${field.min !== undefined ? `min="${field.min}"` : ''} 
                        ${field.max !== undefined ? `max="${field.max}"` : ''}>
                </div>
            `;
        case 'currency':
            return `
                <div class="form-group">
                    <label for="${name}" style="font-size: 0.875rem; font-weight: 500;">${field.label}${requiredMark}</label>
                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                        <input type="number" id="${name}" name="${name}" value="${value}" ${required} 
                            style="font-size: 0.875rem; flex: 1;"
                            step="0.01" min="0">
                        <span style="font-size: 0.875rem;">€</span>
                    </div>
                </div>
            `;
        case 'checkbox':
            return `
                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500;">
                        <input type="checkbox" id="${name}" name="${name}" ${value === true || value === 'true' ? 'checked' : ''}>
                        <span>${field.label}</span>
                    </label>
                </div>
            `;
        case 'select':
            return `
                <div class="form-group">
                    <label for="${name}" style="font-size: 0.875rem; font-weight: 500;">${field.label}${requiredMark}</label>
                    <select id="${name}" name="${name}" ${required} style="font-size: 0.875rem;">
                        <option value="">Bitte wählen</option>
                        ${field.options.map(opt => `
                            <option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        default:
            return `
                <div class="form-group">
                    <label for="${name}" style="font-size: 0.875rem; font-weight: 500;">${field.label}${requiredMark}</label>
                    <input type="text" id="${name}" name="${name}" value="${value}" ${required}
                        style="font-size: 0.875rem;"
                        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
                        ${field.pattern ? `pattern="${field.pattern}"` : ''}
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                </div>
            `;
    }
}

function setupAutoSave() {
    const formFields = document.querySelectorAll('#dynamicFormFields input, #dynamicFormFields textarea, #dynamicFormFields select');
    
    formFields.forEach(field => {
        field.addEventListener('blur', () => {
            collectCurrentFormData();
            autoSaveProject();
        });
        field.addEventListener('change', () => {
            collectCurrentFormData();
            updateDocumentPreview();
        });
    });
}

function collectCurrentFormData() {
    // Collect all form data including basic project fields
    const formData = {};
    
    // Basic project data
    const projectName = document.getElementById('projectName');
    const projectDescription = document.getElementById('projectDescription');
    const thresholdType = document.getElementById('thresholdType');
    
    if (projectName) formData.projectName = projectName.value;
    if (projectDescription) formData.projectDescription = projectDescription.value;
    if (thresholdType) formData.thresholdType = thresholdType.value;
    
    // Dynamic form fields
    const dynamicFields = document.querySelectorAll('#dynamicFormFields input, #dynamicFormFields textarea, #dynamicFormFields select');
    dynamicFields.forEach(field => {
        if (field.name) {
            if (field.type === 'checkbox') {
                formData[field.name] = field.checked;
            } else {
                formData[field.name] = field.value;
            }
        }
    });
    
    state.formData = formData;
    return formData;
}

async function autoSaveProject() {
    if (!state.currentProject) return;
    
    try {
        const projectData = {
            name: state.formData.projectName || state.currentProject.name,
            description: state.formData.projectDescription || '',
            threshold_type: state.formData.thresholdType || state.currentProject.threshold_type,
            selected_templates: Array.from(state.selectedTemplates),
            form_data: state.formData
        };
        
        await pb.collection('projects').update(state.currentProject.id, projectData);
        console.log('Project auto-saved');
        
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

async function saveProjectData() {
    const formData = collectCurrentFormData();
    
    if (!formData.projectName) {
        showToast('Bitte geben Sie einen Projektnamen ein.', 'error');
        return;
    }
    
    if (!formData.thresholdType) {
        showToast('Bitte wählen Sie einen Schwellenwert.', 'error');
        return;
    }
    
    const projectData = {
        name: formData.projectName,
        description: formData.projectDescription || '',
        threshold_type: formData.thresholdType,
        selected_templates: Array.from(state.selectedTemplates),
        form_data: formData,
        status: 'draft',
        user: state.currentUser.id
    };
    
    try {
        if (state.currentProject) {
            // Update existing project
            await pb.collection('projects').update(state.currentProject.id, projectData);
            showToast('Projekt aktualisiert', 'success');
        } else {
            // Create new project
            const project = await pb.collection('projects').create(projectData);
            state.currentProject = project;
            showToast('Projekt erstellt', 'success');
        }
        
        // Update documents
        updateDocumentPreview();
        
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Fehler beim Speichern: ' + error.message, 'error');
    }
}

function updateDocumentPreview() {
    const container = document.getElementById('documentsList');
    
    if (state.selectedTemplates.size === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-feather="file-text" style="width: 48px; height: 48px; stroke-width: 1;"></i>
                <h4>Keine Dokumente vorhanden</h4>
                <p>Wählen Sie Templates aus, um eine Vorschau zu sehen.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    const formData = state.formData;
    
    // Generate preview for all selected templates
    const previews = Array.from(state.selectedTemplates).map(templateId => {
        const template = state.templates.find(t => t.id === templateId);
        if (!template) return '';
        
        return `
            <div class="document-preview-card" style="margin-bottom: 2rem; border: 1px solid var(--gray-200); border-radius: 8px; overflow: hidden;">
                <div class="document-header" style="background: var(--gray-50); padding: 1rem; border-bottom: 1px solid var(--gray-200);">
                    <h4 style="margin: 0; font-size: 1rem; color: var(--primary);">${template.name}</h4>
                    <small style="color: var(--gray-600);">Vorschau - ${template.category}</small>
                </div>
                <div class="document-content" style="padding: 1rem; font-size: 0.875rem; line-height: 1.5;">
                    ${renderDocumentContent(template, template.template_content, formData)}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = previews;
    feather.replace();
}

function clearTemplateSelection() {
    const container = document.getElementById('templateSelection');
    container.innerHTML = '<div class="empty-state"><p>Bitte wählen Sie zuerst einen Schwellenwert.</p></div>';
}

function clearFormFields() {
    const container = document.getElementById('dynamicFormFields');
    container.innerHTML = `
        <div class="empty-state">
            <i data-feather="edit-3" style="width: 48px; height: 48px; stroke-width: 1;"></i>
            <h4>Keine Felder geladen</h4>
            <p>Wählen Sie Templates links aus, um Felder zu laden.</p>
        </div>
    `;
    feather.replace();
}

function clearDocumentPreview() {
    const container = document.getElementById('documentsList');
    container.innerHTML = `
        <div class="empty-state">
            <i data-feather="file-text" style="width: 48px; height: 48px; stroke-width: 1;"></i>
            <h4>Keine Dokumente vorhanden</h4>
            <p>Füllen Sie die Felder aus, um eine Vorschau zu sehen.</p>
        </div>
    `;
    feather.replace();
}

function updateTemplateCheckboxes() {
    Array.from(state.selectedTemplates).forEach(templateId => {
        const checkbox = document.getElementById(`template-${templateId}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

function filterTemplates() {
    // This function would implement filtering based on checkboxes
    // For now, we'll just reload the template selection
    loadTemplateSelection();
}

// Right Panel Action Handlers
function handleCopyToClipboard() {
    const container = document.getElementById('documentsList');
    const content = container.innerText;
    
    if (!content || content.includes('Keine Dokumente')) {
        showToast('Keine Inhalte zum Kopieren vorhanden', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(content).then(() => {
        showToast('Inhalte in Zwischenablage kopiert', 'success');
    }).catch(() => {
        showToast('Fehler beim Kopieren', 'error');
    });
}

function handleDownloadWord() {
    if (state.selectedTemplates.size === 0) {
        showToast('Keine Templates ausgewählt', 'warning');
        return;
    }
    
    showToast('Word-Download wird vorbereitet...', 'info');
    // Implementation would generate actual DOCX files
    setTimeout(() => {
        showToast('Download gestartet', 'success');
    }, 1000);
}

function handleDownloadAllZip() {
    if (state.selectedTemplates.size === 0) {
        showToast('Keine Templates ausgewählt', 'warning');
        return;
    }
    
    showToast('ZIP-Archiv wird erstellt...', 'info');
    // Implementation would create ZIP with all documents
    setTimeout(() => {
        showToast('ZIP-Download gestartet', 'success');
    }, 1000);
}

// Basic Data Modal Functions
function openBasicDataModal() {
    const modal = document.getElementById('basicDataModal');
    
    // Populate form with current project data
    if (state.currentProject || state.formData) {
        document.getElementById('modalProjectName').value = state.formData.projectName || state.currentProject?.name || '';
        document.getElementById('modalProjectDescription').value = state.formData.projectDescription || state.currentProject?.description || '';
        document.getElementById('modalProcurementType').value = state.formData.procurementType || state.currentProject?.procurement_type || '';
        document.getElementById('modalThresholdType').value = state.formData.thresholdType || state.currentProject?.threshold_type || '';
    }
    
    modal.style.display = 'block';
}

function closeBasicDataModal() {
    document.getElementById('basicDataModal').style.display = 'none';
}

function handleModalThresholdChange() {
    // Handle threshold change in modal if needed
}

function updateProjectSummary() {
    // Update the project summary display
    document.getElementById('summaryProjectName').textContent = state.formData.projectName || 'Kein Projekt geladen';
    document.getElementById('summaryProjectDescription').textContent = state.formData.projectDescription || 'Bitte Grunddaten eingeben';
    document.getElementById('summaryProcurementType').textContent = state.formData.procurementType || '-';
    
    const thresholdMap = {
        'unterschwellig': 'Unterschwellig (UVgO)',
        'oberschwellig': 'Oberschwellig (VgV)'
    };
    document.getElementById('summaryThresholdType').textContent = thresholdMap[state.formData.thresholdType] || '-';
}

function handleBasicDataSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    
    // Update state
    state.formData.projectName = formData.get('name');
    state.formData.projectDescription = formData.get('description');
    state.formData.procurementType = formData.get('procurement_type');
    state.formData.thresholdType = formData.get('threshold_type');
    
    // Update summary display
    updateProjectSummary();
    
    // Close modal
    closeBasicDataModal();
    
    // Show success message
    showToast('Grunddaten aktualisiert', 'success');
}

// Quick project form submission (now used by modal)
async function handleQuickProjectCreate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const selectedTemplates = [];
    
    // Get selected templates from modal
    const checkboxes = document.querySelectorAll('#modalTemplateCheckboxes input[type="checkbox"]:checked');
    checkboxes.forEach(cb => selectedTemplates.push(cb.value));
    
    // Create project data
    const projectData = {
        name: formData.get('title'),
        description: formData.get('description'),
        threshold_type: formData.get('threshold'),
        procurement_type: '',  // Will be set in the project edit screen
        selected_templates: selectedTemplates,
        form_data: {
            projectName: formData.get('title'),
            projectDescription: formData.get('description'),
            thresholdType: formData.get('threshold')
        },
        status: 'draft'
    };
    
    try {
        // Create new project
        const newProject = await pb.collection('projects').create(projectData);
        
        // Close modal
        closeCreateProjectModal();
        
        // Navigate to project edit screen
        showProjectEdit(newProject.id);
        
        showToast('Projekt erfolgreich erstellt', 'success');
    } catch (error) {
        console.error('Error creating project:', error);
        showToast('Fehler beim Erstellen des Projekts: ' + error.message, 'error');
    }
}

// Main page threshold change handler
function handleMainThresholdChange() {
    const threshold = document.getElementById('quickThreshold').value;
    const templateSection = document.getElementById('mainTemplateSelection');
    const checkboxContainer = document.getElementById('mainTemplateCheckboxes');
    
    if (threshold) {
        // Show template selection
        templateSection.style.display = 'block';
        
        // Filter templates by threshold
        const filteredTemplates = state.templates.filter(template => {
            const category = template.category?.toLowerCase() || '';
            return category.includes(threshold.toLowerCase());
        });
        
        // Render checkboxes
        if (filteredTemplates.length > 0) {
            checkboxContainer.innerHTML = filteredTemplates.map(template => `
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                    <input type="checkbox" name="templates[]" value="${template.id}">
                    <span>${template.name}</span>
                </label>
            `).join('');
        } else {
            checkboxContainer.innerHTML = '<p style="margin: 0; color: var(--gray-500);">Keine Formulare für diesen Schwellenwert verfügbar.</p>';
        }
    } else {
        // Hide template selection
        templateSection.style.display = 'none';
        checkboxContainer.innerHTML = '';
    }
}

// Create Project Modal Functions
function openCreateProjectModal() {
    document.getElementById('createProjectModal').style.display = 'block';
    // Reset form
    document.getElementById('createProjectForm').reset();
    document.getElementById('modalTemplateSelection').style.display = 'none';
}

function closeCreateProjectModal() {
    document.getElementById('createProjectModal').style.display = 'none';
}

function handleModalProjectThresholdChange() {
    const threshold = document.getElementById('quickProjectThreshold').value;
    const templateSection = document.getElementById('modalTemplateSelection');
    const checkboxContainer = document.getElementById('modalTemplateCheckboxes');
    
    if (threshold) {
        // Show template selection
        templateSection.style.display = 'block';
        
        // Filter templates by threshold
        const filteredTemplates = state.templates.filter(template => {
            const category = template.category?.toLowerCase() || '';
            return category.includes(threshold.toLowerCase());
        });
        
        // Render checkboxes with better styling
        if (filteredTemplates.length > 0) {
            checkboxContainer.innerHTML = filteredTemplates.map(template => `
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem; border: 1px solid var(--gray-200); border-radius: 6px; transition: all 0.2s ease; background: white;">
                    <input type="checkbox" name="templates[]" value="${template.id}">
                    <span>${template.name}</span>
                </label>
            `).join('');
            
            // Add hover effects
            checkboxContainer.querySelectorAll('label').forEach(label => {
                label.addEventListener('mouseenter', () => {
                    label.style.background = 'var(--primary-light)';
                    label.style.borderColor = 'var(--primary)';
                });
                label.addEventListener('mouseleave', () => {
                    label.style.background = 'white';
                    label.style.borderColor = 'var(--gray-200)';
                });
            });
        } else {
            checkboxContainer.innerHTML = '<p style="margin: 0; color: var(--gray-500);">Keine Formulare für diesen Schwellenwert verfügbar.</p>';
        }
    } else {
        // Hide template selection
        templateSection.style.display = 'none';
        checkboxContainer.innerHTML = '';
    }
}

// Export functions for global access
window.showProjectEdit = showProjectEdit;
window.openBasicDataModal = openBasicDataModal;
window.closeBasicDataModal = closeBasicDataModal;
window.handleModalThresholdChange = handleModalThresholdChange;
window.handleMainThresholdChange = handleMainThresholdChange;
window.openCreateProjectModal = openCreateProjectModal;
window.closeCreateProjectModal = closeCreateProjectModal;
window.handleModalProjectThresholdChange = handleModalProjectThresholdChange;
window.handleQuickProjectCreate = handleQuickProjectCreate;
window.downloadDocumentAsDocx = downloadDocumentAsDocx;
window.copyDocument = copyDocument;
window.openCommentModal = openCommentModal;
window.handleNewProject = handleNewProject;
window.openApiSettingsModal = openApiSettingsModal;
window.editApiConfig = openApiSettingsModal;
window.deleteApiConfig = deleteApiConfig;
window.deleteProject = deleteProject;
window.showToast = showToast;
// Removed handleThresholdChange export
window.handleTemplateSelectionChange = handleTemplateSelectionChange;
window.filterTemplates = filterTemplates;
window.saveProjectData = saveProjectData;
window.closeCreateProjectModal = closeCreateProjectModal;
window.handleQuickProjectCreate = handleQuickProjectCreate;