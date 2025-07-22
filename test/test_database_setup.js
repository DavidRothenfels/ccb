// Test database setup and create test data
const PocketBase = require('pocketbase/cjs')

async function testDatabaseSetup() {
  const pb = new PocketBase('http://localhost:8091')
  
  console.log('Testing PocketBase connection...')
  
  try {
    // Check health
    const health = await fetch('http://localhost:8091/api/health').then(r => r.json())
    console.log('✓ Health check:', health)
    
    // Check collections
    const collectionsResponse = await fetch('http://localhost:8091/api/collections').then(r => r.json())
    console.log('✓ Collections response:', collectionsResponse)
    const collections = collectionsResponse.items || collectionsResponse || []
    console.log('✓ Collections created:', Array.isArray(collections) ? collections.map(c => c.name) : 'Check admin panel')
    
    // Create superuser for testing
    console.log('\n Creating test superuser...')
    const adminAuth = await pb.admins.authWithPassword('admin@citychallenge.berlin', 'citychallenge2025').catch(() => null)
    
    if (!adminAuth) {
      console.log('Please create admin first: ./pocketbase superuser upsert admin@citychallenge.berlin citychallenge2025')
      return
    }
    
    console.log('✓ Admin authenticated')
    
    // Create test template
    const templateData = {
      name: 'Aufforderung zur Interessensbestätigung',
      category: 'VgV',
      original_filename: 'wirt-1231-eu-p-aufforderung.docx',
      active: true,
      template_fields: {
        auftraggeber_name: {
          type: 'text',
          label: 'Name des Auftraggebers',
          required: true,
          max_length: 255
        },
        auftraggeber_adresse: {
          type: 'text',
          label: 'Adresse des Auftraggebers',
          required: true,
          max_length: 500
        },
        vergabenummer: {
          type: 'text',
          label: 'Vergabenummer',
          required: true,
          max_length: 50
        },
        leistungsbeschreibung: {
          type: 'textarea',
          label: 'Beschreibung der Leistung',
          required: true,
          max_length: 2000
        },
        submission_deadline: {
          type: 'datetime',
          label: 'Abgabefrist',
          required: true
        },
        contact_email: {
          type: 'email',
          label: 'Kontakt E-Mail',
          required: true
        }
      },
      template_content: {
        sections: [
          {
            type: 'header',
            content: 'Aufforderung zur Interessensbestätigung'
          },
          {
            type: 'paragraph',
            content: 'Sehr geehrte Damen und Herren,'
          },
          {
            type: 'paragraph',
            content: 'hiermit fordern wir Sie auf, Ihr Interesse an der folgenden Vergabe zu bestätigen:'
          },
          {
            type: 'field_block',
            fields: ['auftraggeber_name', 'auftraggeber_adresse', 'vergabenummer']
          },
          {
            type: 'paragraph',
            content: 'Leistungsbeschreibung:',
            fields: ['leistungsbeschreibung']
          },
          {
            type: 'paragraph',
            content: 'Bitte bestätigen Sie Ihr Interesse bis zum:',
            fields: ['submission_deadline']
          },
          {
            type: 'paragraph',
            content: 'Für Rückfragen wenden Sie sich bitte an:',
            fields: ['contact_email']
          }
        ]
      },
      field_mappings: {}
    }
    
    const template = await pb.collection('templates').create(templateData)
    console.log('✓ Template created:', template.id)
    
    // Create test project
    const projectData = {
      user: 'test_user_1',
      name: 'Test Vergabeprojekt 2025',
      description: 'Testprojekt für die Citychallenge',
      procurement_type: 'Dienst',
      threshold_type: 'unterschwellig',
      status: 'draft',
      form_data: {
        auftraggeber_name: 'Senatsverwaltung für Wirtschaft',
        auftraggeber_adresse: 'Martin-Luther-Straße 105, 10825 Berlin',
        vergabenummer: 'SEN-WEB-2025-001',
        leistungsbeschreibung: 'Entwicklung einer digitalen Vergabeplattform',
        submission_deadline: '2025-08-15T14:00:00Z',
        contact_email: 'vergabe@berlin.de'
      }
    }
    
    const project = await pb.collection('projects').create(projectData)
    console.log('✓ Project created:', project.id)
    
    // Create test document
    const documentData = {
      project: project.id,
      template: template.id,
      version: 1,
      filled_content: {
        ...templateData.template_content,
        filled_data: projectData.form_data
      }
    }
    
    const document = await pb.collection('documents').create(documentData)
    console.log('✓ Document created:', document.id)
    
    // Create test comment
    const commentData = {
      document: document.id,
      author: 'admin_user',
      comment_text: '<p>Bitte prüfen Sie die Vergabenummer auf Korrektheit.</p>',
      field_reference: 'vergabenummer',
      status: 'open'
    }
    
    const comment = await pb.collection('comments').create(commentData)
    console.log('✓ Comment created:', comment.id)
    
    // Create API config
    const apiConfigData = {
      name: 'Berlin Vergabeplattform',
      api_url: 'https://www.berlin.de/vergabeplattform/api/v1/submit',
      auth_token: 'DEMO_TOKEN_REPLACE_IN_PRODUCTION',
      data_format: 'json',
      active: true,
      request_template: {
        api_version: '1.0',
        submission_type: 'procurement_documents',
        auth: {
          token: '{{auth_token}}',
          timestamp: '{{timestamp}}'
        },
        data: {
          procurement_id: '{{vergabenummer}}',
          documents: '{{documents}}',
          metadata: {
            submitted_by: '{{user_email}}',
            submission_date: '{{date}}'
          }
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': '1.0'
      }
    }
    
    const apiConfig = await pb.collection('api_configs').create(apiConfigData)
    console.log('✓ API Config created:', apiConfig.id)
    
    console.log('\n✅ All test data created successfully!')
    console.log('\nYou can now access:')
    console.log('- Admin Dashboard: http://localhost:8091/_/')
    console.log('- API: http://localhost:8091/api/')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Check if running directly
if (require.main === module) {
  testDatabaseSetup()
}

module.exports = { testDatabaseSetup }