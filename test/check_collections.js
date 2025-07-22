// Check collections and rules
const PocketBase = require('pocketbase/cjs')

async function checkCollections() {
  const pb = new PocketBase('http://localhost:8091')
  
  console.log('Checking collections setup...\n')
  
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword('admin@citychallenge.berlin', 'citychallenge2025')
    console.log('✓ Admin authenticated')
    
    // Get all collections
    const response = await fetch('http://localhost:8091/api/collections', {
      headers: {
        'Authorization': pb.authStore.token
      }
    })
    
    const collections = await response.json()
    
    console.log('\nCollections found:')
    collections.forEach(col => {
      console.log(`\n${col.name}:`)
      console.log('- Type:', col.type)
      console.log('- List Rule:', col.listRule || 'none')
      console.log('- View Rule:', col.viewRule || 'none')
      console.log('- Create Rule:', col.createRule || 'none')
      console.log('- Update Rule:', col.updateRule || 'none')
      console.log('- Delete Rule:', col.deleteRule || 'none')
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkCollections()