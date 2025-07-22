/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Temporarily remove all restrictions for debugging
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    
    // Remove all rules to debug the issue
    projectsCollection.listRule = null
    projectsCollection.viewRule = null
    projectsCollection.createRule = "@request.auth.id != ''"
    projectsCollection.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.deleteRule = "@request.auth.id != '' && user = @request.auth.id"
    
    app.save(projectsCollection)
    console.log("Temporarily removed all list/view restrictions from projects")
    
    // Also update documents collection
    const documentsCollection = app.findCollectionByNameOrId("documents")
    documentsCollection.listRule = null
    documentsCollection.viewRule = null
    
    app.save(documentsCollection)
    console.log("Removed restrictions from documents collection")
    
  } catch (e) {
    console.error("Failed to update permissions:", e)
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