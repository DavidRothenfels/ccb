# Differenz-Analyse: Gewünschter Zustand vs. Aktueller Status

## ✅ Bereits implementiert:

1. **Grundstruktur**
   - Separate App unter /citychallenge ✅
   - Eigene PocketBase-Instanz (Port 8091) ✅
   - Login/Dashboard im gleichen Design ✅
   - Collections: templates, projects, documents, comments, api_configs ✅

2. **Design**
   - Exaktes Layout-Matching mit 123vergabe ✅
   - Links-Rechts-Aufteilung vorbereitet ✅
   - Admin-User erstellt ✅

3. **Templates**
   - Template-Collection mit Feldern angelegt ✅
   - Basis für dynamische Formulare vorhanden ✅

## ❌ Noch fehlende Funktionen:

### 1. **Template-Download und Analyse**
```
SOLL: Templates von https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/ 
      herunterladen und analysieren
IST:  Nur Mock-Templates angelegt
TODO: - Echte DOCX-Downloads implementieren
      - Mammoth.js Integration für Analyse
      - Feld-Extraktion aus Word-Dokumenten
```

### 2. **Split-View Interface**
```
SOLL: Links Eingabefelder, rechts Ausgabe
IST:  Nur Projekt-Übersicht vorhanden
TODO: - Split-View für Projekt-Bearbeitung
      - Dynamische Formular-Generierung links
      - Live-Vorschau der Dokumente rechts
```

### 3. **Formular-System**
```
SOLL: Alle Felder mit Scrollbar, pro Projekt speicherbar
IST:  Nur statische Felder
TODO: - Dynamische Feld-Generierung aus Templates
      - Validierung (Zeichenbegrenzung etc.)
      - Projekt-bezogene Speicherung
```

### 4. **Kommentar-System**
```
SOLL: Admin-Kommentare per Popup, Kommentar-Übersicht als separates Dokument
IST:  Collection vorhanden, aber nicht implementiert
TODO: - Kommentar-Popup für Dokumente
      - Kommentar-Anzeige in Dokumenten
      - Kommentar-Übersichtsdokument
```

### 5. **DOCX-Export**
```
SOLL: Befüllte Templates als DOCX downloadbar
IST:  Nur Basis-Export vorhanden
TODO: - Template-basierter DOCX-Export
      - Platzhalter-Ersetzung
      - Kommentar-Integration
```

### 6. **API-Integration Berlin**
```
SOLL: Knopf für Datenübertragung an Vergabeplattform
IST:  api_configs Collection vorhanden, aber nicht implementiert
TODO: - API-Konfiguration UI
      - Export-Funktion
      - JSON-Mapping
```

### 7. **Vollständigkeitsprüfung**
```
SOLL: Automatische Prüfung auf Vollständigkeit
IST:  Nicht implementiert
TODO: - Pflichtfeld-Validierung
      - Fortschrittsanzeige
      - Warnungen bei fehlenden Daten
```

## 📋 Implementierungs-Plan:

### Phase 1: Template-System (Priorität: HOCH)
1. Download echter Berlin-Templates
2. Mammoth.js Integration
3. Feld-Extraktion und Speicherung
4. Template-Verwaltung UI

### Phase 2: Split-View Editor (Priorität: HOCH)
1. Projekt-Edit View mit Split-Layout
2. Dynamische Formular-Generierung
3. Live-Dokument-Vorschau
4. Speicher-Logik

### Phase 3: Kommentar-System (Priorität: MITTEL)
1. Kommentar-Popup
2. Dokument-Bezug
3. Kommentar-Übersicht
4. Export als separates Dokument

### Phase 4: Export & API (Priorität: MITTEL)
1. DOCX-Export mit Platzhaltern
2. API-Konfigurations-UI
3. Berlin-Vergabeplattform Integration
4. Batch-Export aller Dokumente

### Phase 5: Validierung & Polish (Priorität: NIEDRIG)
1. Vollständigkeitsprüfung
2. Fortschrittsanzeige
3. Fehlerbehandlung
4. UI-Verbesserungen

## 🎯 Nächste Schritte:
1. Template-Download von Berlin-Website implementieren
2. Split-View für Projekt-Bearbeitung erstellen
3. Dynamische Formular-Generierung basierend auf Templates
4. Kommentar-System aktivieren