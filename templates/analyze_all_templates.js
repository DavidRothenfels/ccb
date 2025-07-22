const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function analyzeTemplate(templatePath) {
    console.log(`\nAnalyzing: ${path.basename(templatePath)}`);
    console.log('='.repeat(50));
    
    try {
        // Convert to text
        const textResult = await mammoth.extractRawText({path: templatePath});
        const text = textResult.value;
        
        // Find all fillable fields (common patterns in German forms)
        const patterns = [
            /\[.*?\]/g,                    // [Field Name]
            /__+/g,                        // ________
            /\.{3,}/g,                     // .........
            /☐/g,                          // Checkboxes
            /\(bitte ausfüllen\)/gi,       // (bitte ausfüllen)
            /\(bitte eintragen\)/gi,       // (bitte eintragen)
            /\(Name.*?\)/gi,               // (Name...)
            /€\s*_+/g,                     // € ______
            /Datum:\s*_+/gi,               // Datum: _____
            /von:\s*_+/gi,                 // von: _____
            /bis:\s*_+/gi,                 // bis: _____
        ];
        
        // Extract sections and fields
        const lines = text.split('\n');
        const fields = [];
        const sections = new Set();
        let currentSection = 'Allgemein';
        
        lines.forEach((line, index) => {
            // Detect sections (usually numbered or bold headers)
            if (line.match(/^\d+\.\s+[A-ZÄÖÜ]/)) {
                currentSection = line.trim();
                sections.add(currentSection);
            }
            
            // Check for fillable fields
            patterns.forEach(pattern => {
                const matches = line.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        // Extract field context
                        const start = Math.max(0, line.indexOf(match) - 30);
                        const end = Math.min(line.length, line.indexOf(match) + match.length + 30);
                        const context = line.substring(start, end).trim();
                        
                        fields.push({
                            section: currentSection,
                            line: index + 1,
                            match: match,
                            context: context,
                            fieldType: detectFieldType(context, match)
                        });
                    });
                }
            });
        });
        
        // Group and deduplicate fields
        const uniqueFields = {};
        fields.forEach(field => {
            const key = field.context.toLowerCase().replace(/[_.\[\]]/g, '').trim();
            if (!uniqueFields[key]) {
                uniqueFields[key] = {
                    label: extractFieldLabel(field.context),
                    type: field.fieldType,
                    section: field.section,
                    required: field.context.includes('*') || field.context.includes('Pflicht'),
                    maxLength: estimateMaxLength(field.match),
                    examples: [field.context]
                };
            }
        });
        
        // Create structured field list
        const structuredFields = Object.entries(uniqueFields).map(([key, field]) => ({
            key: createFieldKey(field.label),
            ...field
        }));
        
        // Save analysis results
        const analysisResult = {
            template: path.basename(templatePath),
            analyzedAt: new Date().toISOString(),
            sections: Array.from(sections),
            fieldCount: structuredFields.length,
            fields: structuredFields
        };
        
        const outputPath = templatePath.replace('.docx', '_analysis.json');
        fs.writeFileSync(outputPath, JSON.stringify(analysisResult, null, 2));
        
        console.log(`Found ${structuredFields.length} unique fields in ${sections.size} sections`);
        console.log(`Analysis saved to: ${path.basename(outputPath)}`);
        
        return analysisResult;
        
    } catch (error) {
        console.error(`Error analyzing ${templatePath}:`, error.message);
        return null;
    }
}

function detectFieldType(context, match) {
    const lowerContext = context.toLowerCase();
    
    if (match === '☐') return 'checkbox';
    if (lowerContext.includes('datum')) return 'date';
    if (lowerContext.includes('€') || lowerContext.includes('betrag')) return 'currency';
    if (lowerContext.includes('e-mail') || lowerContext.includes('email')) return 'email';
    if (lowerContext.includes('telefon') || lowerContext.includes('tel.')) return 'phone';
    if (lowerContext.includes('anzahl') || lowerContext.includes('menge')) return 'number';
    if (match.length > 100) return 'textarea';
    
    return 'text';
}

function extractFieldLabel(context) {
    // Remove field markers and clean up
    let label = context
        .replace(/\[.*?\]/g, '')
        .replace(/__+/g, '')
        .replace(/\.{3,}/g, '')
        .replace(/☐/g, '')
        .replace(/\(.*?\)/g, '')
        .trim();
    
    // Extract meaningful label
    const colonIndex = label.lastIndexOf(':');
    if (colonIndex > 0) {
        label = label.substring(0, colonIndex);
    }
    
    return label.trim() || 'Eingabefeld';
}

function createFieldKey(label) {
    return label
        .toLowerCase()
        .replace(/[äöü]/g, (match) => ({ä: 'ae', ö: 'oe', ü: 'ue'}[match]))
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

function estimateMaxLength(match) {
    if (match.startsWith('_')) return match.length * 2;
    if (match.startsWith('.')) return match.length * 2;
    return 255; // Default
}

// Analyze all templates
async function analyzeAllTemplates() {
    const templateDir = __dirname;
    const templates = fs.readdirSync(templateDir)
        .filter(file => file.endsWith('.docx') && !file.includes('_analysis'));
    
    console.log(`Found ${templates.length} templates to analyze\n`);
    
    const results = [];
    for (const template of templates) {
        const result = await analyzeTemplate(path.join(templateDir, template));
        if (result) results.push(result);
    }
    
    // Create combined analysis
    const combinedAnalysis = {
        analyzedAt: new Date().toISOString(),
        templateCount: results.length,
        templates: results,
        commonFields: findCommonFields(results)
    };
    
    fs.writeFileSync(
        path.join(templateDir, 'combined_analysis.json'),
        JSON.stringify(combinedAnalysis, null, 2)
    );
    
    console.log('\n' + '='.repeat(50));
    console.log('Analysis complete!');
    console.log(`Total templates analyzed: ${results.length}`);
    console.log(`Common fields found: ${combinedAnalysis.commonFields.length}`);
}

function findCommonFields(results) {
    const fieldMap = new Map();
    
    results.forEach(result => {
        result.fields.forEach(field => {
            const key = field.key;
            if (!fieldMap.has(key)) {
                fieldMap.set(key, {
                    ...field,
                    templates: [result.template],
                    count: 1
                });
            } else {
                const existing = fieldMap.get(key);
                existing.templates.push(result.template);
                existing.count++;
            }
        });
    });
    
    // Return fields that appear in multiple templates
    return Array.from(fieldMap.values())
        .filter(field => field.count > 1)
        .sort((a, b) => b.count - a.count);
}

// Run analysis
analyzeAllTemplates().catch(console.error);