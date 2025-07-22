const PocketBase = require('pocketbase/cjs');
const fs = require('fs').promises;
const path = require('path');

const pb = new PocketBase('http://localhost:8091');

// Admin credentials
const ADMIN_EMAIL = 'admin@citychallenge.berlin';
const ADMIN_PASSWORD = 'citychallenge2025';

// Template categories mapping
const TEMPLATE_CATEGORIES = {
    'vgv': 'VgV',
    'uvgo': 'UVgO', 
    'konzvgv': 'KonzVgV',
    'sektvo': 'SektVO',
    'verteidigung': 'VSVgV',
    'vorvermerk': 'Vermerk',
    'vermerk': 'Vermerk'
};

async function importBerlinTemplates() {
    try {
        // Authenticate as admin
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✓ Authenticated as admin');

        // Read analysis results
        const analysisPath = path.join(__dirname, 'berlin_templates_analysis.json');
        const analysisData = JSON.parse(await fs.readFile(analysisPath, 'utf8'));
        
        console.log(`\nFound ${analysisData.templateCount} analyzed templates`);
        
        // Process each template
        for (const templateData of analysisData.templates) {
            console.log(`\nProcessing: ${templateData.template}`);
            
            // Determine category
            let category = 'Sonstige';
            const filename = templateData.template.toLowerCase();
            
            for (const [key, value] of Object.entries(TEMPLATE_CATEGORIES)) {
                if (filename.includes(key)) {
                    category = value;
                    break;
                }
            }
            
            // Create template structure
            const templateFields = {};
            templateData.fields.forEach(field => {
                templateFields[field.key] = {
                    label: field.label,
                    type: field.type,
                    required: field.required,
                    section: field.section || 'Allgemein',
                    description: field.description || '',
                    placeholder: field.label
                };
            });
            
            // Create template content structure
            const templateContent = {
                sections: [
                    {
                        type: 'heading',
                        level: 1,
                        content: getTemplateName(templateData.template)
                    },
                    {
                        type: 'info',
                        content: 'Dieses Formular wurde automatisch aus der Berlin.de Vorlage generiert.'
                    }
                ]
            };
            
            // Add field sections
            const sectionMap = new Map();
            templateData.fields.forEach(field => {
                const section = field.section || 'Allgemein';
                if (!sectionMap.has(section)) {
                    sectionMap.set(section, []);
                }
                sectionMap.get(section).push(field);
            });
            
            for (const [sectionName, fields] of sectionMap) {
                if (sectionName && sectionName !== 'Allgemein') {
                    templateContent.sections.push({
                        type: 'heading',
                        level: 2,
                        content: sectionName
                    });
                }
                
                fields.forEach(field => {
                    templateContent.sections.push({
                        type: 'field',
                        field: field.key,
                        label: field.label
                    });
                });
            }
            
            // Check if template already exists
            try {
                const existingTemplates = await pb.collection('templates').getList(1, 1, {
                    filter: `name = "${getTemplateName(templateData.template)}"`
                });
                
                if (existingTemplates.items.length > 0) {
                    console.log(`  → Template already exists, updating...`);
                    
                    // Update existing template
                    await pb.collection('templates').update(existingTemplates.items[0].id, {
                        category: category,
                        template_fields: templateFields,
                        template_content: templateContent,
                        active: true,
                        description: getTemplateDescription(templateData.template)
                    });
                    
                    console.log(`  ✓ Updated: ${getTemplateName(templateData.template)}`);
                } else {
                    // Create new template
                    const newTemplate = await pb.collection('templates').create({
                        name: getTemplateName(templateData.template),
                        category: category,
                        template_fields: templateFields,
                        template_content: templateContent,
                        active: true,
                        description: getTemplateDescription(templateData.template),
                        original_filename: templateData.template
                    });
                    
                    console.log(`  ✓ Created: ${newTemplate.name}`);
                }
            } catch (error) {
                console.error(`  ✗ Error: ${error.message}`);
                if (error.data) {
                    console.error('    Details:', JSON.stringify(error.data, null, 2));
                }
            }
        }
        
        console.log('\n✓ Import complete!');
        
    } catch (error) {
        console.error('Import failed:', error);
    }
}

function getTemplateName(filename) {
    const nameMap = {
        'wirt-111-vorvermerk.docx': 'Vorblatt zum Vermerk',
        'wirt-111-1-vermerk-vgv.docx': 'Vermerk VgV',
        'wirt-111-2-vermerk-dl.docx': 'Vermerk Soziale Dienstleistungen',
        'wirt-111-3-vermerk-verteidigung.docx': 'Vermerk Verteidigung & Sicherheit',
        'wirt-111-4-vermerk-konz.docx': 'Vermerk Konzessionen',
        'wirt-111-5-vermerk-uvgo.docx': 'Vermerk UVgO',
        'wirt-121-uvgo-p-bekanntmachung-oea.docx': 'UVgO Bekanntmachung ÖA',
        'wirt-123-uvgo-p-bekanntmachung-teilnahmewettbewerb.docx': 'UVgO Teilnahmewettbewerb',
        'wirt-211-eu-p.docx': 'EU Aufforderung zur Angebotsabgabe',
        'wirt-211-uvgo-p-aufforderung.docx': 'UVgO Aufforderung zur Angebotsabgabe',
        'wirt-211-konzvgv-p-aufforderung.docx': 'KonzVgV Aufforderung zur Angebotsabgabe',
        'wirt-213-p-angebotsschreiben.docx': 'Angebotsschreiben',
        'wirt-215-p-zvb-bvb.docx': 'ZVB/BVB Bedingungen',
        'wirt-235-p-unterauftraege.docx': 'Unteraufträge/Eignungsleihe',
        'wirt-236-p-verpflichtungserklaerung.docx': 'Verpflichtungserklärung',
        'wirt-238-p-bietergemeinschaft.docx': 'Erklärung Bietergemeinschaft'
    };
    
    // Try exact match first
    if (nameMap[filename]) {
        return nameMap[filename];
    }
    
    // Extract key parts from filename
    const base = filename.replace('.docx', '');
    const parts = base.split('-');
    
    if (parts[0] === 'wirt' && parts[1]) {
        return `Formular ${parts[1]} - ${parts.slice(2).join(' ')}`;
    }
    
    return filename.replace('.docx', '');
}

function getTemplateDescription(filename) {
    const descMap = {
        'wirt-111-vorvermerk.docx': 'Vorblatt für Vergabevermerke - Übersicht und Grunddaten',
        'wirt-111-1-vermerk-vgv.docx': 'Vermerk zur Vorbereitung einer Vergabe nach VgV (EU-Schwellenwert)',
        'wirt-111-2-vermerk-dl.docx': 'Vermerk für soziale und andere besondere Dienstleistungen',
        'wirt-111-3-vermerk-verteidigung.docx': 'Vermerk für Vergaben im Bereich Verteidigung und Sicherheit',
        'wirt-111-4-vermerk-konz.docx': 'Vermerk für Konzessionsvergaben',
        'wirt-111-5-vermerk-uvgo.docx': 'Vermerk für Vergaben unterhalb der EU-Schwellenwerte (UVgO)',
        'wirt-211-eu-p.docx': 'Aufforderung zur Angebotsabgabe bei EU-weiten Verfahren',
        'wirt-213-p-angebotsschreiben.docx': 'Vorlage für Angebotsschreiben der Bieter',
        'wirt-215-p-zvb-bvb.docx': 'Zusätzliche und besondere Vertragsbedingungen'
    };
    
    return descMap[filename] || 'Berlin.de Vergabeformular';
}

// Run the import
importBerlinTemplates().catch(console.error);