// Debug script for projects issue

async function debugProjects() {
    const pb = new PocketBase('http://localhost:8091');
    
    try {
        // Try to login with test user
        const authData = await pb.collection('users').authWithPassword(
            'test@example.com',
            'testpassword123'
        );
        
        console.log('Logged in as:', authData.record);
        console.log('User ID:', authData.record.id);
        console.log('User email:', authData.record.email);
        
        // Try to fetch projects without filter
        try {
            const allProjects = await pb.collection('projects').getList(1, 50);
            console.log('\nAll projects (admin view):', allProjects.totalItems);
            allProjects.items.forEach(p => {
                console.log(`- ${p.name} (user: ${p.user})`);
            });
        } catch (e) {
            console.log('Cannot fetch all projects (expected for non-admin)');
        }
        
        // Try to fetch user's projects
        try {
            const userProjects = await pb.collection('projects').getList(1, 50, {
                filter: `user = "${authData.record.id}"`
            });
            console.log('\nUser projects:', userProjects.totalItems);
            userProjects.items.forEach(p => {
                console.log(`- ${p.name}`);
            });
        } catch (e) {
            console.log('Error fetching user projects:', e.message);
        }
        
        // Try to create a new project
        try {
            const newProject = await pb.collection('projects').create({
                name: 'Test Project ' + new Date().toISOString(),
                description: 'Testing project creation',
                user: authData.record.id,
                procurement_type: 'Dienst',
                threshold_type: 'unterschwellig',
                form_data: {},
                status: 'draft'
            });
            console.log('\nSuccessfully created project:', newProject.name);
        } catch (e) {
            console.log('Error creating project:', e.message);
        }
        
    } catch (error) {
        console.error('Login failed:', error);
    }
}

// Run the debug script
debugProjects();