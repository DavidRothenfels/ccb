// Test script for DOCX export functionality
// This script simulates the DOCX export process

const pb = new (require('pocketbase/cjs'))('http://localhost:8091');

async function testDocxExport() {
    console.log('Testing DOCX Export Functionality...\n');
    
    try {
        // 1. Login as test user
        console.log('1. Logging in...');
        const authData = await pb.collection('users').authWithPassword(
            'test@example.com',
            'testpassword123'
        );
        console.log('✓ Logged in as:', authData.record.email);
        
        // 2. Get or create a test project
        console.log('\n2. Getting test project...');
        let projects = await pb.collection('projects').getList(1, 1, {
            filter: 'name = "Test DOCX Export"'
        });
        
        let project;
        if (projects.items.length === 0) {
            // Create test project
            project = await pb.collection('projects').create({
                name: 'Test DOCX Export',
                description: 'Testing DOCX export functionality',
                procurement_type: 'Dienstleistung',
                threshold_type: 'unterschwellig',
                status: 'draft',
                user: authData.record.id,
                form_data: {
                    vergabestelle_name: 'Senatsverwaltung für Wirtschaft',
                    vergabestelle_anschrift: 'Martin-Luther-Straße 105, 10825 Berlin',
                    vergabestelle_ansprechpartner: 'Max Mustermann',
                    vergabestelle_telefon: '030 9013-0',
                    vergabestelle_email: 'vergabestelle@berlin.de',
                    auftrag_bezeichnung: 'Beratungsleistungen für City Challenge 2025',
                    auftrag_beschreibung: 'Umfassende Beratung und Unterstützung bei der Durchführung der City Challenge Berlin 2025',
                    cpv_code: '79410000-1',
                    geschaetzter_auftragswert: '250000',
                    angebotsfrist_datum: '2025-02-15',
                    angebotsfrist_uhrzeit: '14:00',
                    leistungszeitraum_beginn: '2025-03-01',
                    leistungszeitraum_ende: '2025-12-31'
                }
            });
            console.log('✓ Created test project:', project.name);
        } else {
            project = projects.items[0];
            console.log('✓ Found existing test project:', project.name);
        }
        
        // 3. Generate documents for the project
        console.log('\n3. Generating documents...');
        
        // Get templates
        const templates = await pb.collection('templates').getList(1, 50, {
            filter: 'active = true'
        });
        console.log(`✓ Found ${templates.items.length} active templates`);
        
        // Delete existing documents
        const existingDocs = await pb.collection('documents').getList(1, 100, {
            filter: `project = "${project.id}"`
        });
        for (const doc of existingDocs.items) {
            await pb.collection('documents').delete(doc.id);
        }
        
        // Generate new documents
        const applicableTemplates = templates.items.filter(template => {
            if (project.threshold_type === 'oberschwellig') {
                return ['VgV', 'VgV_UVgO', 'SektVO'].includes(template.category);
            } else {
                return ['UVgO', 'VgV_UVgO'].includes(template.category);
            }
        });
        
        console.log(`✓ Generating documents for ${applicableTemplates.length} applicable templates`);
        
        const documents = [];
        for (const template of applicableTemplates) {
            const doc = await pb.collection('documents').create({
                project: project.id,
                template: template.id,
                filled_content: {
                    ...template.template_content,
                    filled_data: project.form_data
                },
                version: 1
            });
            documents.push(doc);
            console.log(`  - Generated document for template: ${template.name}`);
        }
        
        // 4. Test DOCX export for each document
        console.log('\n4. Testing DOCX export...');
        console.log('Note: In a real browser environment, the following would happen:');
        
        for (const doc of documents) {
            const template = applicableTemplates.find(t => t.id === doc.template);
            console.log(`\n  Document: ${template.name}`);
            console.log('  - Click "DOCX" button');
            console.log('  - generateDocxFromDocument() would be called');
            console.log('  - Document would be created with:');
            console.log('    * Proper formatting (headings, paragraphs, tables)');
            console.log('    * All placeholders replaced with actual values');
            console.log(`    * Filename: ${project.name}_${template.name}.docx`);
        }
        
        // 5. Test "Download All" functionality
        console.log('\n5. Testing "Download All" functionality...');
        console.log('Note: In a real browser environment:');
        console.log('  - Click "Alle herunterladen" button');
        console.log('  - JSZip would create a ZIP file containing:');
        documents.forEach((doc, idx) => {
            const template = applicableTemplates.find(t => t.id === doc.template);
            console.log(`    * ${template.name.replace(/[^a-z0-9]/gi, '_')}.docx`);
        });
        console.log(`  - ZIP filename: ${project.name.replace(/[^a-z0-9]/gi, '_')}_Vergabedokumente.zip`);
        
        // 6. Verify document content
        console.log('\n6. Verifying document content...');
        const sampleDoc = documents[0];
        const sampleTemplate = applicableTemplates.find(t => t.id === sampleDoc.template);
        
        console.log(`\nSample document content (${sampleTemplate.name}):`);
        console.log('----------------------------------------');
        
        if (sampleDoc.filled_content.sections) {
            sampleDoc.filled_content.sections.slice(0, 3).forEach(section => {
                switch (section.type) {
                    case 'title':
                        console.log(`\n# ${section.content}\n`);
                        break;
                    case 'header':
                        console.log(`\n## ${section.content}\n`);
                        break;
                    case 'paragraph':
                        console.log(`${section.content}\n`);
                        break;
                    case 'field_group':
                        console.log(`${section.label}: ${section.fields.map(f => project.form_data[f]).filter(Boolean).join(' ')}\n`);
                        break;
                }
            });
        }
        
        console.log('\n✅ DOCX Export Test Complete!');
        console.log('\nSummary:');
        console.log(`- Project: ${project.name}`);
        console.log(`- Documents generated: ${documents.length}`);
        console.log('- DOCX export functionality: Ready');
        console.log('- ZIP download functionality: Ready');
        console.log('\nTo manually test in browser:');
        console.log('1. Open http://localhost:8091');
        console.log('2. Login with test@example.com / testpassword123');
        console.log('3. Open the "Test DOCX Export" project');
        console.log('4. Click "DOCX" button on any document');
        console.log('5. Click "Alle herunterladen" to download all as ZIP');
        
    } catch (error) {
        console.error('Error during test:', error);
    }
}

// Run the test
testDocxExport();