const PocketBase = require('pocketbase/cjs')
const fs = require('fs').promises
const path = require('path')

async function createRealTemplates() {
  const pb = new PocketBase('http://localhost:8091')
  
  console.log('Creating real templates from analyzed documents...\n')
  
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword('admin@citychallenge.berlin', 'citychallenge2025')
    console.log('✓ Admin authenticated')
    
    // Load analyzed template data
    const analysisPath = path.join(__dirname, 'wirt-1231-eu-p-aufforderung_analysis.json')
    const templateData = JSON.parse(await fs.readFile(analysisPath, 'utf-8'))
    
    // Enhanced template with complete field structure
    const vgvTemplate = {
      name: 'Aufforderung zur Interessensbestätigung / zum Teilnahmeantrag (VgV)',
      category: 'VgV',
      original_filename: 'wirt-1231-eu-p-aufforderung.docx',
      active: true,
      template_fields: {
        // Vergabestelle
        vergabestelle_name: {
          type: 'text',
          label: 'Vergabestelle - Name',
          required: true,
          max_length: 255,
          section: 'vergabestelle'
        },
        vergabestelle_strasse: {
          type: 'text',
          label: 'Vergabestelle - Straße',
          required: true,
          max_length: 255,
          section: 'vergabestelle'
        },
        vergabestelle_plz: {
          type: 'text',
          label: 'Vergabestelle - PLZ',
          required: true,
          max_length: 10,
          section: 'vergabestelle'
        },
        vergabestelle_ort: {
          type: 'text',
          label: 'Vergabestelle - Ort',
          required: true,
          max_length: 100,
          section: 'vergabestelle'
        },
        vergabestelle_telefon: {
          type: 'text',
          label: 'Vergabestelle - Telefon',
          required: false,
          max_length: 50,
          section: 'vergabestelle'
        },
        vergabestelle_fax: {
          type: 'text',
          label: 'Vergabestelle - Fax',
          required: false,
          max_length: 50,
          section: 'vergabestelle'
        },
        vergabestelle_email: {
          type: 'email',
          label: 'Vergabestelle - E-Mail',
          required: true,
          max_length: 255,
          section: 'vergabestelle'
        },
        
        // Empfänger
        empfaenger_name: {
          type: 'text',
          label: 'Empfänger - Firma/Name',
          required: true,
          max_length: 255,
          section: 'empfaenger'
        },
        empfaenger_strasse: {
          type: 'text',
          label: 'Empfänger - Straße',
          required: true,
          max_length: 255,
          section: 'empfaenger'
        },
        empfaenger_plz: {
          type: 'text',
          label: 'Empfänger - PLZ',
          required: true,
          max_length: 10,
          section: 'empfaenger'
        },
        empfaenger_ort: {
          type: 'text',
          label: 'Empfänger - Ort',
          required: true,
          max_length: 100,
          section: 'empfaenger'
        },
        
        // Projekt-Informationen
        vergabenummer: {
          type: 'text',
          label: 'Vergabenummer',
          required: true,
          max_length: 100,
          section: 'projekt'
        },
        massnahmenummer: {
          type: 'text',
          label: 'Maßnahmenummer',
          required: false,
          max_length: 100,
          section: 'projekt'
        },
        massnahme: {
          type: 'text',
          label: 'Maßnahme',
          required: true,
          max_length: 500,
          section: 'projekt'
        },
        leistung_cpv: {
          type: 'text',
          label: 'Leistung/CPV-Code',
          required: true,
          max_length: 500,
          section: 'projekt'
        },
        
        // Vergabeart
        vergabeart: {
          type: 'select',
          label: 'Vergabeart',
          required: true,
          options: [
            'nicht offenes Verfahren',
            'Verhandlungsverfahren mit Teilnahmewettbewerb',
            'Verhandlungsverfahren ohne Teilnahmewettbewerb',
            'Wettbewerblicher Dialog',
            'Sonstige'
          ],
          section: 'verfahren'
        },
        vergabeart_sonstige: {
          type: 'text',
          label: 'Sonstige Vergabeart (falls ausgewählt)',
          required: false,
          max_length: 255,
          section: 'verfahren'
        },
        
        // Fristen
        teilnahmefrist_datum: {
          type: 'date',
          label: 'Ablauf Teilnahmefrist - Datum',
          required: true,
          section: 'fristen'
        },
        teilnahmefrist_uhrzeit: {
          type: 'time',
          label: 'Ablauf Teilnahmefrist - Uhrzeit',
          required: true,
          section: 'fristen'
        },
        
        // Auftragsbeschreibung
        art_der_leistung: {
          type: 'text',
          label: 'Art der Leistung',
          required: true,
          max_length: 255,
          section: 'auftrag'
        },
        umfang_der_leistung: {
          type: 'textarea',
          label: 'Umfang der Leistung',
          required: true,
          max_length: 2000,
          section: 'auftrag'
        },
        rahmenvereinbarung: {
          type: 'checkbox',
          label: 'Rahmenvereinbarung',
          required: false,
          section: 'auftrag'
        },
        optionen_zusaetzlich: {
          type: 'textarea',
          label: 'Optionen auf zusätzliche Aufträge',
          required: false,
          max_length: 1000,
          section: 'auftrag'
        },
        
        // Kommunikation
        kommunikation_name: {
          type: 'text',
          label: 'Kommunikation - Name',
          required: true,
          max_length: 255,
          section: 'kommunikation'
        },
        kommunikation_strasse: {
          type: 'text',
          label: 'Kommunikation - Straße',
          required: true,
          max_length: 255,
          section: 'kommunikation'
        },
        kommunikation_plz: {
          type: 'text',
          label: 'Kommunikation - PLZ',
          required: true,
          max_length: 10,
          section: 'kommunikation'
        },
        kommunikation_ort: {
          type: 'text',
          label: 'Kommunikation - Ort',
          required: true,
          max_length: 100,
          section: 'kommunikation'
        },
        
        // Bewerberzahl
        bewerber_min: {
          type: 'number',
          label: 'Mindestanzahl Bewerber',
          required: false,
          min: 1,
          max: 100,
          section: 'bewerber'
        },
        bewerber_max: {
          type: 'number',
          label: 'Höchstanzahl Bewerber',
          required: false,
          min: 1,
          max: 100,
          section: 'bewerber'
        }
      },
      template_content: {
        type: 'document',
        title: 'Aufforderung zur Interessensbestätigung / zum Teilnahmeantrag',
        sections: [
          {
            type: 'letterhead',
            title: 'Vergabestelle',
            fields: ['vergabestelle_name', 'vergabestelle_strasse', 'vergabestelle_plz', 'vergabestelle_ort', 'vergabestelle_telefon', 'vergabestelle_fax', 'vergabestelle_email']
          },
          {
            type: 'recipient',
            title: 'Empfänger',
            fields: ['empfaenger_name', 'empfaenger_strasse', 'empfaenger_plz', 'empfaenger_ort']
          },
          {
            type: 'reference',
            title: 'Vergabedaten',
            fields: ['vergabenummer', 'massnahmenummer', 'massnahme', 'leistung_cpv']
          },
          {
            type: 'title',
            content: 'Aufforderung zur Interessensbestätigung / zum Teilnahmewettbewerb'
          },
          {
            type: 'options',
            title: 'Vergabeart',
            fields: ['vergabeart', 'vergabeart_sonstige']
          },
          {
            type: 'deadline',
            title: 'Ablauf der Teilnahmefrist',
            fields: ['teilnahmefrist_datum', 'teilnahmefrist_uhrzeit']
          },
          {
            type: 'attachments',
            title: 'Anlagen',
            content: [
              'Wirt-123.2 Teilnahmeantrag / Interessensbestätigung',
              'Wirt-124 EU Erklärung zu Ausschlussgründen oder Europäische Eigenerklärung (EEE)',
              'Wirt-235 Unteraufträge / Eignungsleihe',
              'Wirt-236 Verpflichtungserklärung anderer Unternehmer',
              'Wirt-238 Erklärung der Bieter-/Bewerbergemeinschaft'
            ]
          },
          {
            type: 'numbered_section',
            number: '1',
            title: 'Umfang des Auftrags',
            subsections: [
              {
                type: 'field_group',
                label: 'a) Art der Leistung:',
                fields: ['art_der_leistung']
              },
              {
                type: 'field_group',
                label: 'b) Umfang der Leistung:',
                fields: ['umfang_der_leistung', 'rahmenvereinbarung', 'optionen_zusaetzlich']
              }
            ]
          },
          {
            type: 'numbered_section',
            number: '3',
            title: 'Kommunikation',
            content: 'Die Kommunikation erfolgt in Textform unter der Anschrift folgender Stelle:',
            fields: ['kommunikation_name', 'kommunikation_strasse', 'kommunikation_plz', 'kommunikation_ort']
          },
          {
            type: 'numbered_section',
            number: '7',
            title: 'Vorgesehene Anzahl von Bewerbern',
            fields: ['bewerber_min', 'bewerber_max']
          },
          {
            type: 'footer',
            title: 'Nachprüfungsbehörde',
            content: 'Vergabekammer des Landes Berlin\\nMartin-Luther-Str. 105\\n10825 Berlin\\nTel: (030) 90138316\\nFax: (030) 90137613\\nE-Mail: vergabekammer@senweb.berlin.de'
          }
        ]
      }
    }
    
    // Check if template already exists
    try {
      const existing = await pb.collection('templates').getList(1, 1, {
        filter: `original_filename = "${vgvTemplate.original_filename}"`
      })
      
      if (existing.items.length > 0) {
        // Update existing template
        await pb.collection('templates').update(existing.items[0].id, vgvTemplate)
        console.log('✓ Updated existing VgV template:', existing.items[0].id)
      } else {
        // Create new template
        const created = await pb.collection('templates').create(vgvTemplate)
        console.log('✓ Created VgV template:', created.id)
      }
    } catch (error) {
      // Create new template
      const created = await pb.collection('templates').create(vgvTemplate)
      console.log('✓ Created VgV template:', created.id)
    }
    
    // Create additional UVgO template (simplified)
    const uvgoTemplate = {
      name: 'Angebotsaufforderung (UVgO)',
      category: 'UVgO',
      original_filename: 'uvgo-angebotsaufforderung.docx',
      active: true,
      template_fields: {
        vergabestelle_name: {
          type: 'text',
          label: 'Vergabestelle',
          required: true,
          max_length: 255
        },
        vergabenummer: {
          type: 'text',
          label: 'Vergabenummer',
          required: true,
          max_length: 100
        },
        leistungsbeschreibung: {
          type: 'textarea',
          label: 'Leistungsbeschreibung',
          required: true,
          max_length: 2000
        },
        angebotsfrist: {
          type: 'datetime',
          label: 'Angebotsfrist',
          required: true
        },
        bindefrist: {
          type: 'date',
          label: 'Bindefrist',
          required: true
        },
        kontakt_email: {
          type: 'email',
          label: 'Kontakt E-Mail',
          required: true
        }
      },
      template_content: {
        type: 'document',
        title: 'Angebotsaufforderung',
        sections: [
          {
            type: 'header',
            fields: ['vergabestelle_name', 'vergabenummer']
          },
          {
            type: 'content',
            fields: ['leistungsbeschreibung']
          },
          {
            type: 'deadlines',
            fields: ['angebotsfrist', 'bindefrist']
          },
          {
            type: 'contact',
            fields: ['kontakt_email']
          }
        ]
      }
    }
    
    try {
      const created = await pb.collection('templates').create(uvgoTemplate)
      console.log('✓ Created UVgO template:', created.id)
    } catch (error) {
      console.log('! UVgO template might already exist')
    }
    
    console.log('\n✅ Real templates created successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run if called directly
if (require.main === module) {
  createRealTemplates()
}

module.exports = { createRealTemplates }