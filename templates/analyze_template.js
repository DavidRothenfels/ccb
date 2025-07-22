const mammoth = require('mammoth')
const fs = require('fs').promises
const path = require('path')

async function analyzeTemplate(templatePath) {
  try {
    // Convert DOCX to HTML
    const result = await mammoth.convertToHtml({path: templatePath})
    const html = result.value
    
    // Extract text content
    const textResult = await mammoth.extractRawText({path: templatePath})
    const text = textResult.value
    
    console.log('=== Template Analysis ===')
    console.log('File:', path.basename(templatePath))
    console.log('\n--- Raw Text ---')
    console.log(text.substring(0, 2000) + '...')
    
    // Analyze form fields by looking for patterns
    const fieldPatterns = [
      // Look for form field markers
      /\[.*?\]/g,
      /\{.*?\}/g,
      /__+/g,
      /\.{3,}/g,
      // Look for specific keywords
      /Vergabenummer:?\s*[_\s]*/gi,
      /Auftraggeber:?\s*[_\s]*/gi,
      /Name:?\s*[_\s]*/gi,
      /Adresse:?\s*[_\s]*/gi,
      /E-Mail:?\s*[_\s]*/gi,
      /Telefon:?\s*[_\s]*/gi,
      /Frist:?\s*[_\s]*/gi,
      /Datum:?\s*[_\s]*/gi,
      /Beschreibung:?\s*[_\s]*/gi,
      /Leistung:?\s*[_\s]*/gi,
      /Ort:?\s*[_\s]*/gi,
      /PLZ:?\s*[_\s]*/gi,
      /Kontakt:?\s*[_\s]*/gi,
      /Ansprechpartner:?\s*[_\s]*/gi,
      /Unterschrift:?\s*[_\s]*/gi,
    ]
    
    console.log('\n--- Potential Form Fields ---')
    const foundFields = new Set()
    
    fieldPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          if (match.length > 2 && match.length < 100) {
            foundFields.add(match.trim())
          }
        })
      }
    })
    
    foundFields.forEach(field => console.log('- ' + field))
    
    // Look for sections and structure
    console.log('\n--- Document Structure ---')
    const lines = text.split('\n').filter(line => line.trim())
    const sections = []
    let currentSection = null
    
    lines.forEach((line, idx) => {
      // Look for numbered sections or headers
      if (/^\d+\.?\s+[A-Z]/.test(line) || /^[A-Z][A-Z\s]{5,}$/.test(line)) {
        if (currentSection) sections.push(currentSection)
        currentSection = { header: line.trim(), content: [] }
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line.trim())
      }
    })
    if (currentSection) sections.push(currentSection)
    
    sections.slice(0, 10).forEach(section => {
      console.log(`\nSection: ${section.header}`)
      console.log('Content preview:', section.content.slice(0, 3).join(' '))
    })
    
    // Identify fillable areas by looking for underscores, dots, or form markers
    console.log('\n--- Fillable Areas ---')
    const fillablePatterns = [
      { name: 'Vergabenummer', pattern: /Vergabenummer:?\s*[_\.\s]{3,}/gi },
      { name: 'Auftraggeber', pattern: /Auftraggeber:?\s*[_\.\s]{3,}/gi },
      { name: 'Adresse', pattern: /Adresse:?\s*[_\.\s]{3,}/gi },
      { name: 'PLZ/Ort', pattern: /PLZ.*?Ort:?\s*[_\.\s]{3,}/gi },
      { name: 'E-Mail', pattern: /E-?Mail:?\s*[_\.\s]{3,}/gi },
      { name: 'Telefon', pattern: /Telefon:?\s*[_\.\s]{3,}/gi },
      { name: 'Ansprechpartner', pattern: /Ansprechpartner:?\s*[_\.\s]{3,}/gi },
      { name: 'Datum', pattern: /Datum:?\s*[_\.\s]{3,}/gi },
      { name: 'Frist', pattern: /Frist.*?:?\s*[_\.\s]{3,}/gi },
      { name: 'Leistungsbeschreibung', pattern: /Leistung.*?:?\s*[_\.\s]{3,}/gi },
    ]
    
    fillablePatterns.forEach(({name, pattern}) => {
      if (pattern.test(text)) {
        console.log(`- ${name}: Found`)
      }
    })
    
    // Create structured template data
    const templateData = {
      name: 'Aufforderung zur Interessensbestätigung (VgV)',
      category: 'VgV',
      original_filename: path.basename(templatePath),
      template_fields: {
        vergabenummer: {
          type: 'text',
          label: 'Vergabenummer',
          required: true,
          max_length: 100
        },
        auftraggeber_name: {
          type: 'text',
          label: 'Name des Auftraggebers',
          required: true,
          max_length: 255
        },
        auftraggeber_adresse: {
          type: 'text',
          label: 'Adresse',
          required: true,
          max_length: 500
        },
        auftraggeber_plz: {
          type: 'text',
          label: 'PLZ',
          required: true,
          max_length: 10
        },
        auftraggeber_ort: {
          type: 'text',
          label: 'Ort',
          required: true,
          max_length: 100
        },
        ansprechpartner_name: {
          type: 'text',
          label: 'Ansprechpartner',
          required: true,
          max_length: 255
        },
        ansprechpartner_telefon: {
          type: 'text',
          label: 'Telefon',
          required: false,
          max_length: 50
        },
        ansprechpartner_email: {
          type: 'email',
          label: 'E-Mail',
          required: true,
          max_length: 255
        },
        leistungsbeschreibung: {
          type: 'textarea',
          label: 'Beschreibung der Leistung',
          required: true,
          max_length: 2000
        },
        abgabefrist_datum: {
          type: 'date',
          label: 'Abgabefrist Datum',
          required: true
        },
        abgabefrist_uhrzeit: {
          type: 'time',
          label: 'Abgabefrist Uhrzeit',
          required: true
        },
        unterlagen_bereitstellung: {
          type: 'text',
          label: 'Art der Bereitstellung der Vergabeunterlagen',
          required: true,
          max_length: 500
        }
      },
      template_content: {
        type: 'document',
        sections: [
          {
            type: 'header',
            content: 'Aufforderung zur Interessensbestätigung / zum Teilnahmeantrag'
          },
          {
            type: 'field_group',
            title: 'Auftraggeber',
            fields: ['auftraggeber_name', 'auftraggeber_adresse', 'auftraggeber_plz', 'auftraggeber_ort']
          },
          {
            type: 'field_group',
            title: 'Vergabenummer',
            fields: ['vergabenummer']
          },
          {
            type: 'field_group',
            title: 'Ansprechpartner',
            fields: ['ansprechpartner_name', 'ansprechpartner_telefon', 'ansprechpartner_email']
          },
          {
            type: 'field_group',
            title: 'Leistungsbeschreibung',
            fields: ['leistungsbeschreibung']
          },
          {
            type: 'field_group',
            title: 'Fristen',
            fields: ['abgabefrist_datum', 'abgabefrist_uhrzeit']
          },
          {
            type: 'field_group',
            title: 'Vergabeunterlagen',
            fields: ['unterlagen_bereitstellung']
          }
        ]
      }
    }
    
    // Save analysis
    const outputPath = templatePath.replace('.docx', '_analysis.json')
    await fs.writeFile(outputPath, JSON.stringify(templateData, null, 2))
    console.log('\n✓ Analysis saved to:', outputPath)
    
    return templateData
    
  } catch (error) {
    console.error('Error analyzing template:', error)
  }
}

// Run analysis
if (require.main === module) {
  const templateFile = process.argv[2] || 'wirt-1231-eu-p-aufforderung.docx'
  analyzeTemplate(templateFile)
}

module.exports = { analyzeTemplate }