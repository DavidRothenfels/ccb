#!/usr/bin/env node

const PocketBaseSDK = require('pocketbase');
const PocketBase = PocketBaseSDK.default || PocketBaseSDK;
const pb = new PocketBase('http://localhost:8091');

async function debug() {
    console.log('=== DEBUGGING AUTH AND PROJECTS ISSUES ===\n');
    
    try {
        // Test 1: Try to login with default user
        console.log('1. Testing login with default user...');
        try {
            const authData = await pb.collection('users').authWithPassword(
                'user@citychallenge.berlin',
                'citychallenge2025'
            );
            console.log('✓ Login successful!');
            console.log('  User ID:', authData.record.id);
            console.log('  Email:', authData.record.email);
            console.log('  Auth token:', pb.authStore.token ? 'Present' : 'Missing');
        } catch (error) {
            console.log('✗ Login failed:', error.message);
            console.log('  Status:', error.status);
            console.log('  Response:', error.response);
            return;
        }

        // Test 2: Check auth store
        console.log('\n2. Checking auth store...');
        console.log('  Is valid:', pb.authStore.isValid);
        console.log('  User ID:', pb.authStore.model?.id);
        
        // Test 3: Try to fetch projects without filter
        console.log('\n3. Fetching all projects (no filter)...');
        try {
            const allProjects = await pb.collection('projects').getList(1, 50);
            console.log('  Total projects in database:', allProjects.totalItems);
            if (allProjects.items.length > 0) {
                console.log('  Sample project:');
                const sample = allProjects.items[0];
                console.log('    - Name:', sample.name);
                console.log('    - User ID:', sample.user);
                console.log('    - Created:', sample.created);
            }
        } catch (error) {
            console.log('✗ Failed to fetch all projects:', error.message);
        }
        
        // Test 4: Try to fetch user's projects with filter
        console.log('\n4. Fetching user projects (with filter)...');
        const userId = pb.authStore.model.id;
        const filter = `user = "${userId}"`;
        console.log('  Filter:', filter);
        
        try {
            const userProjects = await pb.collection('projects').getList(1, 50, {
                filter: filter,
                sort: '-created'
            });
            console.log('  User projects found:', userProjects.totalItems);
            userProjects.items.forEach((project, index) => {
                console.log(`  ${index + 1}. ${project.name} (ID: ${project.id})`);
            });
        } catch (error) {
            console.log('✗ Failed to fetch user projects:', error.message);
            console.log('  Error data:', error.data);
        }
        
        // Test 5: Try raw API call
        console.log('\n5. Testing raw API call...');
        try {
            const response = await fetch(`http://localhost:8091/api/collections/projects/records?filter=${encodeURIComponent(filter)}`, {
                headers: {
                    'Authorization': pb.authStore.token
                }
            });
            const data = await response.json();
            console.log('  Raw API response status:', response.status);
            console.log('  Total items:', data.totalItems);
            if (!response.ok) {
                console.log('  Error:', data.message);
            }
        } catch (error) {
            console.log('✗ Raw API call failed:', error.message);
        }
        
        // Test 6: Create a test project
        console.log('\n6. Creating test project...');
        try {
            const testProject = await pb.collection('projects').create({
                user: userId,
                name: 'Debug Test Project ' + new Date().toISOString(),
                description: 'Created for debugging',
                procurement_type: 'Dienst',
                threshold_type: 'unterschwellig',
                form_data: { test: 'data' },
                status: 'draft'
            });
            console.log('✓ Project created successfully!');
            console.log('  Project ID:', testProject.id);
            console.log('  Project name:', testProject.name);
            
            // Try to fetch it back
            const fetched = await pb.collection('projects').getOne(testProject.id);
            console.log('✓ Project fetched back successfully!');
        } catch (error) {
            console.log('✗ Failed to create project:', error.message);
            console.log('  Error data:', error.data);
        }
        
        // Test 7: Check collection rules
        console.log('\n7. Checking collection rules...');
        try {
            const response = await fetch('http://localhost:8091/api/collections/projects', {
                headers: {
                    'Authorization': pb.authStore.token
                }
            });
            const collection = await response.json();
            console.log('  List rule:', collection.listRule || 'none');
            console.log('  View rule:', collection.viewRule || 'none');
            console.log('  Create rule:', collection.createRule || 'none');
        } catch (error) {
            console.log('✗ Failed to fetch collection info');
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

debug().then(() => {
    console.log('\n=== DEBUG COMPLETE ===');
    process.exit(0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});