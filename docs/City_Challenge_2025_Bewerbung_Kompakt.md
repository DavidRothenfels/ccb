# City Challenge Berlin 2025 - Bewerbung
## Digitale Vergabevorbereitung für Berliner Behörden

### Kontaktdaten
**Unternehmen:** Augnum GmbH  
**Ansprechpartner:** Christoph Brändle  
**Kontakt:** +49176-99631772 / cb@augnum.com  
**Lösungstitel:** Vergabe-Vorbereitungs-Tool Berlin

---

### Was braucht die Behörde? Unser Lösungsansatz

**Das konkrete Problem in Berliner Vergabestellen:**
Mitarbeiter füllen für jedes Vergabeverfahren 10-15 verschiedene Formulare aus. Die gleichen Daten – Projektbezeichnung, Ansprechpartner, CPV-Codes, Fristen – werden dabei immer wieder neu eingetippt. Das führt zu Tippfehlern, Inkonsistenzen und verschwendet wertvolle Arbeitszeit. Ein einfaches Bauvergabeverfahren benötigt durchschnittlich 4 Stunden reine Tipparbeit.

**Unsere Lösung:**
Eine Eingabemaske. Alle Formulare. Die Mitarbeiter geben die Projektdaten genau einmal ein. Das System füllt automatisch alle notwendigen Vergabeformulare mit diesen Daten. Die Dokumente entsprechen 1:1 den offiziellen Vorlagen von berlin.de/vergabeservice. Änderungen werden in Echtzeit in alle Dokumente übernommen. Fertig.

---

### Zeitplan für die Umsetzung

**Start sofort - Erste Ergebnisse nach 8 Wochen:**

**Wochen 1-2:** Analyse der Top-10 Vergabeformulare Ihrer Behörde  
**Wochen 3-4:** Anpassung unserer bestehenden Software an Ihre Formulare  
**Wochen 5-6:** Installation auf Ihrem Server, Schulung der ersten Nutzer  
**Wochen 7-8:** Testbetrieb mit echten Vergabeverfahren, Feinjustierung  

**Ab Woche 9:** Produktivbetrieb und schrittweise Erweiterung auf weitere Formulare

---

### Der innovative Kern

**Was macht unsere Lösung besonders?**

Wir haben das Rad nicht neu erfunden. Wir nutzen bewährte Open-Source-Technologie (PocketBase) und haben sie für Vergabeverfahren optimiert. Das Innovative liegt in der radikalen Vereinfachung: Statt 15 Formulare einzeln zu bearbeiten, füllen Ihre Mitarbeiter ein intelligentes Webformular aus. Die Dokumentengenerierung passiert im Hintergrund. Ihre Mitarbeiter sehen sofort das Ergebnis und können nachbessern.

**Der entscheidende Unterschied:**
- Keine Cloud, keine externen Server - alles läuft in Ihrem Haus
- Keine Schulung in neuer Software - die Oberfläche ist selbsterklärend
- Keine Prozessänderung - am Ende stehen die gewohnten Dokumente
- Kein Vendor-Lock-in - Sie bekommen den kompletten Quellcode

---

### So arbeiten Ihre Mitarbeiter mit dem System

**Der Arbeitsablauf - in 5 Minuten erklärt:**

1. **Projekt anlegen**: Klick auf "Neues Vergabeverfahren". Ein Formular öffnet sich.

2. **Basisdaten eingeben**: Die Mitarbeiter sehen ein übersichtliches Formular mit allen relevanten Feldern:
   - Projektbezeichnung (einmal eingeben - erscheint in allen Dokumenten)
   - Art des Verfahrens (Dropdown-Menü mit allen Verfahrensarten)
   - Geschätzter Auftragswert
   - CPV-Codes (mit Suchfunktion)
   - Fristen (mit Kalender-Widget)
   - Ansprechpartner (aus Adressbuch wählbar)

3. **Live-Vorschau**: Während der Eingabe sehen die Mitarbeiter rechts im Bildschirm, wie die Dokumente entstehen. Jede Änderung wird sofort sichtbar. Tippfehler? Sofort korrigiert. Falsches Datum? Ein Klick, und alle Dokumente sind aktualisiert.

4. **Dokumentenprüfung**: Ein Klick auf ein Dokument in der Vorschau öffnet es in voller Größe. Die Mitarbeiter können durch alle generierten Formulare blättern. Alles korrekt? Dann "Dokumente finalisieren".

5. **Export und Weiterverarbeitung**: Die fertigen Dokumente können einzeln oder als Paket heruntergeladen werden. Wahlweise als DOCX zum Nachbearbeiten oder als PDF für die Ablage.

**Die Benutzeroberfläche - durchdacht einfach:**

Der Bildschirm ist zweigeteilt:
- **Links**: Das Eingabeformular. Klar strukturiert, mit Hilfebuttons bei jedem Feld.
- **Rechts**: Die Dokumentenvorschau. Immer sichtbar, immer aktuell.

Oben eine schlichte Menüleiste:
- Meine Projekte (Übersicht aller Vergabeverfahren)
- Neues Verfahren
- Vorlagen (für wiederkehrende Projekte)
- Hilfe

**Was Ihre Mitarbeiter besonders schätzen werden:**
- **Zwischenspeicherung**: Automatisch alle 30 Sekunden. Nie wieder Datenverlust.
- **Validierung**: Das System prüft Plausibilität. Vergabefrist vor heute? Rote Warnung.
- **Vorlagenverwaltung**: Häufige Vergaben als Vorlage speichern und wiederverwenden.
- **Kommentarfunktion**: Kollegen können Anmerkungen direkt am Dokument hinterlassen.
- **Versionierung**: Jede Änderung wird protokolliert. Wer hat wann was geändert?

### Praktische Umsetzung mit Ihrer IT

**Technische Integration - minimal invasiv:**

Unsere Software läuft auf einem einzelnen Server in Ihrem Netzwerk. Systemanforderungen: Ein Standard-Server mit 4GB RAM reicht für 100 gleichzeitige Nutzer. Die Software wird als einzelne ausführbare Datei geliefert. Installation in 30 Minuten.

**Was Ihre IT-Abteilung wissen muss:**
- Läuft auf Windows oder Linux
- Nutzt Port 8091 (anpassbar)
- SQLite-Datenbank (keine separate Datenbankinstallation)
- Optional: Active Directory Anbindung für Single Sign-On
- Backup: Einfache Dateisicherung reicht

**Organisatorisch:**
Wir starten mit einer Abteilung. Die dortigen Mitarbeiter werden zu Multiplikatoren. Nach erfolgreichem Test rollen wir auf weitere Abteilungen aus. Ihre Vergabeprozesse bleiben unverändert - nur die Dokumentenerstellung wird effizienter.

---

### Datenschutz konkret

**Welche Daten verarbeitet das System?**
- Projektdaten: Bezeichnungen, Fristen, Ansprechpartner
- Keine personenbezogenen Daten von Bietern
- Keine Verbindung zum Internet notwendig
- Alle Daten bleiben auf Ihrem Server

**Sicherheit:**
- Verschlüsselte Verbindungen (HTTPS)
- Rollenbasierte Rechteverwaltung
- Audit-Log aller Änderungen
- Tägliche Backups durch Ihre IT

**DSGVO-Konformität:** Da keine personenbezogenen Daten Dritter verarbeitet werden und alles lokal läuft, gibt es keine DSGVO-Probleme.

---

### Bedienbarkeit für alle

**Das System funktioniert überall:**
- Browser-basiert: Chrome, Firefox, Edge - egal
- Responsive: Desktop, Tablet, sogar Smartphone
- Barrierefrei: Screenreader-kompatibel, Tastaturnavigation
- Corporate Design Berlin: Bereits integriert

**Für Ihre Mitarbeiter bedeutet das:**
Kein Download, keine Installation. Browser öffnen, einloggen, loslegen. Die Oberfläche erklärt sich selbst. Wer ein Online-Formular ausfüllen kann, kann auch unser System bedienen.

---

### Anbindung an Ihre Systemlandschaft

**Was wir heute schon können:**
- Export als DOCX und PDF
- Strukturierte Daten als JSON/XML für Ihre Vergabeplattform
- Import bestehender Projektdaten aus Excel

**Was wir bei Bedarf ergänzen:**
- Direkte API-Anbindung an berlin.de/vergabeservice
- Integration in Ihre E-Akte
- SAP-Schnittstelle für Finanzdaten

Die Basis-Funktionalität läuft völlig autark. Integrationen bauen wir nach Ihrem konkreten Bedarf.

---

### Realistische Hindernisse und Lösungen

**Was könnte schiefgehen?**

1. **"Unsere IT erlaubt keine neue Software"**  
   Lösung: Wir installieren nichts im klassischen Sinn. Eine einzelne .exe-Datei, die auf einem bestehenden Server läuft. Keine Registry-Einträge, keine versteckten Komponenten.

2. **"Die Mitarbeiter wollen ihre Excel-Tabellen behalten"**  
   Lösung: Können sie. Wir importieren Excel-Daten. Der Umstieg ist freiwillig. Wer die Zeitersparnis einmal erlebt hat, will nicht zurück.

3. **"Was ist mit speziellen Vergabeformularen?"**  
   Lösung: Neue Formulare integrieren wir innerhalb von 2 Tagen. Sie schicken uns die Vorlage, wir bauen sie ein.

---

### Open Source - Ihre Garantie für die Zukunft

**Warum Open Source für die Verwaltung wichtig ist:**

Sie bekommen nicht nur die Software, sondern auch den kompletten Quellcode. Das bedeutet: Selbst wenn wir als Firma morgen nicht mehr existieren, läuft Ihre Software weiter. Ihre IT kann Anpassungen selbst vornehmen. Sie können den Code prüfen lassen. Sie können die Software an andere Behörden weitergeben.

**Unsere Open-Source-Komponenten:**
- PocketBase (Backend) - MIT-Lizenz
- SQLite (Datenbank) - Public Domain  
- JavaScript (Frontend) - Standardtechnologie

Keine versteckten Kosten, keine Lizenzgebühren, keine Abhängigkeiten.

---

### Warum wir? Warum jetzt?

Die Berliner Verwaltung braucht keine weiteren Großprojekte, die in 5 Jahren vielleicht funktionieren. Sie brauchen praktische Lösungen, die morgen die Arbeit erleichtern. 

Unser Vergabe-Vorbereitungs-Tool ist keine Vision, sondern funktionierende Software. In 8 Wochen sparen Ihre Mitarbeiter 70% ihrer Zeit bei der Dokumentenerstellung. Die gewonnene Zeit können sie für wichtigere Aufgaben nutzen - zum Beispiel die inhaltliche Prüfung der Vergabeunterlagen.

**Die Investition von 25.000 EUR amortisiert sich durch die Zeitersparnis in weniger als 6 Monaten.**

Lassen Sie uns gemeinsam beweisen, dass Digitalisierung in der Verwaltung funktioniert - pragmatisch, schnell und nutzerorientiert.

---

### Zusammengefasste Antworten für das Bewerbungsformular

**Bezeichnung des Lösungsvorschlags:** Vergabe-Vorbereitungs-Tool Berlin

**Problembeschreibung und Lösung:** 
Berliner Vergabestellen verschwenden täglich Stunden mit redundanter Dateneingabe in 10-15 verschiedene Formulare. Unsere browserbasierte Lösung bietet eine zentrale Eingabemaske, die automatisch alle Vergabedokumente generiert. Einmal eingeben, alle Dokumente fertig. 70% Zeitersparnis, keine Tippfehler mehr.

**Innovativer Mehrwert:**
Radikal vereinfachte Bedienung statt komplexer Systeme. Live-Vorschau während der Eingabe. Lokale Installation statt Cloud. Open Source statt Vendor-Lock-in. Bestehende Prozesse bleiben erhalten - nur effizienter.

**Technische Umsetzung:**
Single-Server-Installation (30 Minuten). Läuft im Behördennetzwerk. Browser als einzige Anforderung. Optional: Active Directory, API zu Vergabeplattform. Testumgebung in 2 Wochen verfügbar.

**Datenschutz:**
Alle Daten bleiben lokal. Keine Cloud, kein Internet nötig. Verschlüsselte Speicherung, rollenbasierte Rechte, Audit-Log. DSGVO-konform durch lokale Verarbeitung.

**Barrierefreiheit:**
BITV 2.0 konform. Screenreader-kompatibel, Tastaturnavigation, Corporate Design Berlin integriert. Responsive für alle Endgeräte.

**Integration:**
Export als DOCX/PDF/JSON/XML. Bei Bedarf: APIs zu Vergabeplattform, E-Akte, SAP. Basis funktioniert autark.

**Open Source:** Ja - MIT-Lizenz. Kompletter Quellcode wird übergeben.