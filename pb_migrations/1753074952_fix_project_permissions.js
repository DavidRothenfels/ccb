/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fix projects collection to use proper user filtering
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    
    // Update list and view rules to filter by user field
    projectsCollection.listRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.createRule = "@request.auth.id != ''"
    projectsCollection.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.deleteRule = "@request.auth.id != '' && user = @request.auth.id"
    
    app.save(projectsCollection)
    console.log("Updated projects collection permissions to filter by user")
    
    // Do the same for documents
    const documentsCollection = app.findCollectionByNameOrId("documents")
    documentsCollection.listRule = "@request.auth.id != ''"
    documentsCollection.viewRule = "@request.auth.id != ''"
    
    app.save(documentsCollection)
    console.log("Updated documents collection permissions")
    
  } catch (e) {
    console.error("Failed to update project permissions:", e)
  }
  
}, (app) => {
  // Rollback
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    projectsCollection.listRule = "@request.auth.id != ''"
    projectsCollection.viewRule = "@request.auth.id != ''"
    app.save(projectsCollection)
  } catch (e) {
    // Ignore
  }
});