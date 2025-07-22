migrate((app) => {
    // Typische Felder in Vergabedokumenten
    const vergabeFelder = {
        // Vergabestelle
        vergabestelle_name: {
            type: 'text',
            label: 'Name der Vergabestelle',
            required: true,
            section: 'vergabestelle',
            placeholder: 'z.B. Senatsverwaltung für...'
        },
        vergabestelle_anschrift: {
            type: 'textarea',
            label: 'Anschrift der Vergabestelle',
            required: true,
            section: 'vergabestelle',
            placeholder: 'Straße, PLZ, Ort'
        },
        vergabestelle_ansprechpartner: {
            type: 'text',
            label: 'Ansprechpartner/in',
            required: true,
            section: 'vergabestelle'
        },
        vergabestelle_telefon: {
            type: 'phone',
            label: 'Telefonnummer',
            required: true,
            section: 'vergabestelle'
        },
        vergabestelle_email: {
            type: 'email',
            label: 'E-Mail-Adresse',
            required: true,
            section: 'vergabestelle'
        },
        
        // Auftragsinformationen
        auftrag_bezeichnung: {
            type: 'text',
            label: 'Auftragsbezeichnung',
            required: true,
            section: 'auftrag',
            maxLength: 255
        },
        auftrag_beschreibung: {
            type: 'textarea',
            label: 'Auftragsbeschreibung',
            required: true,
            section: 'auftrag',
            maxLength: 2000
        },
        vergabenummer: {
            type: 'text',
            label: 'Vergabenummer',
            required: true,
            section: 'auftrag',
            pattern: '^[A-Z0-9-/]+$'
        },
        cpv_code: {
            type: 'text',
            label: 'CPV-Code',
            required: false,
            section: 'auftrag',
            placeholder: 'z.B. 72000000-5'
        },
        
        // Vergabeart
        vergabeart: {
            type: 'select',
            label: 'Vergabeart',
            required: true,
            section: 'verfahren',
            options: ['Öffentliche Ausschreibung', 'Beschränkte Ausschreibung', 'Verhandlungsvergabe', 'Wettbewerblicher Dialog']
        },
        leistungsart: {
            type: 'select',
            label: 'Art der Leistung',
            required: true,
            section: 'verfahren',
            options: ['Liefer', 'Dienst', 'Bau', 'Freiberuflich']
        },
        
        // Wertangaben
        geschaetzter_auftragswert: {
            type: 'currency',
            label: 'Geschätzter Auftragswert (netto)',
            required: true,
            section: 'wert'
        },
        vertragslaufzeit_beginn: {
            type: 'date',
            label: 'Vertragsbeginn',
            required: true,
            section: 'wert'
        },
        vertragslaufzeit_ende: {
            type: 'date',
            label: 'Vertragsende',
            required: false,
            section: 'wert'
        },
        
        // Fristen
        angebotsfrist_datum: {
            type: 'date',
            label: 'Angebotsfrist - Datum',
            required: true,
            section: 'fristen'
        },
        angebotsfrist_uhrzeit: {
            type: 'time',
            label: 'Angebotsfrist - Uhrzeit',
            required: true,
            section: 'fristen'
        },
        bindefrist: {
            type: 'number',
            label: 'Bindefrist (Tage)',
            required: true,
            section: 'fristen',
            default: 30
        },
        
        // Zuschlagskriterien
        zuschlag_preis_gewichtung: {
            type: 'number',
            label: 'Gewichtung Preis (%)',
            required: true,
            section: 'zuschlag',
            min: 0,
            max: 100,
            default: 70
        },
        
        // Sonstiges
        nebenangebote_zugelassen: {
            type: 'checkbox',
            label: 'Nebenangebote zugelassen',
            required: false,
            section: 'sonstiges'
        },
        bietergemeinschaften_zugelassen: {
            type: 'checkbox',
            label: 'Bietergemeinschaften zugelassen',
            required: false,
            section: 'sonstiges',
            default: true
        }
    };
    
    // Create templates
    const templates = [
        {
            name: 'VgV - Vergabe von Liefer- und Dienstleistungen (EU)',
            category: 'VgV',
            original_filename: 'vgv_template.docx',
            active: true,
            template_fields: vergabeFelder,
            template_content: `# Vergabevermerk - VgV

## Vergabestelle
{{vergabestelle_name}}
{{vergabestelle_anschrift}}

Ansprechpartner: {{vergabestelle_ansprechpartner}}
Telefon: {{vergabestelle_telefon}}
E-Mail: {{vergabestelle_email}}

## Auftragsinformationen
**Auftragsbezeichnung:** {{auftrag_bezeichnung}}
**Vergabenummer:** {{vergabenummer}}
**CPV-Code:** {{cpv_code}}

### Beschreibung
{{auftrag_beschreibung}}

## Verfahren
**Vergabeart:** {{vergabeart}}
**Art der Leistung:** {{leistungsart}}

## Wertangaben
**Geschätzter Auftragswert (netto):** {{geschaetzter_auftragswert}} €
**Vertragsbeginn:** {{vertragslaufzeit_beginn}}
**Vertragsende:** {{vertragslaufzeit_ende}}

## Fristen
**Angebotsfrist:** {{angebotsfrist_datum}} um {{angebotsfrist_uhrzeit}} Uhr
**Bindefrist:** {{bindefrist}} Tage

## Zuschlagskriterien
**Preis:** {{zuschlag_preis_gewichtung}}%

## Sonstiges
**Nebenangebote zugelassen:** {{nebenangebote_zugelassen}}
**Bietergemeinschaften zugelassen:** {{bietergemeinschaften_zugelassen}}`,
            description: 'Vorlage für Vergaben oberhalb der EU-Schwellenwerte'
        },
        {
            name: 'UVgO - Unterschwellige Vergabe',
            category: 'UVgO',
            original_filename: 'uvgo_template.docx',
            active: true,
            template_fields: Object.fromEntries(
                Object.entries(vergabeFelder).filter(([key, field]) => 
                    !['cpv_code'].includes(key) // UVgO specific exclusions
                )
            ),
            template_content: `# Vergabevermerk - UVgO

## Vergabestelle
{{vergabestelle_name}}
{{vergabestelle_anschrift}}

Ansprechpartner: {{vergabestelle_ansprechpartner}}
Telefon: {{vergabestelle_telefon}}
E-Mail: {{vergabestelle_email}}

## Auftragsinformationen
**Auftragsbezeichnung:** {{auftrag_bezeichnung}}
**Vergabenummer:** {{vergabenummer}}

### Beschreibung
{{auftrag_beschreibung}}

## Verfahren
**Vergabeart:** {{vergabeart}}
**Art der Leistung:** {{leistungsart}}

## Wertangaben
**Geschätzter Auftragswert (netto):** {{geschaetzter_auftragswert}} €
**Vertragsbeginn:** {{vertragslaufzeit_beginn}}
**Vertragsende:** {{vertragslaufzeit_ende}}

## Fristen
**Angebotsfrist:** {{angebotsfrist_datum}} um {{angebotsfrist_uhrzeit}} Uhr
**Bindefrist:** {{bindefrist}} Tage

## Zuschlagskriterien
**Preis:** {{zuschlag_preis_gewichtung}}%

## Sonstiges
**Nebenangebote zugelassen:** {{nebenangebote_zugelassen}}
**Bietergemeinschaften zugelassen:** {{bietergemeinschaften_zugelassen}}`,
            description: 'Vorlage für Vergaben unterhalb der EU-Schwellenwerte'
        }
    ];
    
    const templatesCollection = app.findCollectionByNameOrId("templates");
    
    templates.forEach(template => {
        const record = new Record(templatesCollection, template);
        app.save(record);
        console.log(`Created template: ${template.name}`);
    });
    
}, (app) => {
    // Rollback
    try {
        const templates = app.findRecordsByFilter("templates", "category = 'VgV' || category = 'UVgO'", "", 100);
        templates.forEach(template => {
            app.delete(template);
        });
    } catch (e) {
        // Ignore errors during rollback
    }
});