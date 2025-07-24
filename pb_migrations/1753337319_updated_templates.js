/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select2766044537",
    "maxSelect": 1,
    "name": "threshold_type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "oberschwellig",
      "unterschwellig",
      "beide"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // remove field
  collection.fields.removeById("select2766044537")

  return app.save(collection)
})
