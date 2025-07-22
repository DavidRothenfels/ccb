// Create test users script
const PocketBase = require('pocketbase/cjs')

async function createTestUsers() {
  const pb = new PocketBase('http://localhost:8091')
  
  console.log('Creating test users...')
  
  try {
    // First authenticate as admin
    await pb.admins.authWithPassword('admin@citychallenge.berlin', 'citychallenge2025')
    console.log('✓ Admin authenticated')
    
    // Create standard test user
    try {
      const userData = {
        email: 'user@citychallenge.berlin',
        password: 'citychallenge2025',
        passwordConfirm: 'citychallenge2025',
        username: 'testuser',
        emailVisibility: false,
        verified: true,
        user_type: 'standard'
      }
      
      await pb.collection('users').create(userData)
      console.log('✓ Standard user created: user@citychallenge.berlin')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('! Standard user already exists')
      } else {
        throw error
      }
    }
    
    // Create admin test user
    try {
      const adminData = {
        email: 'admin.user@citychallenge.berlin',
        password: 'citychallenge2025',
        passwordConfirm: 'citychallenge2025',
        username: 'adminuser',
        emailVisibility: false,
        verified: true,
        user_type: 'admin'
      }
      
      await pb.collection('users').create(adminData)
      console.log('✓ Admin user created: admin.user@citychallenge.berlin')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('! Admin user already exists')
      } else {
        throw error
      }
    }
    
    // Update existing admin superuser to have user_type
    try {
      const admins = await pb.admins.getList()
      for (const admin of admins.items) {
        if (admin.email === 'admin@citychallenge.berlin') {
          // Note: Can't update admin through users collection
          console.log('! Superuser admin@citychallenge.berlin exists (use for admin access)')
        }
      }
    } catch (error) {
      console.log('Could not check admins')
    }
    
    console.log('\n✅ Test users ready!')
    console.log('\nLogin credentials:')
    console.log('- Standard User: user@citychallenge.berlin / citychallenge2025')
    console.log('- Admin User: admin.user@citychallenge.berlin / citychallenge2025')
    console.log('- Superuser: admin@citychallenge.berlin / citychallenge2025')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run if called directly
if (require.main === module) {
  createTestUsers()
}

module.exports = { createTestUsers }