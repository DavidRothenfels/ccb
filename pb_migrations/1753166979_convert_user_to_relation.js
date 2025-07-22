/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Convert user field from text to relation and set proper permissions
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    
    // Find the user field and update it to be a relation
    const userField = projectsCollection.fields.find(f => f.name === "user")
    if (userField) {
      // Update field to be a relation to users collection
      userField.type = "relation"
      userField.collectionId = app.findCollectionByNameOrId("users").id
      userField.cascadeDelete = false
      userField.minSelect = null
      userField.maxSelect = 1
      
      // Remove old text field properties
      delete userField.max
      delete userField.min
      delete userField.pattern
    }
    
    // Update collection rules to use proper relation syntax
    projectsCollection.listRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.createRule = "@request.auth.id != ''"
    projectsCollection.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.deleteRule = "@request.auth.id != '' && user = @request.auth.id"
    
    app.save(projectsCollection)
    console.log("Converted user field to relation and updated permissions")
    
    // Also update documents collection if it has project relation
    try {
      const documentsCollection = app.findCollectionByNameOrId("documents")
      documentsCollection.listRule = "@request.auth.id != '' && project.user = @request.auth.id"
      documentsCollection.viewRule = "@request.auth.id != '' && project.user = @request.auth.id"
      documentsCollection.createRule = "@request.auth.id != ''"
      documentsCollection.updateRule = "@request.auth.id != '' && project.user = @request.auth.id"
      documentsCollection.deleteRule = "@request.auth.id != '' && project.user = @request.auth.id"
      app.save(documentsCollection)
      console.log("Updated documents collection permissions")
    } catch (e) {
      console.log("Documents collection update skipped:", e)
    }
    
    // Update project_data collection if it exists
    try {
      const projectDataCollection = app.findCollectionByNameOrId("project_data")
      projectDataCollection.listRule = "@request.auth.id != '' && project.user = @request.auth.id"
      projectDataCollection.viewRule = "@request.auth.id != '' && project.user = @request.auth.id"
      projectDataCollection.createRule = "@request.auth.id != ''"
      projectDataCollection.updateRule = "@request.auth.id != '' && project.user = @request.auth.id"
      projectDataCollection.deleteRule = "@request.auth.id != '' && project.user = @request.auth.id"
      app.save(projectDataCollection)
      console.log("Updated project_data collection permissions")
    } catch (e) {
      console.log("project_data collection update skipped:", e)
    }
    
  } catch (e) {
    console.error("Failed to convert user field to relation:", e)
    throw e
  }
  
}, (app) => {
  // Rollback - convert back to text field
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    const userField = projectsCollection.fields.find(f => f.name === "user")
    if (userField) {
      userField.type = "text"
      userField.required = true
      userField.max = 100
      delete userField.collectionId
      delete userField.cascadeDelete
      delete userField.minSelect
      delete userField.maxSelect
    }
    
    projectsCollection.listRule = "@request.auth.id != ''"
    projectsCollection.viewRule = "@request.auth.id != ''"
    
    app.save(projectsCollection)
  } catch (e) {
    // Ignore rollback errors
  }
});