/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fix collection permissions
  const collections = ['templates', 'projects', 'documents', 'comments', 'api_configs']
  
  collections.forEach(name => {
    try {
      const collection = app.findCollectionByNameOrId(name)
      
      switch(name) {
        case 'templates':
          collection.listRule = ""  // Anyone can list
          collection.viewRule = ""  // Anyone can view
          collection.createRule = null  // Only admins via admin panel
          collection.updateRule = null
          collection.deleteRule = null
          break
          
        case 'projects':
          collection.listRule = "@request.auth.id != ''"  // Any authenticated user
          collection.viewRule = "@request.auth.id != ''"
          collection.createRule = "@request.auth.id != ''"
          collection.updateRule = "@request.auth.id != ''"
          collection.deleteRule = "@request.auth.id != ''"
          break
          
        case 'documents':
          collection.listRule = "@request.auth.id != ''"
          collection.viewRule = "@request.auth.id != ''"
          collection.createRule = "@request.auth.id != ''"
          collection.updateRule = "@request.auth.id != ''"
          collection.deleteRule = "@request.auth.id != ''"
          break
          
        case 'comments':
          collection.listRule = "@request.auth.id != ''"
          collection.viewRule = "@request.auth.id != ''"
          collection.createRule = "@request.auth.id != ''"
          collection.updateRule = "@request.auth.id != ''"
          collection.deleteRule = "@request.auth.id != ''"
          break
          
        case 'api_configs':
          collection.listRule = "@request.auth.id != ''"
          collection.viewRule = "@request.auth.id != ''"
          collection.createRule = null
          collection.updateRule = null
          collection.deleteRule = null
          break
      }
      
      app.save(collection)
      console.log(`Updated permissions for ${name}`)
    } catch (e) {
      console.error(`Failed to update ${name}:`, e)
    }
  })
  
  // Add user_type field to users collection if missing
  try {
    const usersCollection = app.findCollectionByNameOrId("users")
    const hasUserType = usersCollection.fields.some(f => f.name === "user_type")
    
    if (!hasUserType) {
      usersCollection.fields.push({
        name: "user_type",
        type: "select",
        required: false,
        options: {
          maxSelect: 1,
          values: ["standard", "admin"]
        }
      })
      app.save(usersCollection)
      console.log("Added user_type field to users collection")
    }
  } catch (e) {
    console.error("Failed to update users collection:", e)
  }
  
}, (app) => {
  // No rollback needed for permission changes
})