# Vergabe-Vorbereitungs-Tool - City Challenge Berlin 2025

Digitale Unterstützung für die Vorbereitung von Vergabeverfahren in der öffentlichen Verwaltung.

## Installation & Start

```bash
# PocketBase starten
./start_pocketbase.sh

# Oder manuell:
./pocketbase serve --http=0.0.0.0:8091 --dir=./pb_data
```

## Zugang

### Anwendung
- URL: http://localhost:8091/
- Standard User: user@citychallenge.berlin / citychallenge2025
- Admin User: admin.user@citychallenge.berlin / citychallenge2025

### Admin Dashboard
- URL: http://localhost:8091/_/
- Superuser: admin@citychallenge.berlin / citychallenge2025

## Funktionen

### Für Benutzer
- Vergabeprojekte erstellen und verwalten
- Formulardaten zentral eingeben
- Automatische Dokumentengenerierung aus Templates
- Export an Vergabeplattform

### Für Administratoren
- Template-Verwaltung
- Kommentarfunktion für Dokumente
- API-Konfiguration für Vergabeplattform
- Benutzer- und Rechteverwaltung

## Architektur

### Backend
- PocketBase v0.28.4 (Go-basiertes Backend-as-a-Service)
- SQLite Datenbank
- Collections: templates, projects, documents, comments, api_configs

### Frontend
- Vanilla JavaScript
- PocketBase SDK für Echtzeit-Updates
- Responsive Design
- Single Page Application

### Datenmodell

#### Templates
- Formularvorlagen aus Berlin Vergabeservice
- Analysierte Felder mit Typen und Validierung
- Template-Content als strukturiertes JSON

#### Projects
- Vergabeprojekte der Benutzer
- Status-Workflow: draft → in_review → approved → submitted
- Zentrale Formulardaten

#### Documents
- Generierte Dokumente aus Templates
- Versionierung
- DOCX Export-Funktion

#### Comments
- Admin-Kommentare zu Dokumenten
- Feldbezug möglich
- Status-Tracking

## Tests

```bash
# Datenbank-Setup testen
node test/test_database_setup.js

# Test-Benutzer erstellen
node test/create_test_users.js

# Frontend-Test öffnen
open test/test_frontend.html
```

## Entwicklung

### Neue Templates hinzufügen
1. Template in Admin Dashboard erstellen
2. Felder definieren (template_fields)
3. Content-Struktur anlegen (template_content)
4. Template aktivieren

### API-Integration
1. API-Konfiguration in admin_configs anlegen
2. Request-Template mit Platzhaltern definieren
3. Headers und Authentifizierung konfigurieren

## Deployment

Die Anwendung ist bereit für:
- Docker-Container Deployment
- Coolify Integration
- GitHub Actions CI/CD

## Lizenz

Entwickelt für City Challenge Berlin 2025