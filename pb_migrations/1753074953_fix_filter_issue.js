/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Fix projects collection to allow proper filtering
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    
    // Remove the user filter from list/view rules to allow client-side filtering
    // Keep authentication requirement but let the client filter by user
    projectsCollection.listRule = "@request.auth.id != ''"
    projectsCollection.viewRule = "@request.auth.id != ''"
    projectsCollection.createRule = "@request.auth.id != ''"
    projectsCollection.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.deleteRule = "@request.auth.id != '' && user = @request.auth.id"
    
    app.save(projectsCollection)
    console.log("Updated projects collection to allow client-side user filtering")
    
  } catch (e) {
    console.error("Failed to update project permissions:", e)
  }
  
}, (app) => {
  // Rollback
  try {
    const projectsCollection = app.findCollectionByNameOrId("projects")
    projectsCollection.listRule = "@request.auth.id != '' && user = @request.auth.id"
    projectsCollection.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    app.save(projectsCollection)
  } catch (e) {
    // Ignore
  }
});