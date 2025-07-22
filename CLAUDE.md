# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CityChallenge - Vergabe-Vorbereitungs-Tool

## Project Overview
Digital procurement preparation tool for City Challenge Berlin 2025, supporting administrative processes for public procurement procedures.

## Technology Stack
- **Backend**: PocketBase v0.28.4 (Go-based BaaS)
- **Frontend**: Vanilla JavaScript (no framework)
- **Database**: SQLite (built into PocketBase)
- **Document Processing**: DOCX templates with dynamic filling
- **Dependencies**: docx, jszip, mammoth, pocketbase SDK

## Commands

### Starting the Application
```bash
# Primary method
./start_pocketbase.sh

# Alternative (from project root)
./pocketbase serve --http=0.0.0.0:8091 --dir=./pb_data
```

### Access Points
- Application: `http://localhost:8091/`
- Admin Dashboard: `http://localhost:8091/_/`

### Default Credentials
- User: `user@citychallenge.berlin` / `citychallenge2025`
- Admin: `admin.user@citychallenge.berlin` / `citychallenge2025`
- Superuser: `admin@citychallenge.berlin` / `citychallenge2025`

### Database Management
```bash
# Direct SQLite access (from pb_data directory)
sqlite3 data.db

# View logs
tail -f pocketbase.log

# Create new migration
touch pb_migrations/$(date +%s)_description.js
```

### Testing
```bash
# Run database setup test
node test/test_database_setup.js

# Create test users
node test/create_test_users.js

# Frontend tests accessible via browser
http://localhost:8091/test/test_frontend.html
```

## Architecture

### Directory Structure
- `/pb_data/` - PocketBase data (SQLite databases)
- `/pb_public/` - Frontend SPA files
- `/pb_migrations/` - Database schema migrations
- `/pb_hooks/` - Server-side JavaScript hooks (currently empty)
- `/templates/` - DOCX template management
  - `/templates/original/` - Original forms from berlin.de
- `/test/` - Test scripts and HTML test pages

### Database Collections
- **users** - User accounts with roles (user/admin)
- **projects** - User procurement projects
- **templates** - DOCX form templates with placeholders
- **template_fields** - Field definitions per template
- **project_data** - Filled field values per project
- **generated_documents** - Generated documents
- **comments** - Admin comments on documents
- **api_config** - Berlin procurement platform API config

### Frontend Architecture
- Single Page Application in `/pb_public/`
- PocketBase SDK for API communication
- Real-time updates via WebSocket
- Split view: Forms (left) | Documents (right)
- Admin popup for document comments

## Critical Development Notes

### PocketBase Hook Development
**IMPORTANT**: Always restart PocketBase after modifying hooks in `/pb_hooks/`
- Hooks use ES5 JavaScript only (no modern JS features)
- No browser/Node.js APIs (fetch, setTimeout, Promise, async/await)
- Use `$app.dao()` for database access
- v0.28 API: `onRecordCreate((e) => { e.next() })` pattern

### PocketBase Database Modifications
**IMPORTANT**: See `pb.md` for detailed instructions on direct database modifications
- When migrations fail, use direct SQLite modifications as documented in pb.md
- Always backup before direct database changes
- Common issues like field type conversions are documented there

### Database Operations in Hooks
```javascript
// Find record
const record = $app.dao().findRecordById("collection_name", "id")

// Create record
const collection = $app.dao().findCollectionByNameOrId("collection_name")
const newRecord = new Record(collection, { field: "value" })
$app.dao().saveRecord(newRecord)

// Query records - NO SPACES around operators
const records = $app.dao().findRecordsByExpr("collection_name", 
  $dbx.exp("field='value'"))
```

### Migration Pattern
```javascript
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "collection_name",
    listRule: "@request.auth.id = user_id",
    createRule: "@request.auth.id != ''",
    fields: [
      { name: "field", type: "text", required: true }
    ]
  })
  app.save(collection)
}, (app) => {
  // Rollback
  const collection = app.findCollectionByNameOrId("collection_name")
  app.delete(collection)
})
```

### Document Processing
- Templates stored in `/templates/` directory
- Client-side DOCX generation using docx library
- Placeholder format: `{{field_name}}`
- Real-time preview updates on field changes

## Key Workflows

### Template Import
1. Upload DOCX from berlin.de/vergabeservice
2. System extracts fields and creates placeholders
3. Template saved with field definitions

### Project Creation
1. User creates new project
2. Fills all template fields in unified form
3. System generates documents in real-time
4. Documents available for download/export

### Admin Review
1. Admin opens project documents
2. Adds comments via popup interface
3. Comments visible in document view
4. Export includes comment summary

## Important Constraints
- All changes only in `/citychallenge` directory
- Never modify root files outside project
- Templates stored locally, not in database
- DSGVO-compliant implementation required
- No AI/LLM integration in core system

## Troubleshooting
- **Hooks not triggering**: Restart PocketBase
- **Create record errors**: Check PocketBase logs
- **Filter errors**: Remove spaces around operators
- **Frontend not updating**: Check WebSocket connection