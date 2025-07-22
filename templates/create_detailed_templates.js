const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8091');

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
    schwellenwert: {
        type: 'select',
        label: 'Schwellenwert',
        required: true,
        section: 'verfahren',
        options: ['Oberschwellig', 'Unterschwellig']
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
    option_verlaengerung: {
        type: 'checkbox',
        label: 'Option auf Verlängerung',
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
    
    // Eignungskriterien
    eignung_fachkunde: {
        type: 'checkbox',
        label: 'Nachweis der Fachkunde erforderlich',
        required: false,
        section: 'eignung'
    },
    eignung_leistungsfaehigkeit: {
        type: 'checkbox',
        label: 'Nachweis der Leistungsfähigkeit erforderlich',
        required: false,
        section: 'eignung'
    },
    eignung_zuverlaessigkeit: {
        type: 'checkbox',
        label: 'Nachweis der Zuverlässigkeit erforderlich',
        required: false,
        section: 'eignung'
    },
    eignung_referenzen: {
        type: 'number',
        label: 'Anzahl erforderlicher Referenzen',
        required: false,
        section: 'eignung',
        min: 0,
        max: 10
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
    zuschlag_qualitaet_gewichtung: {
        type: 'number',
        label: 'Gewichtung Qualität (%)',
        required: false,
        section: 'zuschlag',
        min: 0,
        max: 100
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
    },
    elektronische_signatur: {
        type: 'checkbox',
        label: 'Elektronische Signatur erforderlich',
        required: false,
        section: 'sonstiges'
    },
    vergabeunterlagen_url: {
        type: 'url',
        label: 'URL zu den Vergabeunterlagen',
        required: false,
        section: 'sonstiges'
    }
};

async function createTemplates() {
    try {
        // Admin login
        await pb.collection('users').authWithPassword('admin@citychallenge.berlin', 'citychallenge2025');
        console.log('✅ Logged in as admin');
        
        // Template configurations
        const templates = [
            {
                name: 'VgV - Vergabe von Liefer- und Dienstleistungen (EU)',
                category: 'VgV',
                original_filename: 'vgv_template.docx',
                active: true,
                template_fields: Object.fromEntries(
                    Object.entries(vergabeFelder).filter(([key, field]) => 
                        !['eignung_referenzen'].includes(key) // VgV specific exclusions
                    )
                ),
                description: 'Vorlage für Vergaben oberhalb der EU-Schwellenwerte'
            },
            {
                name: 'UVgO - Unterschwellige Vergabe',
                category: 'UVgO',
                original_filename: 'uvgo_template.docx',
                active: true,
                template_fields: Object.fromEntries(
                    Object.entries(vergabeFelder).filter(([key, field]) => 
                        !['cpv_code', 'elektronische_signatur'].includes(key) // UVgO specific exclusions
                    )
                ),
                description: 'Vorlage für Vergaben unterhalb der EU-Schwellenwerte'
            },
            {
                name: 'Freiberufliche Leistungen',
                category: 'Freiberuflich',
                original_filename: 'freiberuflich_template.docx',
                active: true,
                template_fields: Object.fromEntries(
                    Object.entries(vergabeFelder).filter(([key, field]) => 
                        ['vergabestelle', 'auftrag', 'wert', 'fristen'].includes(field.section)
                    )
                ),
                description: 'Vorlage für freiberufliche Leistungen (Architekten, Ingenieure, etc.)'
            },
            {
                name: 'VOB - Bauleistungen',
                category: 'VOB',
                original_filename: 'vob_template.docx',
                active: true,
                template_fields: {
                    ...vergabeFelder,
                    // Zusätzliche VOB-spezifische Felder
                    bauzeit_kalenderwochen: {
                        type: 'number',
                        label: 'Bauzeit in Kalenderwochen',
                        required: true,
                        section: 'vob_spezifisch'
                    },
                    sicherheitsleistung_prozent: {
                        type: 'number',
                        label: 'Sicherheitsleistung (%)',
                        required: true,
                        section: 'vob_spezifisch',
                        default: 5
                    }
                },
                description: 'Vorlage für Bauleistungen nach VOB'
            }
        ];
        
        // Delete existing templates
        try {
            const existing = await pb.collection('templates').getList(1, 100);
            for (const template of existing.items) {
                await pb.collection('templates').delete(template.id);
                console.log(`Deleted existing template: ${template.name}`);
            }
        } catch (e) {
            console.log('No existing templates to delete');
        }
        
        // Create new templates
        for (const template of templates) {
            const created = await pb.collection('templates').create(template);
            console.log(`✅ Created template: ${template.name}`);
        }
        
        console.log('\n📋 Template Summary:');
        console.log(`Total templates created: ${templates.length}`);
        console.log(`Total unique fields: ${Object.keys(vergabeFelder).length}`);
        
        // Create field sections info
        const sections = {
            vergabestelle: 'Angaben zur Vergabestelle',
            auftrag: 'Auftragsinformationen',
            verfahren: 'Verfahrensart',
            wert: 'Wertangaben und Laufzeit',
            fristen: 'Fristen',
            eignung: 'Eignungskriterien',
            zuschlag: 'Zuschlagskriterien',
            sonstiges: 'Sonstige Angaben',
            vob_spezifisch: 'VOB-spezifische Angaben'
        };
        
        console.log('\n📂 Field Sections:');
        Object.entries(sections).forEach(([key, label]) => {
            const fieldCount = Object.values(vergabeFelder).filter(f => f.section === key).length;
            console.log(`- ${label}: ${fieldCount} fields`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
createTemplates();