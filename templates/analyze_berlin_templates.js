const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function analyzeBerlinTemplate(templatePath) {
    console.log(`\nAnalyzing Berlin template: ${path.basename(templatePath)}`);
    console.log('='.repeat(60));
    
    try {
        // Convert to HTML to better understand structure
        const htmlResult = await mammoth.convertToHtml({path: templatePath});
        const html = htmlResult.value;
        
        // Convert to text
        const textResult = await mammoth.extractRawText({path: templatePath});
        const text = textResult.value;
        
        // Find all form fields in Berlin templates
        const fields = [];
        const lines = text.split('\n');
        
        // Berlin templates use specific patterns
        const patterns = [
            // Form fields with colons
            /^([^:]+):\s*$/gm,
            /^([^:]+):\s*_{3,}/gm,
            /^([^:]+):\s*\.{3,}/gm,
            
            // Checkbox patterns
            /☐\s+(.+?)(?:\s+☐|$)/g,
            /\[\s*\]\s+(.+?)(?:\s+\[|$)/g,
            
            // Table cells with underlines
            /\t_{3,}/g,
            /\s{2,}_{3,}/g,
            
            // Numbered fields
            /^\d+\.\s+(.+?):\s*$/gm,
            /^\d+\.\d+\s+(.+?):\s*$/gm,
            
            // Special Berlin form patterns
            /Vergabestelle:\s*$/,
            /Vergabenummer:\s*$/,
            /Auftragsgegenstand:\s*$/,
            /Geschätzter Auftragswert:\s*$/,
            /CPV-Code:\s*$/,
            /Leistungszeitraum:\s*$/,
            /Zuschlagskriterien:\s*$/,
        ];
        
        // Extract sections and fields
        const sections = new Set();
        let currentSection = 'Allgemein';
        
        lines.forEach((line, index) => {
            // Detect sections (usually bold or numbered headers)
            if (line.match(/^[A-ZÄÖÜ\s]{3,}$/)) {
                currentSection = line.trim();
                sections.add(currentSection);
            } else if (line.match(/^\d+\.\s+[A-ZÄÖÜ]/)) {
                currentSection = line.trim();
                sections.add(currentSection);
            }
            
            // Check for field patterns
            patterns.forEach(pattern => {
                const matches = line.match(pattern);
                if (matches) {
                    // Extract field name
                    let fieldName = '';
                    if (pattern.source.includes(':')) {
                        fieldName = line.split(':')[0].trim();
                    } else if (matches[1]) {
                        fieldName = matches[1].trim();
                    }
                    
                    if (fieldName && fieldName.length > 2 && fieldName.length < 100) {
                        fields.push({
                            name: fieldName,
                            section: currentSection,
                            line: index + 1,
                            pattern: pattern.source,
                            context: line.trim()
                        });
                    }
                }
            });
        });
        
        // Also analyze HTML structure for better field detection
        const htmlFields = extractFieldsFromHtml(html);
        
        // Combine and deduplicate fields
        const allFields = [...fields, ...htmlFields];
        const uniqueFields = {};
        
        allFields.forEach(field => {
            const key = createFieldKey(field.name);
            if (!uniqueFields[key]) {
                uniqueFields[key] = {
                    key: key,
                    label: field.name,
                    type: detectFieldType(field.name, field.context || ''),
                    section: field.section,
                    required: isRequiredField(field.name),
                    description: getFieldDescription(field.name)
                };
            }
        });
        
        // Create structured result
        const result = {
            template: path.basename(templatePath),
            analyzedAt: new Date().toISOString(),
            templateType: detectTemplateType(path.basename(templatePath)),
            sections: Array.from(sections),
            fieldCount: Object.keys(uniqueFields).length,
            fields: Object.values(uniqueFields)
        };
        
        return result;
        
    } catch (error) {
        console.error(`Error analyzing ${templatePath}:`, error.message);
        return null;
    }
}

function extractFieldsFromHtml(html) {
    const fields = [];
    
    // Look for table cells with form fields
    const tablePattern = /<td[^>]*>([^<:]+):<\/td>\s*<td[^>]*>[\s_\.]*<\/td>/g;
    let match;
    while ((match = tablePattern.exec(html)) !== null) {
        fields.push({
            name: match[1].trim(),
            section: 'Tabelle',
            context: 'table field'
        });
    }
    
    // Look for paragraphs with form fields
    const paraPattern = /<p[^>]*>([^<:]+):\s*(?:_{3,}|\.{3,}|<\/p>)/g;
    while ((match = paraPattern.exec(html)) !== null) {
        fields.push({
            name: match[1].trim(),
            section: 'Formular',
            context: 'paragraph field'
        });
    }
    
    return fields;
}

function detectTemplateType(filename) {
    if (filename.includes('vgv')) return 'VgV';
    if (filename.includes('uvgo')) return 'UVgO';
    if (filename.includes('konz')) return 'KonzVgV';
    if (filename.includes('sektvo')) return 'SektVO';
    if (filename.includes('verteidigung')) return 'VSVgV';
    if (filename.includes('vorvermerk')) return 'Vorvermerk';
    if (filename.includes('vermerk')) return 'Vermerk';
    return 'Sonstige';
}

function detectFieldType(name, context) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('datum') || lowerName.includes('frist')) return 'date';
    if (lowerName.includes('betrag') || lowerName.includes('wert') || lowerName.includes('summe')) return 'currency';
    if (lowerName.includes('anzahl') || lowerName.includes('menge')) return 'number';
    if (lowerName.includes('e-mail') || lowerName.includes('email')) return 'email';
    if (lowerName.includes('telefon') || lowerName.includes('tel')) return 'phone';
    if (lowerName.includes('bemerkung') || lowerName.includes('beschreibung') || lowerName.includes('begründung')) return 'textarea';
    if (context.includes('☐') || context.includes('[ ]')) return 'checkbox';
    if (lowerName.includes('ja/nein')) return 'boolean';
    
    return 'text';
}

function createFieldKey(label) {
    return label
        .toLowerCase()
        .replace(/[äöü]/g, (match) => ({ä: 'ae', ö: 'oe', ü: 'ue'}[match]))
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

function isRequiredField(name) {
    const requiredFields = [
        'vergabenummer',
        'vergabestelle',
        'auftragsgegenstand',
        'geschätzter auftragswert',
        'leistungszeitraum',
        'name',
        'anschrift'
    ];
    
    const lowerName = name.toLowerCase();
    return requiredFields.some(field => lowerName.includes(field));
}

function getFieldDescription(name) {
    const descriptions = {
        'Vergabenummer': 'Eindeutige Nummer des Vergabeverfahrens',
        'Vergabestelle': 'Name der vergebenden Stelle',
        'Auftragsgegenstand': 'Beschreibung der zu vergebenden Leistung',
        'Geschätzter Auftragswert': 'Geschätzter Netto-Auftragswert in EUR',
        'CPV-Code': 'Common Procurement Vocabulary Code',
        'Leistungszeitraum': 'Zeitraum der Leistungserbringung',
        'Zuschlagskriterien': 'Kriterien für die Zuschlagserteilung',
        'Submission deadline': 'Frist für die Angebotsabgabe'
    };
    
    return descriptions[name] || '';
}

// Analyze all Berlin templates
async function analyzeAllBerlinTemplates() {
    const templateDir = path.join(__dirname, 'original');
    const templates = fs.readdirSync(templateDir)
        .filter(file => file.endsWith('.docx'));
    
    console.log(`Found ${templates.length} Berlin templates to analyze\n`);
    
    const results = [];
    for (const template of templates) {
        const result = await analyzeBerlinTemplate(path.join(templateDir, template));
        if (result) {
            results.push(result);
            
            // Save individual analysis
            const outputPath = path.join(templateDir, template.replace('.docx', '_berlin_analysis.json'));
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        }
    }
    
    // Create combined analysis
    const combinedAnalysis = {
        analyzedAt: new Date().toISOString(),
        templateCount: results.length,
        templateTypes: [...new Set(results.map(r => r.templateType))],
        templates: results,
        fieldSummary: createFieldSummary(results)
    };
    
    fs.writeFileSync(
        path.join(__dirname, 'berlin_templates_analysis.json'),
        JSON.stringify(combinedAnalysis, null, 2)
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('Berlin template analysis complete!');
    console.log(`Total templates analyzed: ${results.length}`);
    console.log(`Template types found: ${combinedAnalysis.templateTypes.join(', ')}`);
    console.log(`Total unique fields identified: ${combinedAnalysis.fieldSummary.totalUniqueFields}`);
}

function createFieldSummary(results) {
    const allFields = new Map();
    
    results.forEach(result => {
        result.fields.forEach(field => {
            const key = field.key;
            if (!allFields.has(key)) {
                allFields.set(key, {
                    ...field,
                    templates: [result.template],
                    templateTypes: [result.templateType]
                });
            } else {
                const existing = allFields.get(key);
                existing.templates.push(result.template);
                existing.templateTypes.push(result.templateType);
            }
        });
    });
    
    return {
        totalUniqueFields: allFields.size,
        commonFields: Array.from(allFields.values())
            .filter(field => field.templates.length > 1)
            .sort((a, b) => b.templates.length - a.templates.length),
        fieldsByType: groupFieldsByType(allFields)
    };
}

function groupFieldsByType(fields) {
    const byType = {};
    
    fields.forEach(field => {
        if (!byType[field.type]) {
            byType[field.type] = [];
        }
        byType[field.type].push(field.label);
    });
    
    return byType;
}

// Run analysis
analyzeAllBerlinTemplates().catch(console.error);