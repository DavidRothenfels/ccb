/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Simplify projects collection rules to fix filter issues
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    
    // Allow any authenticated user to list/view - we'll filter client-side
    projectsCollection.listRule = "@request.auth.id != ''"
    projectsCollection.viewRule = "@request.auth.id != ''"
    projectsCollection.createRule = "@request.auth.id != ''"
    projectsCollection.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.deleteRule = "@request.auth.id != '' && user = @request.auth.id"
    
    app.save(projectsCollection)
    console.log("Simplified projects collection rules to fix filter issues")
    
  } catch (e) {
    console.error("Failed to update permissions:", e)
    throw e
  }
  
}, (app) => {
  // Rollback
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    projectsCollection.listRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    app.save(projectsCollection)
  } catch (e) {
    // Ignore rollback errors
  }
});