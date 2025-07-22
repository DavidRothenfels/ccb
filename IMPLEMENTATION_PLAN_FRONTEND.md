# Vergabe-Vorbereitungs-Tool - Frontend DOCX Implementation

*Version: FINAL Frontend - Ultra-Simple | Januar 2025*

## 🎯 Ansatz: Frontend DOCX-Generation

**Kern-Idee**: PocketBase nur für Daten, DOCX-Processing im Browser
**Deployment**: Single PocketBase Container (wie bisher)
**Libraries**: Lokal gespeichert in `pb_public/` (offline-fähig)

## ✅ Was sich ändert

### Minimal-Änderungen:
1. **DOCX-Libraries** zu `pb_public/libs/` hinzufügen
2. **Frontend erweitern** um DOCX-Generation
3. **Template-Upload** über PocketBase Admin UI
4. **Keine Server-Side Hooks** nötig!

### Was GLEICH bleibt:
- Bestehende PocketBase-Struktur
- Bestehende Collections und Migrations
- Bestehende Frontend (app.js erweitern)
- Docker/Coolify Deployment

## 🏗️ Technische Umsetzung

### 1. DOCX-Libraries (Offline-fähig)

**Download und speichere in `pb_public/libs/`:**

```bash
# In pb_public/libs/ speichern
pb_public/libs/
├── pizzip.min.js         # ZIP-Handling für DOCX
├── docxtemplater.min.js  # Template-Engine
├── file-saver.min.js     # Download-Helper
└── jszip.min.js          # Zusätzliches ZIP-Handling
```

**URLs für Download:**
```bash
# Diese Dateien herunterladen und lokal speichern:
wget https://cdn.jsdelivr.net/npm/pizzip@3.1.4/dist/pizzip.min.js
wget https://cdn.jsdelivr.net/npm/docxtemplater@3.47.3/build/docxtemplater.min.js  
wget https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
wget https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
```

### 2. HTML-Erweiterung

**Erweitere `pb_public/index.html`:**

```html
<!-- Nach bestehenden Scripts hinzufügen -->
<script src="libs/pizzip.min.js"></script>
<script src="libs/docxtemplater.min.js"></script>
<script src="libs/file-saver.min.js"></script>
<script src="libs/jszip.min.js"></script>

<!-- DOCX Generator nach app.js laden -->
<script src="docx-generator.js"></script>
```

### 3. DOCX-Generator Modul

**Neue Datei: `pb_public/docx-generator.js`**

```javascript
// DOCX Generator - Frontend Implementation
class DocxGenerator {
    constructor() {
        this.templates = new Map();
    }

    // Template File von PocketBase laden und cachen
    async loadTemplate(templateRecord) {
        if (this.templates.has(templateRecord.id)) {
            return this.templates.get(templateRecord.id);
        }

        try {
            // File URL von PocketBase
            const fileUrl = pb.files.getUrl(templateRecord, templateRecord.docx_file);
            
            // DOCX als ArrayBuffer laden
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Template load failed: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            
            // Template cachen
            this.templates.set(templateRecord.id, {
                buffer: arrayBuffer,
                placeholders: templateRecord.placeholders || {},
                name: templateRecord.name
            });
            
            console.log('Template loaded:', templateRecord.name);
            return this.templates.get(templateRecord.id);
            
        } catch (error) {
            console.error('Template loading failed:', error);
            throw error;
        }
    }

    // DOCX mit Daten befüllen und generieren
    async generateDocument(templateRecord, formData, projectName = 'Dokument') {
        try {
            // Template laden
            const template = await this.loadTemplate(templateRecord);
            
            // ZIP von ArrayBuffer erstellen
            const zip = new PizZip(template.buffer);
            
            // Docxtemplater initialisieren
            const doc = new window.docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            
            // Template-Platzhalter mit Form-Daten mappen
            const templateData = this.mapFormDataToTemplate(formData, template.placeholders);
            
            // Template befüllen
            doc.render(templateData);
            
            // Befülltes DOCX als Blob generieren
            const blob = doc.getZip().generate({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            
            console.log('Document generated successfully:', template.name);
            return {
                blob: blob,
                filename: `${projectName}_${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.docx`
            };
            
        } catch (error) {
            console.error('Document generation failed:', error);
            throw error;
        }
    }

    // Form-Daten zu Template-Platzhaltern mappen
    mapFormDataToTemplate(formData, placeholders) {
        const templateData = {};
        
        // Für jeden Platzhalter im Template
        Object.keys(placeholders).forEach(placeholder => {
            // Suche entsprechenden Wert in Form-Daten
            if (formData.hasOwnProperty(placeholder)) {
                templateData[placeholder] = formData[placeholder] || '';
            } else {
                templateData[placeholder] = ''; // Leerer Platzhalter wenn nicht gefunden
            }
        });
        
        // Zusätzliche Standard-Felder
        templateData.datum_heute = new Date().toLocaleDateString('de-DE');
        templateData.uhrzeit_heute = new Date().toLocaleTimeString('de-DE');
        
        console.log('Template data mapped:', Object.keys(templateData).length, 'placeholders');
        return templateData;
    }

    // Download-Helper
    downloadDocument(blob, filename) {
        // FileSaver.js für Download
        window.saveAs(blob, filename);
    }

    // Alle Templates für Projekt generieren
    async generateAllDocuments(project, applicableTemplates, formData) {
        const results = [];
        
        for (const template of applicableTemplates) {
            try {
                const result = await this.generateDocument(template, formData, project.name);
                results.push({
                    template: template,
                    success: true,
                    ...result
                });
            } catch (error) {
                console.error(`Failed to generate ${template.name}:`, error);
                results.push({
                    template: template,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    // ZIP-Download für alle Dokumente
    async downloadAllAsZip(project, applicableTemplates, formData) {
        try {
            const zip = new JSZip();
            const results = await this.generateAllDocuments(project, applicableTemplates, formData);
            
            // Erfolgreiche Generierungen zu ZIP hinzufügen
            results.forEach(result => {
                if (result.success) {
                    zip.file(result.filename, result.blob);
                }
            });
            
            // ZIP generieren und downloaden
            const zipBlob = await zip.generateAsync({type: 'blob'});
            const zipFilename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_Vergabedokumente.zip`;
            
            this.downloadDocument(zipBlob, zipFilename);
            
            return results;
            
        } catch (error) {
            console.error('ZIP generation failed:', error);
            throw error;
        }
    }
}

// Global Instance erstellen
window.docxGenerator = new DocxGenerator();

// Helper-Funktionen für bestehende App
window.generateProjectDocuments = async function(project, templates, formData) {
    try {
        const results = await window.docxGenerator.generateAllDocuments(project, templates, formData);
        
        // Erfolgreiche Generierungen zählen
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        if (successful.length > 0) {
            showToast(`${successful.length} Dokumente erfolgreich generiert`, 'success');
        }
        
        if (failed.length > 0) {
            showToast(`${failed.length} Dokumente fehlgeschlagen`, 'error');
            console.error('Failed generations:', failed);
        }
        
        return results;
        
    } catch (error) {
        showToast('Fehler bei Dokument-Generierung: ' + error.message, 'error');
        throw error;
    }
};

window.downloadSingleDocument = async function(templateId, project, formData) {
    try {
        const template = state.templates.find(t => t.id === templateId);
        if (!template) {
            throw new Error('Template nicht gefunden');
        }
        
        const result = await window.docxGenerator.generateDocument(template, formData, project.name);
        window.docxGenerator.downloadDocument(result.blob, result.filename);
        
        showToast('Dokument heruntergeladen', 'success');
        
    } catch (error) {
        showToast('Download fehlgeschlagen: ' + error.message, 'error');
    }
};

window.downloadAllDocuments = async function(project, templates, formData) {
    try {
        await window.docxGenerator.downloadAllAsZip(project, templates, formData);
        showToast('Alle Dokumente als ZIP heruntergeladen', 'success');
        
    } catch (error) {
        showToast('ZIP-Download fehlgeschlagen: ' + error.message, 'error');
    }
};
```

### 4. App.js Integration

**Erweitere bestehende `pb_public/app.js`:**

```javascript
// Nach der bestehenden handleProjectSave Funktion hinzufügen:

// Projekt speichern und Dokumente generieren
async function handleProjectSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Bestehende Projekt-Speicher-Logik...
    // (bleibt wie bisher)
    
    try {
        if (state.currentProject) {
            await pb.collection('projects').update(state.currentProject.id, projectData);
            showToast('Projekt aktualisiert', 'success');
        } else {
            const project = await pb.collection('projects').create(projectData);
            state.currentProject = project;
            showToast('Projekt erstellt', 'success');
        }
        
        // NEU: Dokumente generieren (optional)
        const shouldGenerate = confirm('Dokumente jetzt generieren und herunterladen?');
        if (shouldGenerate) {
            await generateProjectDocumentsNow();
        }
        
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Fehler beim Speichern: ' + error.message, 'error');
    }
}

// Sofortige Dokument-Generierung
async function generateProjectDocumentsNow() {
    if (!state.currentProject || !state.selectedTemplateId) {
        showToast('Bitte Projekt und Template auswählen', 'error');
        return;
    }
    
    try {
        // Form-Daten sammeln
        const formData = collectFormData();
        
        // Anwendbare Templates basierend auf Schwellenwert
        const applicableTemplates = getApplicableTemplates();
        
        if (applicableTemplates.length === 0) {
            showToast('Keine anwendbaren Templates gefunden', 'error');
            return;
        }
        
        // Einzelnes Dokument oder alle?
        if (applicableTemplates.length === 1) {
            await downloadSingleDocument(state.selectedTemplateId, state.currentProject, formData);
        } else {
            const downloadAll = confirm(`${applicableTemplates.length} Templates gefunden. Alle als ZIP herunterladen?`);
            if (downloadAll) {
                await downloadAllDocuments(state.currentProject, applicableTemplates, formData);
            } else {
                await downloadSingleDocument(state.selectedTemplateId, state.currentProject, formData);
            }
        }
        
    } catch (error) {
        console.error('Document generation error:', error);
        showToast('Fehler bei Dokument-Generierung', 'error');
    }
}

// Anwendbare Templates basierend auf Schwellenwert finden
function getApplicableTemplates() {
    const thresholdType = document.getElementById('thresholdType')?.value;
    if (!thresholdType) return [];
    
    return state.templates.filter(template => {
        if (thresholdType === 'oberschwellig') {
            return ['VgV', 'VgV_UVgO', 'SektVO'].includes(template.category);
        } else {
            return ['UVgO', 'VgV_UVgO'].includes(template.category);
        }
    });
}

// Download-Button zu UI hinzufügen
function addDownloadButtons() {
    // In der Projektansicht Download-Buttons hinzufügen
    const actionButtons = document.querySelector('.project-actions');
    if (actionButtons && !document.getElementById('downloadDocsBtn')) {
        actionButtons.insertAdjacentHTML('beforeend', `
            <button id="downloadDocsBtn" class="btn btn-primary" onclick="generateProjectDocumentsNow()">
                <i data-feather="download"></i>
                <span>Dokumente generieren</span>
            </button>
        `);
        feather.replace();
    }
}

// Download-Buttons beim Anzeigen des Projekt-Edit-Screens hinzufügen
const originalShowProjectEdit = showProjectEdit;
showProjectEdit = function(projectId) {
    originalShowProjectEdit(projectId);
    setTimeout(addDownloadButtons, 100);
};
```

### 5. Template-Management

**Templates über PocketBase Admin UI verwalten:**

**Collection: `templates`**
```json
{
    "name": "Wirt-213-P Angebotsschreiben",
    "category": "UVgO", 
    "docx_file": "wirt-213-p.docx",
    "placeholders": {
        "vergabestelle_name": "Name der Vergabestelle",
        "vergabestelle_adresse": "Adresse der Vergabestelle",
        "auftrag_bezeichnung": "Bezeichnung des Auftrags",
        "angebotsfrist_datum": "Datum der Angebotsfrist",
        "angebotsfrist_uhrzeit": "Uhrzeit der Angebotsfrist"
    },
    "active": true
}
```

**Template-Platzhalter Format in DOCX:**
```
Sehr geehrte Damen und Herren,

hiermit bewerben wir uns um den Auftrag "{auftrag_bezeichnung}" 
der {vergabestelle_name}.

Angebotsfrist: {angebotsfrist_datum} um {angebotsfrist_uhrzeit}

Mit freundlichen Grüßen
```

## 🚀 Deployment (Ultra-einfach)

### Bestehender Docker/Coolify bleibt gleich:

```dockerfile
# Bestehende Dockerfile OHNE Änderungen
FROM alpine:latest
COPY pocketbase ./
COPY pb_data/ ./pb_data/
COPY pb_public/ ./pb_public/    # Enthält jetzt DOCX-Libraries
COPY pb_migrations/ ./pb_migrations/

EXPOSE 8091
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8091"]
```

### Dateistruktur:
```
/pb_public/
├── index.html              # Erweitert um DOCX-Libraries
├── app.js                  # Erweitert um Download-Funktionen
├── docx-generator.js       # NEU: DOCX-Generator
├── styles.css              # Bestehend
├── libs/                   # NEU: Offline DOCX-Libraries
│   ├── pizzip.min.js
│   ├── docxtemplater.min.js
│   ├── file-saver.min.js
│   └── jszip.min.js
└── ... (bestehende Dateien)
```

## ⚡ Workflow - So einfach!

### 1. Template hochladen (Admin)
- PocketBase Admin UI → Templates Collection
- DOCX-File hochladen + Platzhalter-JSON eingeben
- Template aktivieren

### 2. Projekt erstellen (User)
- Bestehende Projekt-UI nutzen
- Template auswählen → Felder erscheinen automatisch  
- Felder ausfüllen
- "Projekt speichern" → Optional: "Dokumente generieren"

### 3. Dokumente generieren (User)
- Button "Dokumente generieren" klicken
- Browser lädt Template, befüllt es, erstellt DOCX
- Automatischer Download oder ZIP-Download

## ✅ Vorteile dieser Lösung

### 🎯 Ultra-einfach:
- **Kein separater DOCX-Service** nötig
- **Bestehende PocketBase-Struktur** bleibt
- **Libraries offline** gespeichert (kein CDN)
- **Single Container** Deployment

### ⚡ Performance:
- **Client macht die Arbeit** (Server-Entlastung)
- **Template-Caching** im Browser
- **Sofortige Downloads** ohne Server-Upload

### 🔒 Offline-fähig:
- **Alle Libraries lokal** in pb_public/libs/
- **Keine externen Abhängigkeiten** zur Laufzeit
- **Funktioniert in geschlossenen Netzwerken**

### 🏗️ Wartungsarm:
- **Keine zusätzlichen Services**
- **Standard PocketBase** Features nutzen
- **Bestehende UI** erweitern

## 📋 Implementation Checklist

### Sofort umsetzbar:
- [ ] DOCX-Libraries in `pb_public/libs/` herunterladen
- [ ] `docx-generator.js` erstellen
- [ ] `index.html` um Library-Includes erweitern  
- [ ] `app.js` um Download-Funktionen erweitern
- [ ] Templates über Admin UI hochladen
- [ ] Platzhalter-JSON für Templates definieren
- [ ] Download-Buttons zur UI hinzufügen
- [ ] Testen: Template upload → Projekt erstellen → DOCX generieren

**Total Aufwand: 1-2 Tage für vollständige Implementation!**

---

**Diese Lösung ist maximal einfach, nutzt die bestehende Infrastruktur und erfüllt alle Anforderungen mit minimaler Komplexität. Libraries sind offline verfügbar, kein CDN-Risiko!** 🎯