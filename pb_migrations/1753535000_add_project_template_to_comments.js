/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("comments")
  
  // Add project field
  collection.fields.add(new Field({
    "id": "text_project",
    "name": "project",
    "type": "text",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "max": 100
  }))
  
  // Add template field
  collection.fields.add(new Field({
    "id": "text_template",
    "name": "template",
    "type": "text",
    "required": false,
    "presentable": false,
    "system": false,
    "hidden": false,
    "max": 100
  }))
  
  // Make document field optional since we'll use it OR project/template
  const documentField = collection.fields.find(f => f.name === "document")
  if (documentField) {
    documentField.required = false
  }
  
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("comments")
  
  // Remove the new fields
  collection.fields.removeById("text_project")
  collection.fields.removeById("text_template")
  
  // Make document field required again
  const documentField = collection.fields.find(f => f.name === "document")
  if (documentField) {
    documentField.required = true
  }
  
  return app.save(collection)
})