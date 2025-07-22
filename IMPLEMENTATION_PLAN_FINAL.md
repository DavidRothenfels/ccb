# Vergabe-Vorbereitungs-Tool - Finaler Umsetzungsplan

*Version: FINAL - Minimal & Praktisch | Januar 2025*

## Kernansatz: Bestehende App erweitern

**Basis**: Vorhandenes PocketBase-System in `/citychallenge`  
**Ziel**: DOCX-Generation durch Go Hooks hinzufügen  
**Deployment**: Single Docker Container auf Coolify

## Was wird GENAU umgesetzt

### ✅ Kern-Funktionalität
1. **Template-Upload**: Berlin.de DOCX-Dateien in bestehende `templates` Collection
2. **Formular-Eingabe**: Erweitere bestehende Projekt-UI um Template-Felder
3. **DOCX-Generation**: Go Hook generiert gefüllte Dokumente automatisch
4. **Download**: Fertige DOCX-Dateien über bestehende File-API
5. **Admin-Kommentare**: Erweitere bestehende `comments` Collection

### ❌ Was NICHT gemacht wird (für MVP)
- Keine HTML-Preview
- Keine komplexe UI-Neugestaltung  
- Keine API-Integration berlin.de/vergabeplattform
- Keine automatische Template-Analyse
- Keine komplexen Workflows

## Technische Umsetzung

### 1. Custom PocketBase Build

**Erweitere bestehende `main.go` oder erstelle neue:**

```go
// main.go - Custom PocketBase
package main

import (
    "log"
    "path/filepath"
    "encoding/json"
    
    "github.com/pocketbase/pocketbase"
    "github.com/pocketbase/pocketbase/core"
    "baliance.com/gooxml/document"
)

func main() {
    app := pocketbase.New()

    // DOCX Generation Hook - Das ist ALLES was wir brauchen
    app.OnRecordAfterCreate("projects").BindFunc(func(e *core.RecordEvent) error {
        // Nur verarbeiten wenn template_ids gesetzt ist
        templateIds := e.Record.Get("template_ids")
        if templateIds == nil {
            return e.Next()
        }
        
        formData := e.Record.Get("form_data")
        if formData == nil {
            return e.Next()
        }
        
        // Für jedes Template DOCX generieren
        generateDocuments(app, e.Record, templateIds.([]string), formData)
        
        return e.Next()
    })

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}

func generateDocuments(app *pocketbase.PocketBase, project *models.Record, templateIds []string, formData interface{}) {
    data := formData.(map[string]interface{})
    
    for _, templateId := range templateIds {
        // Template laden
        template, err := app.Dao().FindRecordById("templates", templateId)
        if err != nil {
            continue
        }
        
        templateFile := template.GetString("docx_file")
        templatePath := filepath.Join("pb_data/storage", templateFile)
        
        // DOCX verarbeiten
        doc, err := document.Open(templatePath)
        if err != nil {
            app.Logger().Error("Template open failed", "error", err)
            continue
        }
        
        // Platzhalter ersetzen
        placeholders := template.Get("placeholders").(map[string]interface{})
        for key, _ := range placeholders {
            if value, exists := data[key]; exists {
                doc.ReplaceAll("{{"+key+"}}", fmt.Sprintf("%v", value), -1)
            }
        }
        
        // Ausgabedatei speichern
        outputPath := filepath.Join("pb_data/storage/generated", 
            fmt.Sprintf("%s_%s.docx", project.Id, templateId))
        
        os.MkdirAll(filepath.Dir(outputPath), 0755)
        doc.SaveToFile(outputPath)
        
        // generated_documents record erstellen
        collection, _ := app.Dao().FindCollectionByNameOrId("generated_documents")
        record := models.NewRecord(collection)
        record.Set("project_id", project.Id)
        record.Set("template_id", templateId)
        record.Set("file_path", "generated/"+filepath.Base(outputPath))
        record.Set("status", "completed")
        
        app.Dao().SaveRecord(record)
        
        app.Logger().Info("Document generated", "project", project.Id, "template", templateId)
    }
}
```

### 2. Datenbank-Erweiterungen

**Erweitere bestehende Collections:**

```javascript
// pb_migrations/add_docx_fields.js
migrate((db) => {
  // Erweitere projects collection
  const projects = db.collection('projects')
  projects.schema.addField(new SchemaField({
    name: "template_ids",
    type: "json", 
    required: false
  }))
  
  projects.schema.addField(new SchemaField({
    name: "form_data",
    type: "json",
    required: false
  }))
  
  db.saveCollection(projects)
  
  // Erweitere templates collection  
  const templates = db.collection('templates')
  templates.schema.addField(new SchemaField({
    name: "placeholders", 
    type: "json",
    required: false
  }))
  
  db.saveCollection(templates)
  
  // Neue generated_documents collection
  const docs = new Collection({
    name: "generated_documents",
    type: "base",
    schema: [
      {name: "project_id", type: "relation", options: {collectionId: projects.id}},
      {name: "template_id", type: "relation", options: {collectionId: templates.id}}, 
      {name: "file_path", type: "text"},
      {name: "status", type: "select", options: {values: ["pending", "completed", "failed"]}}
    ]
  })
  
  db.saveCollection(docs)
})
```

### 3. Frontend-Erweiterungen

**Erweitere bestehende `pb_public/app.js`:**

```javascript
// Template-Auswahl zu Projekt-Formular hinzufügen
function extendProjectForm() {
    const projectForm = document.getElementById('project-form')
    
    // Template-Auswahl hinzufügen
    const templateSection = document.createElement('div')
    templateSection.innerHTML = `
        <h3>Formulare auswählen</h3>
        <div id="template-checkboxes"></div>
        
        <h3>Formular-Daten</h3>
        <div id="form-fields"></div>
    `
    projectForm.appendChild(templateSection)
    
    loadTemplates()
}

async function loadTemplates() {
    const templates = await pb.collection('templates').getFullList()
    const container = document.getElementById('template-checkboxes')
    
    templates.forEach(template => {
        const checkbox = document.createElement('div')
        checkbox.innerHTML = `
            <label>
                <input type="checkbox" value="${template.id}" onchange="updateFormFields()">
                ${template.name}
            </label>
        `
        container.appendChild(checkbox)
    })
}

function updateFormFields() {
    const checkedTemplates = Array.from(document.querySelectorAll('#template-checkboxes input:checked'))
    const fieldsContainer = document.getElementById('form-fields')
    fieldsContainer.innerHTML = ''
    
    checkedTemplates.forEach(async (checkbox) => {
        const template = await pb.collection('templates').getOne(checkbox.value)
        const placeholders = template.placeholders || {}
        
        Object.entries(placeholders).forEach(([key, label]) => {
            const field = document.createElement('div')
            field.innerHTML = `
                <label>${label}:</label>
                <input type="text" name="field_${key}" placeholder="${label}">
            `
            fieldsContainer.appendChild(field)
        })
    })
}

// Erweitere Project-Save-Funktion
function saveProjectWithDocuments() {
    const formData = new FormData(document.getElementById('project-form'))
    const templateIds = Array.from(document.querySelectorAll('#template-checkboxes input:checked'))
        .map(cb => cb.value)
    
    // Sammle Feld-Daten
    const fieldData = {}
    Array.from(document.querySelectorAll('#form-fields input')).forEach(input => {
        const fieldKey = input.name.replace('field_', '')
        fieldData[fieldKey] = input.value
    })
    
    // Speichere Projekt mit Template-Daten
    pb.collection('projects').create({
        name: formData.get('name'),
        description: formData.get('description'), 
        user_id: pb.authStore.model.id,
        template_ids: templateIds,
        form_data: fieldData
    })
}
```

### 4. Docker Setup

**Erweitere bestehende `Dockerfile`:**

```dockerfile
# Dockerfile - Custom PocketBase Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Go Module Setup
COPY go.mod go.sum ./
RUN go mod download

# Source Code
COPY . .

# Build Custom PocketBase
RUN CGO_ENABLED=0 go build -o pocketbase-custom .

# Runtime
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /app

# Copy Binary
COPY --from=builder /app/pocketbase-custom ./pocketbase

# Copy Existing Data
COPY pb_data/ ./pb_data/
COPY pb_public/ ./pb_public/ 
COPY pb_migrations/ ./pb_migrations/

# Create Directories
RUN mkdir -p pb_data/storage/generated templates

EXPOSE 8091

CMD ["./pocketbase", "serve", "--http=0.0.0.0:8091"]
```

**Neue `go.mod`:**

```go
module citychallenge

go 1.22

require (
    github.com/pocketbase/pocketbase v0.28.4
    baliance.com/gooxml v1.0.1
)
```

## Praktische Umsetzung

### Phase 1: Basis Setup (1 Tag)
- [ ] `go.mod` erstellen in `/citychallenge`  
- [ ] `main.go` mit einfachem Hook erstellen
- [ ] Docker Build testen
- [ ] Lokal testen: `go run main.go serve`

### Phase 2: DOCX Integration (2 Tage)  
- [ ] `gooxml` Library einbinden
- [ ] Template-Upload über Admin UI testen
- [ ] Einfache DOCX-Generation implementieren
- [ ] Hook-Integration finalisieren

### Phase 3: Frontend-Erweiterung (1 Tag)
- [ ] Template-Auswahl zu bestehender Project-UI hinzufügen
- [ ] Dynamische Felder basierend auf Platzhaltern
- [ ] Download-Links für generierte Dokumente

### Phase 4: Deployment (0.5 Tage)
- [ ] Coolify-Deployment testen
- [ ] Volume für `pb_data` konfigurieren
- [ ] SSL/Domain Setup

## Template-Vorbereitung

### Berlin.de Templates
1. **Download**: 2-3 Formulare von berlin.de/vergabeservice
2. **Analyse**: Manuell Platzhalter identifizieren
3. **Upload**: Via PocketBase Admin UI
4. **Konfiguration**: Platzhalter-JSON manuell setzen

**Beispiel Platzhalter-Konfiguration:**
```json
{
    "applicant_name": "Name des Antragstellers",
    "company_address": "Firmenadresse", 
    "project_title": "Projekttitel",
    "submission_date": "Abgabedatum"
}
```

## Admin-Features

### Kommentarsystem
**Erweitere bestehende `comments` Collection:**
- Feld `document_id` hinzufügen für Referenz zu `generated_documents`
- Simple UI-Erweiterung für Kommentar-Anzeige bei Dokumenten
- Export als Text-Zusammenfassung

### Template-Management
**Nutze PocketBase Admin UI:**
- Template-Upload über File-Field
- Platzhalter-JSON über JSON-Field
- Template-Aktivierung über Boolean-Field

## Erfolgs-Kriterien

### Funktional
- [ ] Berlin.de DOCX-Template hochladen
- [ ] Projekt mit Template-Daten erstellen  
- [ ] Automatische DOCX-Generation
- [ ] Download der gefüllten Dokumente
- [ ] Admin-Kommentare zu Dokumenten

### Technisch  
- [ ] Single Docker Container auf Coolify
- [ ] Bestehende PocketBase-Daten bleiben erhalten
- [ ] Performance: <10s für DOCX-Generation
- [ ] Keine Modifikation der Original-Templates

## Deployment-Checkliste

### Vorbereitung
- [ ] Bestehende `pb_data` Backup erstellen
- [ ] Go Dependencies lokal testen
- [ ] Docker Build lokal erfolgreich
- [ ] Template-Upload und Generation lokal getestet

### Coolify Deploy
- [ ] Repository mit `Dockerfile` konfiguriert
- [ ] Volume für `pb_data` gemappt
- [ ] Environment Variables gesetzt
- [ ] SSL-Zertifikat konfiguriert
- [ ] Smoke-Test: Login + Template-Upload + Generation

## Wartung & Erweiterung

### Nach MVP
- [ ] Automatische Template-Analyse
- [ ] Berlin.de API-Integration  
- [ ] HTML-Preview-Feature
- [ ] Erweiterte Admin-Features
- [ ] Performance-Optimierungen

**Aufwand Total: 4.5 Tage Development + 0.5 Tag Deployment = 5 Tage**

---

**Dieser Plan baut auf dem Bestehenden auf, fügt nur das DOCX-Feature hinzu und hält die Komplexität minimal. Single Docker Container, bestehende UI erweitern, manuelle Template-Konfiguration für MVP.**