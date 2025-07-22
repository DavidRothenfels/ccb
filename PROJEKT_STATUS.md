# CityChallenge Vergabe-Tool - Projekt Status

## 🚀 Installation & Start

```bash
cd /mnt/c/Users/danie/claude/code/citychallenge
./pocketbase serve --http=0.0.0.0:8091
```

Dann öffnen Sie: http://localhost:8091

## 🔑 Test-Zugangsdaten

Erstellen Sie Test-Daten über: http://localhost:8091/test/create_test_data.html

- **Benutzer**: test@citychallenge.de / test12345
- **Admin**: admin@citychallenge.de / admin12345

## ✅ Implementierte Features

### 1. Split-View Editor
- **Links**: Dynamische Formular-Generierung basierend auf Templates
- **Rechts**: Live-Dokumentvorschau mit Echtzeit-Updates
- Alle Feldtypen implementiert (Text, Datum, Währung, Checkbox, Select)
- Felder nach Sektionen gruppiert mit Scrollbar

### 2. Projekt-Management
- Projekte anlegen, bearbeiten und löschen
- Projekte werden nach Benutzer gefiltert
- Status-Anzeige und Metadaten

### 3. Speicher-Logik
- Formulardaten werden in der Datenbank gespeichert
- Dokumente werden automatisch generiert
- Templates nach Schwellenwert gefiltert (UVgO/VgV)

### 4. Kommentar-System
- Nur für Admin-User sichtbar
- Kommentare mit Feldbezug und Status
- Admin-Übersicht für alle Kommentare

### 5. DOCX-Export
- Einzelne Dokumente als DOCX
- "Alle herunterladen" als ZIP
- Professionelle Formatierung

### 6. API-Integration
- Admin-Konfiguration für externe APIs
- JSON-Mapping mit Platzhaltern
- "An Vergabeplattform senden" Funktion

## 🛠️ Technischer Stack

- **Backend**: PocketBase v0.28.4 (Port 8091)
- **Frontend**: Vanilla JavaScript
- **Datenbank**: SQLite
- **Dokumente**: docx.js für DOCX-Generierung

## 📁 Wichtige Dateien

- `/pb_public/index.html` - Hauptanwendung
- `/pb_public/app.js` - JavaScript-Logik
- `/pb_public/styles.css` - Styling
- `/pb_public/docx-generator.js` - DOCX-Export
- `/pb_migrations/` - Datenbankmigrationen
- `/templates/` - Dokumentvorlagen

## 🐛 Bekannte Probleme & Lösungen

1. **Projekte werden nicht angezeigt**
   - Lösung: Filter nach User-ID implementiert
   - Projekte werden jetzt korrekt nach Benutzer gefiltert

2. **Port-Konflikt**
   - PocketBase läuft auf Port 8091 (nicht 8090)
   - app.js wurde entsprechend angepasst

3. **Leere form_data**
   - Placeholder hinzugefügt für leere Formulare
   - Verhindert Fehler beim Speichern

## 🎯 Nächste Schritte

1. Weitere Templates aus berlin.de/vergabeservice importieren
2. Erweiterte Validierung für Formularfelder
3. PDF-Export zusätzlich zu DOCX
4. Versionierung von Dokumenten
5. E-Mail-Benachrichtigungen

## 📝 Hinweise

- PocketBase Admin-Panel: http://localhost:8091/_/
- Logs: `/pocketbase.log`
- Datenbank: `/pb_data/data.db`
- Nach Hook-Änderungen PocketBase neustarten!