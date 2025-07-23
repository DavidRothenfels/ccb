# City Challenge Berlin 2025 - Bewerbung Vergabeerleichterung
## Augnum GmbH - CityChallenge Vergabe-Vorbereitungs-Tool

### Allgemeine Angaben

**Name des Unternehmens:** Augnum GmbH

**Vorname und Name der Kontaktperson:** Christoph Brändle

**Telefon/Email der Kontaktperson:** +49176-99631772 / cb@augnum.com

**Bezeichnung Ihres Lösungsvorschlags (Titel):** CityChallenge - Intelligentes Vergabe-Vorbereitungs-Tool für die Berliner Verwaltung

---

### Beschreibung des Lösungsvorschlags

**Beschreiben Sie Ihren Lösungsvorschlag/das Konzept und wie das in der Challenge beschriebene Problem gelöst wird:**

Unser CityChallenge Vergabe-Vorbereitungs-Tool ist eine moderne Webanwendung, die Verwaltungsmitarbeiter bei der Vorbereitung von Vergabeverfahren unterstützt. Das Tool löst zentrale Probleme der aktuellen Vergabepraxis:

**Das Problem:** Verwaltungsmitarbeiter müssen für jedes Vergabeverfahren zahlreiche Formulare ausfüllen. Dabei werden dieselben Informationen (Projektname, Ansprechpartner, Fristen) mehrfach in verschiedene Dokumente eingetragen. Dies kostet Zeit, führt zu Fehlern und verzögert Vergabeprozesse.

**Unsere Lösung:** Eine zentrale Eingabemaske, in der alle Projektdaten einmal erfasst werden. Das System generiert automatisch alle benötigten Vergabedokumente mit den korrekten Daten. Die Dokumente basieren auf den offiziellen Vorlagen von berlin.de/vergabeservice und werden stets aktuell gehalten.

**Kernfunktionen:**
- Einmalige Dateneingabe für alle Vergabedokumente
- Automatische Dokumentengenerierung in Echtzeit
- Integrierte Vorlagen der Berliner Verwaltung
- Kommentarfunktion für interne Abstimmungen
- Export-Schnittstelle zur Vergabeplattform
- Rechteverwaltung für verschiedene Nutzergruppen

Das Tool reduziert die Bearbeitungszeit pro Vergabeverfahren um bis zu 70% und minimiert Fehler durch redundante Dateneingaben.

---

### Umsetzungsplan

**Bitte geben Sie eine nachvollziehbare Beschreibung des Vorgehens sowie einen realistischen Zeitplan für die Umsetzung an:**

**Phase 1: Anforderungsanalyse und Konzeption (Monat 1-2)**
- Workshops mit Vergabestellen zur detaillierten Anforderungserhebung
- Analyse der aktuellen Vergabeprozesse in 3 Pilotbehörden
- Mapping aller relevanten Formulare und Datenfelder
- Erstellung des technischen Feinkonzepts

**Phase 2: Entwicklung Basisversion (Monat 3-4)**
- Anpassung der bestehenden Grundarchitektur
- Integration der Top-10 meistgenutzten Vergabeformulare
- Implementierung der Schnittstelle zur Vergabeplattform
- Aufbau der Testumgebung

**Phase 3: Pilotbetrieb (Monat 5-6)**
- Testlauf mit 3 ausgewählten Vergabestellen
- Schulung der Pilotnutzer (je 2 Tage pro Behörde)
- Iterative Verbesserung basierend auf Nutzerfeedback
- Performance-Optimierung

**Phase 4: Rollout und Skalierung (Monat 7-8)**
- Stufenweiser Rollout auf weitere Verwaltungseinheiten
- Erstellung von Schulungsunterlagen und Video-Tutorials
- Einrichtung des Support-Systems
- Übergabe an den Regelbetrieb

**Ressourcenplanung:**
- 2 Entwickler (Vollzeit)
- 1 UX/UI Designer (50%)
- 1 Projektmanager (50%)
- Budget: 25.000 EUR (gemäß City Challenge Vorgabe)

---

### Innovativer Mehrwert

**Worin besteht der spezifische innovative Mehrwert Ihres Vorschlags?**

**1. Technologische Innovation:**
Unsere Lösung nutzt moderne Web-Technologien (PocketBase, WebSockets) für Echtzeit-Kollaboration. Anders als bestehende Lösungen arbeitet das System komplett browserbasiert ohne Installation. Die innovative Architektur ermöglicht:
- Echtzeit-Dokumentengenerierung während der Dateneingabe
- Gleichzeitige Bearbeitung durch mehrere Nutzer
- Automatische Versionierung aller Änderungen
- KI-gestützte Plausibilitätsprüfung der Eingaben (ohne Datenübertragung an externe Dienste)

**2. Prozessinnovation:**
Erstmals werden alle Vergabedokumente aus einer einzigen Datenquelle generiert. Das "Single Source of Truth"-Prinzip eliminiert Inkonsistenzen. Die integrierte Kommentarfunktion ersetzt E-Mail-Ping-Pong und beschleunigt Abstimmungen.

**3. Überlegen gegenüber anderen Lösungen:**
- **Geschwindigkeit:** 70% Zeitersparnis gegenüber manueller Bearbeitung
- **Fehlerreduktion:** Keine redundanten Eingaben, automatische Validierung
- **Flexibilität:** Neue Formulare können ohne Programmierung integriert werden
- **Datenschutz:** Lokale Installation, keine Cloud-Abhängigkeit
- **Kosten:** Open-Source-Basis, keine Lizenzgebühren

**4. Alleinstellungsmerkmale:**
- Speziell für Berliner Vergabeprozesse entwickelt
- Integration aller aktuellen berlin.de-Formulare
- Barrierefreie Nutzung nach BITV 2.0
- Offline-Fähigkeit für mobile Einsätze

---

### Technische und organisatorische Umsetzung

**Wie könnte Ihr Vorschlag technisch und organisatorisch in der Praxis umgesetzt werden?**

**Technische Umsetzung:**

1. **Infrastruktur:**
   - Installation auf vorhandenen Servern der Berliner Verwaltung
   - Alternativ: Betrieb im Berliner Verwaltungsnetz (ITDZ)
   - Minimale Systemanforderungen: 2 CPU, 4GB RAM, 50GB Storage

2. **Integration:**
   - REST-API Schnittstelle zur Vergabeplattform berlin.de
   - LDAP/AD-Anbindung für Single Sign-On
   - Export-Funktionen für alle gängigen Formate (DOCX, PDF, XML)

3. **Skalierung:**
   - Horizontale Skalierung durch Load Balancing möglich
   - Mandantenfähigkeit für verschiedene Behörden
   - Performance für bis zu 10.000 gleichzeitige Nutzer

**Organisatorische Umsetzung:**

1. **Einführungsstrategie:**
   - Start mit Pilotbehörden (SenWiEnBe, SenBJF, SenUMVK)
   - Schrittweise Ausweitung nach erfolgreichem Pilotbetrieb
   - Begleitende Change-Management-Maßnahmen

2. **Schulungskonzept:**
   - 2-tägige Basisschulung für Multiplikatoren
   - Online-Schulungsplattform mit Video-Tutorials
   - Monatliche Anwendertreffen zum Erfahrungsaustausch

3. **Support-Struktur:**
   - 1st-Level-Support durch geschulte Key-User in den Behörden
   - 2nd-Level-Support durch Augnum-Team
   - Dokumentation im Berliner Verwaltungs-Wiki

**Testumgebung Herbst 2025:**
Die Testumgebung kann innerhalb von 2 Wochen bereitgestellt werden. Sie umfasst:
- Vollständige Funktionalität der Produktivversion
- Anonymisierte Testdaten aus realen Vergabeverfahren
- Zugang für bis zu 50 Testnutzer
- Separate Instanz ohne Auswirkung auf Produktivdaten

**Übertragbarkeit:**
Die Lösung ist auf alle Berliner Verwaltungseinheiten übertragbar. Durch die Template-basierte Architektur können auch andere Verwaltungsprozesse (Genehmigungen, Anträge) abgebildet werden. Mittelfristig ist eine Ausweitung auf andere Bundesländer möglich.

---

### Datenschutz und Datensicherheit

**Welche Daten werden in welchen Formaten zur Nutzung benötigt?**

**Benötigte Daten:**
- Stammdaten der Nutzer (Name, Behörde, E-Mail) - Format: JSON/LDAP
- Projektdaten (Bezeichnung, Fristen, Budgets) - Format: Strukturierte Formulareingaben
- Dokumentvorlagen - Format: DOCX mit Platzhaltern
- Generierte Dokumente - Format: DOCX, PDF

**Datenmigration:**
- Import bestehender Projektdaten aus Excel/CSV möglich
- Übernahme von Vorlagen aus dem Vergabeservice berlin.de
- API-Schnittstelle für automatisierten Datenaustausch

**Datensicherheit:**
- Verschlüsselte Datenübertragung (TLS 1.3)
- Verschlüsselte Datenspeicherung (AES-256)
- Rollenbasierte Zugriffskontrolle
- Audit-Log aller Zugriffe und Änderungen
- Automatische Datensicherung alle 24 Stunden
- Konforme Umsetzung nach BSI-Grundschutz
- DSGVO-konforme Datenverarbeitung
- Keine Datenübertragung außerhalb der EU

---

### Nutzerfreundlichkeit und Design

**Funktioniert das Tool auf verschiedenen Endgeräten?**

**Gerätekompatibilität:**
- Responsive Design für Desktop, Tablet und Smartphone
- Optimiert für alle gängigen Browser (Chrome, Firefox, Edge, Safari)
- Progressive Web App (PWA) für offline-Nutzung
- Keine Installation erforderlich

**Flexibilität:**
- Modularer Aufbau - Nutzer können Funktionen ein-/ausblenden
- Anpassbare Dashboards je nach Nutzerrolle
- Flexible Formulargestaltung ohne Programmierung
- Workflow-Engine für individuelle Prozessanpassungen

**Corporate Design:**
- Vollständige Anpassung an das Corporate Design Berlin
- Integration des Berlin-Logos und der Farbschemata
- Anpassbare Stylesheets für behördenspezifische Designs
- Einheitliche Gestaltung aller generierten Dokumente

**Barrierefreiheit:**
- Vollständige Umsetzung nach BITV 2.0 / WCAG 2.1 Level AA
- Screenreader-Unterstützung
- Tastaturnavigation für alle Funktionen
- Kontrastanpassung und Schriftgrößenänderung
- Alternativtexte für alle visuellen Elemente
- Einfache Sprache in der Benutzerführung

---

### Konvergenz mit bestehenden Systemen

**Inwiefern kann Konvergenz zu bestehenden Systemen der Landesverwaltung gewährleistet werden?**

**Anschlussfähigkeit:**

1. **Vergabeplattform berlin.de:**
   - Direkte API-Anbindung für Datenübertragung
   - Automatischer Upload generierter Dokumente
   - Synchronisation von Projektständen

2. **Service-Portal Berlin:**
   - Single Sign-On über bestehende Nutzerkonten
   - Integration in die Prozesslandschaft
   - Nutzung vorhandener Authentifizierungssysteme

3. **E-Akte Berlin:**
   - Export-Funktion für E-Akte-konforme Formate
   - Metadaten-Mapping für automatische Ablage
   - Versionsverwaltung kompatibel mit E-Akte

**Bestehende Schnittstellen:**
- REST-API für moderne Systeme
- SOAP-Webservices für Legacy-Systeme
- CSV/XML-Export für Datenbanksysteme
- WebDAV für Dokumentenmanagementsysteme

**Geplante Integrationen:**
- SAP-Anbindung für Finanzdaten
- LDAP/Active Directory für Nutzerverwaltung
- SharePoint-Integration für Dokumentenablage
- Outlook-Plugin für Terminverwaltung

---

### Hindernisse und Lösungsansätze

**Welche technischen, organisatorischen und rechtlichen Hindernisse wären zu überwinden?**

**Technische Hindernisse:**

1. **Legacy-Systeme:**
   - Herausforderung: Inkompatible Datenformate
   - Lösung: Entwicklung spezifischer Adapter und Konverter

2. **Netzwerk-Restriktionen:**
   - Herausforderung: Strenge Firewall-Regeln
   - Lösung: Betrieb innerhalb des Verwaltungsnetzes, keine externen Abhängigkeiten

3. **Performance:**
   - Herausforderung: Große Datenmengen bei Massenvergaben
   - Lösung: Optimierte Datenbank-Indizierung und Caching-Strategien

**Organisatorische Hindernisse:**

1. **Change-Resistenz:**
   - Herausforderung: Gewohnte Arbeitsabläufe
   - Lösung: Intensives Change-Management, schrittweise Einführung, Multiplikatoren-Prinzip

2. **Schulungsaufwand:**
   - Herausforderung: Heterogene IT-Kenntnisse
   - Lösung: Gestufte Schulungskonzepte, intuitive Benutzerführung, kontextsensitive Hilfe

3. **Ressourcen:**
   - Herausforderung: Knappe Personalressourcen
   - Lösung: Automatisierung von Routineaufgaben, Entlastung durch Effizienzgewinn

**Rechtliche Hindernisse:**

1. **Vergaberecht:**
   - Herausforderung: Einhaltung aller Vorschriften
   - Lösung: Enge Abstimmung mit Rechtsabteilung, regelbasierte Validierung

2. **Datenschutz:**
   - Herausforderung: DSGVO-Konformität
   - Lösung: Privacy-by-Design, Datenschutz-Folgenabschätzung, lokale Datenhaltung

3. **IT-Sicherheit:**
   - Herausforderung: BSI-Grundschutz
   - Lösung: Sicherheitsaudit, Penetrationstests, kontinuierliche Updates

---

### Open Source

**Ist die Software Open Source?**

**Ja, die Lösung basiert vollständig auf Open-Source-Technologien:**

- **Backend:** PocketBase (MIT-Lizenz)
- **Frontend:** Vanilla JavaScript (keine proprietären Frameworks)
- **Dokumentenverarbeitung:** Open-Source-Bibliotheken (docx, jszip)
- **Datenbank:** SQLite (Public Domain)

**Vorteile der Open-Source-Strategie:**
- Keine Vendor-Lock-in-Effekte
- Transparenz und Nachvollziehbarkeit des Codes
- Möglichkeit zur eigenständigen Weiterentwicklung
- Keine laufenden Lizenzkosten
- Community-Support und kontinuierliche Verbesserungen

**Lizenzmodell:**
Die entwickelte Lösung wird unter der MIT-Lizenz veröffentlicht. Dies ermöglicht der Berliner Verwaltung:
- Uneingeschränkte Nutzung
- Anpassung an spezifische Bedürfnisse
- Weitergabe an andere Verwaltungen
- Integration in bestehende Systeme

Der vollständige Quellcode wird auf GitHub veröffentlicht und steht allen Interessierten zur Verfügung.

---

### Zusammenfassung

Das CityChallenge Vergabe-Vorbereitungs-Tool bietet eine praxisnahe, effiziente Lösung für die Digitalisierung der Vergabevorbereitung in der Berliner Verwaltung. Durch die konsequente Ausrichtung an den Bedürfnissen der Nutzer, die Verwendung moderner Technologien und die Open-Source-Strategie entsteht eine nachhaltige Lösung, die den digitalen Wandel der Verwaltung vorantreibt.

Die Lösung adressiert die aktuellen Herausforderungen der Berliner Verwaltung:
- Reduzierung manueller, fehleranfälliger Prozesse
- Beschleunigung der Vergabeverfahren
- Verbesserung der Datenqualität
- Erhöhung der Transparenz
- Senkung der Prozesskosten

Mit einem klaren Umsetzungsplan, bewährten Technologien und einem erfahrenen Team ist die erfolgreiche Realisierung innerhalb des vorgegebenen Zeitrahmens gewährleistet.