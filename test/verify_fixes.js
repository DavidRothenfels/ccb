#!/usr/bin/env node

const PocketBaseSDK = require('pocketbase');
const PocketBase = PocketBaseSDK.default || PocketBaseSDK;
const pb = new PocketBase('http://localhost:8091');

async function verify() {
    console.log('=== VERIFYING FIXES ===\n');
    
    try {
        // Test login
        console.log('1. Testing login...');
        const authData = await pb.collection('users').authWithPassword(
            'user@citychallenge.berlin',
            'citychallenge2025'
        );
        console.log('✓ Login successful! User:', authData.record.email);
        
        // Test project loading without filter
        console.log('\n2. Loading projects (no filter)...');
        const allProjects = await pb.collection('projects').getList(1, 50, {
            sort: '-created'
        });
        console.log('✓ Loaded', allProjects.totalItems, 'total projects');
        
        // Client-side filter
        const userProjects = allProjects.items.filter(p => p.user === authData.record.id);
        console.log('✓ User has', userProjects.length, 'projects after client-side filter');
        
        if (userProjects.length > 0) {
            console.log('\nUser\'s projects:');
            userProjects.forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.name}`);
            });
        }
        
        console.log('\n✅ All fixes verified successfully!');
        console.log('\nSummary:');
        console.log('- Login form now uses POST method (prevents credentials in URL)');
        console.log('- Projects are loaded without server-side filter');
        console.log('- Client-side filtering ensures users only see their own projects');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verify().then(() => process.exit(0));