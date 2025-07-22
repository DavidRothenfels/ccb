/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Create Templates Collection
  const templates = new Collection({
    type: "base",
    name: "templates",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        max: 255
      },
      {
        name: "category",
        type: "text",
        required: true,
        max: 50
      },
      {
        name: "original_filename",
        type: "text", 
        required: true,
        max: 500
      },
      {
        name: "template_fields",
        type: "json",
        required: true
      },
      {
        name: "template_content",
        type: "json",
        required: true
      },
      {
        name: "field_mappings",
        type: "json",
        required: false
      },
      {
        name: "active",
        type: "bool",
        required: false
      }
    ]
  })
  
  // Create Projects Collection
  const projects = new Collection({
    type: "base",
    name: "projects",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "user",
        type: "text",
        required: true,
        max: 100
      },
      {
        name: "name",
        type: "text",
        required: true,
        max: 255
      },
      {
        name: "description",
        type: "text",
        required: false,
        max: 1000
      },
      {
        name: "procurement_type",
        type: "text",
        required: true,
        max: 50
      },
      {
        name: "threshold_type",
        type: "text",
        required: true,
        max: 50
      },
      {
        name: "form_data",
        type: "json",
        required: true
      },
      {
        name: "status",
        type: "text",
        required: false,
        max: 50
      }
    ]
  })
  
  // Create Documents Collection
  const documents = new Collection({
    type: "base",
    name: "documents",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "project",
        type: "text",
        required: true,
        max: 100
      },
      {
        name: "template",
        type: "text",
        required: true,
        max: 100
      },
      {
        name: "filled_content",
        type: "json",
        required: true
      },
      {
        name: "docx_file",
        type: "text",
        required: false,
        max: 500
      },
      {
        name: "version",
        type: "number",
        required: false,
        min: 1
      }
    ]
  })
  
  // Create Comments Collection
  const comments = new Collection({
    type: "base",
    name: "comments",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "document",
        type: "text",
        required: true,
        max: 100
      },
      {
        name: "author",
        type: "text", 
        required: true,
        max: 100
      },
      {
        name: "comment_text",
        type: "editor",
        required: true,
        max: 2000
      },
      {
        name: "field_reference",
        type: "text",
        required: false,
        max: 255
      },
      {
        name: "status",
        type: "text",
        required: false,
        max: 50
      }
    ]
  })
  
  // Create API Configs Collection
  const api_configs = new Collection({
    type: "base",
    name: "api_configs",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        max: 255
      },
      {
        name: "api_url",
        type: "url",
        required: true
      },
      {
        name: "auth_token",
        type: "text",
        required: false,
        max: 1000
      },
      {
        name: "data_format",
        type: "text",
        required: true,
        max: 50
      },
      {
        name: "request_template",
        type: "json",
        required: true
      },
      {
        name: "headers",
        type: "json",
        required: false
      },
      {
        name: "active",
        type: "bool",
        required: false
      }
    ]
  })
  
  // Save all collections
  app.save(templates)
  app.save(projects)
  app.save(documents)
  app.save(comments)
  app.save(api_configs)
  
}, (app) => {
  // Rollback
  const collections = ["templates", "projects", "documents", "comments", "api_configs", "test_collection"]
  collections.forEach(name => {
    try {
      const collection = app.findCollectionByNameOrId(name)
      app.delete(collection)
    } catch (e) {
      // Collection doesn't exist
    }
  })
})