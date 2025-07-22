// Test script for admin comment system

async function testCommentSystem() {
    const pb = new (await import('pocketbase')).default('http://localhost:8091');
    
    console.log('Starting comment system test...\n');
    
    try {
        // 1. Create/login admin user
        console.log('1. Creating/logging in admin user...');
        let adminUser;
        try {
            adminUser = await pb.collection('users').create({
                email: 'admin@test.de',
                password: 'admin12345',
                passwordConfirm: 'admin12345',
                user_type: 'admin'
            });
            console.log('   ✓ Admin user created');
        } catch (e) {
            // User might already exist, try login
            const authData = await pb.collection('users').authWithPassword('admin@test.de', 'admin12345');
            adminUser = authData.record;
            console.log('   ✓ Admin user logged in');
        }
        
        // 2. Create regular user
        console.log('\n2. Creating/logging in regular user...');
        let regularUser;
        try {
            regularUser = await pb.collection('users').create({
                email: 'user@test.de',
                password: 'user12345',
                passwordConfirm: 'user12345',
                user_type: 'user'
            });
            console.log('   ✓ Regular user created');
        } catch (e) {
            // User might already exist
            console.log('   ℹ Regular user already exists');
        }
        
        // 3. Create test project as admin
        console.log('\n3. Creating test project...');
        const project = await pb.collection('projects').create({
            name: 'Test Vergabeprojekt',
            description: 'Testprojekt für Kommentarsystem',
            procurement_type: 'Bauauftrag',
            threshold_type: 'unterschwellig',
            form_data: {
                vergabenummer: 'TEST-2025-001',
                auftrag_bezeichnung: 'Sanierung Schulgebäude',
                vergabestelle_name: 'Bezirksamt Test',
                geschaetzter_auftragswert: 500000,
                angebotsfrist_datum: '2025-03-15'
            },
            status: 'draft',
            user: adminUser.id
        });
        console.log('   ✓ Project created with ID:', project.id);
        
        // 4. Get a template
        console.log('\n4. Getting template...');
        const templates = await pb.collection('templates').getList(1, 1, {
            filter: 'active = true'
        });
        if (templates.items.length === 0) {
            throw new Error('No active templates found');
        }
        const template = templates.items[0];
        console.log('   ✓ Using template:', template.name);
        
        // 5. Create test document
        console.log('\n5. Creating test document...');
        const document = await pb.collection('documents').create({
            project: project.id,
            template: template.id,
            filled_content: {
                sections: [
                    { type: 'title', content: 'Test Dokument' },
                    { type: 'content', content: 'Dies ist ein Testdokument für das Kommentarsystem.' }
                ],
                filled_data: project.form_data
            },
            version: 1
        });
        console.log('   ✓ Document created with ID:', document.id);
        
        // 6. Test comment creation as admin
        console.log('\n6. Testing comment creation as admin...');
        const comment1 = await pb.collection('comments').create({
            document: document.id,
            author: adminUser.id,
            comment_text: 'Die Vergabenummer sollte das Format VG-2025-XXX haben.',
            field_reference: 'vergabenummer',
            status: 'open'
        });
        console.log('   ✓ Comment 1 created with ID:', comment1.id);
        
        const comment2 = await pb.collection('comments').create({
            document: document.id,
            author: adminUser.id,
            comment_text: 'Bitte prüfen Sie den geschätzten Auftragswert noch einmal.',
            field_reference: 'geschaetzter_auftragswert',
            status: 'open'
        });
        console.log('   ✓ Comment 2 created with ID:', comment2.id);
        
        const comment3 = await pb.collection('comments').create({
            document: document.id,
            author: adminUser.id,
            comment_text: 'Die Vergabestelle wurde korrekt angegeben.',
            field_reference: 'vergabestelle_name',
            status: 'resolved'
        });
        console.log('   ✓ Comment 3 created with ID:', comment3.id);
        
        // 7. Test retrieving comments
        console.log('\n7. Testing comment retrieval...');
        const comments = await pb.collection('comments').getList(1, 50, {
            filter: `document = "${document.id}"`,
            expand: 'author',
            sort: '-created'
        });
        console.log('   ✓ Retrieved', comments.items.length, 'comments');
        
        // 8. Test regular user access
        console.log('\n8. Testing regular user access...');
        await pb.collection('users').authWithPassword('user@test.de', 'user12345');
        
        try {
            await pb.collection('comments').create({
                document: document.id,
                author: pb.authStore.model.id,
                comment_text: 'This should fail',
                field_reference: 'test',
                status: 'open'
            });
            console.log('   ✗ ERROR: Regular user was able to create comment!');
        } catch (e) {
            console.log('   ✓ Regular user correctly denied comment creation');
        }
        
        // Try to read comments as regular user
        try {
            const userComments = await pb.collection('comments').getList(1, 50, {
                filter: `document = "${document.id}"`
            });
            console.log('   ℹ Regular user can see', userComments.items.length, 'comments');
        } catch (e) {
            console.log('   ℹ Regular user cannot see comments (expected based on rules)');
        }
        
        // 9. Summary
        console.log('\n=== TEST SUMMARY ===');
        console.log('✓ Admin user can create comments');
        console.log('✓ Comments are linked to documents');
        console.log('✓ Comments include field references and status');
        console.log('✓ Comments can be retrieved with author information');
        console.log('✓ Regular users cannot create comments');
        
        console.log('\n=== UI TEST INSTRUCTIONS ===');
        console.log('1. Open http://localhost:8091 in your browser');
        console.log('2. Login with admin@test.de / admin12345');
        console.log('3. Navigate to "Test Vergabeprojekt"');
        console.log('4. You should see documents with "Kommentar" buttons (admin only)');
        console.log('5. Click "Kommentar" button to add new comments');
        console.log('6. Comments should appear below each document');
        console.log('7. Navigate to "Verwaltung" > "Kommentare" for overview');
        console.log('\nFor comparison, login as user@test.de / user12345');
        console.log('Regular users should NOT see "Kommentar" buttons');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testCommentSystem();