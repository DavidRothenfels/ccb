/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fix projects collection to allow users to see their own projects
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    
    // Allow authenticated users to list and view their own projects
    projectsCollection.listRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.createRule = "@request.auth.id != ''"
    projectsCollection.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.deleteRule = "@request.auth.id != '' && user = @request.auth.id"
    
    app.save(projectsCollection)
    console.log("Updated projects collection permissions - users can now see their own projects")
    
    // Also ensure documents collection has proper permissions
    const documentsCollection = app.findCollectionByNameOrId("documents")
    if (documentsCollection) {
      documentsCollection.listRule = "@request.auth.id != ''"
      documentsCollection.viewRule = "@request.auth.id != ''"
      app.save(documentsCollection)
      console.log("Updated documents collection permissions")
    }
    
    // Try to update project_data collection if it exists
    try {
      const projectDataCollection = app.findCollectionByNameOrId("project_data")
      projectDataCollection.listRule = "@request.auth.id != ''"
      projectDataCollection.viewRule = "@request.auth.id != ''"
      app.save(projectDataCollection)
      console.log("Updated project_data collection permissions")
    } catch (e) {
      console.log("project_data collection not found, skipping")
    }
    
  } catch (e) {
    console.error("Failed to update permissions:", e)
    throw e
  }
  
}, (app) => {
  // Rollback to previous state
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    projectsCollection.listRule = null
    projectsCollection.viewRule = null
    app.save(projectsCollection)
  } catch (e) {
    // Ignore rollback errors
  }
});