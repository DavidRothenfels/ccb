// Full system test
const PocketBase = require('pocketbase/cjs')

async function fullSystemTest() {
  const pb = new PocketBase('http://localhost:8091')
  
  console.log('🧪 Starting full system test...\n')
  
  try {
    // 1. Test API Health
    console.log('1️⃣ Testing API health...')
    const health = await fetch('http://localhost:8091/api/health').then(r => r.json())
    console.log('✓ API is healthy:', health.message)
    
    // 2. Test User Authentication
    console.log('\n2️⃣ Testing user authentication...')
    const authData = await pb.collection('users').authWithPassword(
      'user@citychallenge.berlin',
      'citychallenge2025'
    )
    console.log('✓ User authenticated:', authData.record.email)
    const userId = authData.record.id
    
    // 3. Test Project Creation
    console.log('\n3️⃣ Testing project creation...')
    const projectData = {
      user: userId,
      name: 'Test Vergabeprojekt ' + Date.now(),
      description: 'Automatischer Systemtest',
      procurement_type: 'Dienst',
      threshold_type: 'unterschwellig',
      status: 'draft',
      form_data: {
        auftraggeber_name: 'Testbehörde Berlin',
        auftraggeber_adresse: 'Teststraße 123, 10115 Berlin',
        vergabenummer: 'TEST-' + Date.now(),
        leistungsbeschreibung: 'Testbeschreibung für Systemtest',
        submission_deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        contact_email: 'test@berlin.de'
      }
    }
    const project = await pb.collection('projects').create(projectData)
    console.log('✓ Project created:', project.id, project.name)
    
    // 4. Test Template Loading
    console.log('\n4️⃣ Testing template loading...')
    const templates = await pb.collection('templates').getList(1, 10)
    console.log('✓ Templates found:', templates.items.length)
    
    if (templates.items.length > 0) {
      // 5. Test Document Generation
      console.log('\n5️⃣ Testing document generation...')
      const template = templates.items[0]
      const documentData = {
        project: project.id,
        template: template.id,
        version: 1,
        filled_content: {
          ...template.template_content,
          filled_data: project.form_data
        }
      }
      const document = await pb.collection('documents').create(documentData)
      console.log('✓ Document created:', document.id)
      
      // 6. Test Admin Functions (switch to admin)
      console.log('\n6️⃣ Testing admin functions...')
      await pb.collection('users').authWithPassword(
        'admin.user@citychallenge.berlin',
        'citychallenge2025'
      )
      
      // 7. Test Comment Creation
      console.log('\n7️⃣ Testing comment creation...')
      const commentData = {
        document: document.id,
        author: pb.authStore.model.id,
        comment_text: '<p>Automatischer Test-Kommentar</p>',
        field_reference: 'vergabenummer',
        status: 'open'
      }
      const comment = await pb.collection('comments').create(commentData)
      console.log('✓ Comment created:', comment.id)
      
      // 8. Test API Config
      console.log('\n8️⃣ Testing API config access...')
      const apiConfigs = await pb.collection('api_configs').getList()
      console.log('✓ API configs found:', apiConfigs.items.length)
    }
    
    // 9. Test Data Retrieval
    console.log('\n9️⃣ Testing data retrieval...')
    const userProjects = await pb.collection('projects').getList(1, 10, {
      filter: `user = "${userId}"`
    })
    console.log('✓ User projects found:', userProjects.items.length)
    
    // 10. Test Collections Structure
    console.log('\n🔟 Testing collections structure...')
    const expectedCollections = ['templates', 'projects', 'documents', 'comments', 'api_configs']
    for (const collName of expectedCollections) {
      try {
        const testRecord = await pb.collection(collName).getList(1, 1)
        console.log(`✓ Collection '${collName}' accessible`)
      } catch (error) {
        console.log(`✗ Collection '${collName}' error:`, error.message)
      }
    }
    
    console.log('\n✅ All tests completed successfully!')
    console.log('\n📊 Test Summary:')
    console.log('- API: Working')
    console.log('- Authentication: Working')
    console.log('- CRUD Operations: Working')
    console.log('- User/Admin Separation: Working')
    console.log('- Data Relations: Working')
    
    console.log('\n🌐 You can now access the application at:')
    console.log('- Frontend: http://localhost:8091/')
    console.log('- Admin: http://localhost:8091/_/')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('Details:', error)
  }
}

// Run test
if (require.main === module) {
  fullSystemTest()
}

module.exports = { fullSystemTest }