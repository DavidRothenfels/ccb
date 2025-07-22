# Vergabe-Vorbereitungs-Tool - Revised Implementation Plan

*Developed through collaborative analysis with Gemini AI*  
*Version: 2.0 - Simplified MVP Approach | Date: January 2025*

## Executive Summary

This revised implementation plan presents a **dramatically simplified approach** for the Vergabe-Vorbereitungs-Tool, focusing on the core requirement: **Template-based DOCX generation while preserving Berlin.de originals**. Based on detailed technical analysis and user feedback, we pivot to a **PocketBase + Go CLI hybrid solution** for ultra-simple deployment and maximum reliability.

## Key Changes from v1.0

- **No separate Node.js service** - Everything runs through PocketBase
- **Go CLI tool** for DOCX processing called via PocketBase hooks
- **No HTML preview** - Focus purely on DOCX generation
- **Minimal UI complexity** - Build on existing interface patterns
- **Ultra-simple deployment** - Two static binaries only

## Technical Architecture - Simplified

### Core Architecture
```
Frontend (Vanilla JS) ← WebSocket → PocketBase (Go) ← exec() → Go CLI Tool
                                      ↓                         ↓
                          SQLite Collections              DOCX Processing
                          - templates (original files)    (Copy → Fill → Save)
                          - projects, project_data
                          - generated_documents
```

### Technology Stack - Final
- **Backend**: PocketBase v0.28.4 with JavaScript hooks only
- **Frontend**: Vanilla JavaScript (extend existing interface)
- **Database**: SQLite (existing collections + file storage)
- **DOCX Processing**: Go CLI tool with github.com/nguyendh/go-docx-template
- **Document Preview**: **NONE for MVP** - Direct DOCX download only
- **Deployment**: PocketBase binary + Go CLI binary (2 files total)

### Key Design Principles

#### 1. Original Template Preservation
**Implementation**: Berlin.de DOCX templates stored as files in PocketBase, **never modified**
**Process**: CLI tool creates copy → fills copy → returns filled document

#### 2. PocketBase-Centric Approach
**Hook Integration**: Use `$app.exec()` to call Go CLI from PocketBase JavaScript hooks
**Benefits**: Single deployment, unified auth, real-time updates via existing WebSocket

#### 3. Minimal Complexity
**UI**: Extend existing project interface with simple template selection
**Processing**: Direct form → JSON → Go CLI → DOCX download workflow

## Database Schema - Simplified

### Extended Collections (build on existing)

#### templates (new)
- `id` (auto)
- `name` (text, e.g., "Wirt-213-P Angebotsschreiben")
- `berlin_form_id` (text, e.g., "wirt-213-p")
- `docx_file` (file field - stores original Berlin.de DOCX)
- `placeholders` (json, e.g., `{"applicant_name": "Name des Antragstellers"}`)
- `is_active` (boolean)

#### projects (extend existing)
- Add `template_ids` (json array, selected templates)
- Add `form_data` (json, all field values for templates)

#### generated_documents (new)
- `id` (auto)
- `project_id` (relation)
- `template_id` (relation)
- `docx_file` (file field - generated document)
- `generation_status` (enum: pending, completed, failed)
- `generated_at` (datetime)

## MVP Implementation - Ultra-Simplified

### Phase 1: Go CLI Tool Development
**Duration**: Focus on core functionality first

**1.1 Go CLI Implementation**
```bash
# Command interface
./docx-filler input.docx data.json output.docx

# Input: Original template DOCX + JSON data
# Process: Load template, replace placeholders, save to output
# Output: Filled DOCX or error message
```

**1.2 Core Features**
- [ ] DOCX template loading without modification
- [ ] JSON data parsing for placeholder values  
- [ ] Template filling using github.com/nguyendh/go-docx-template
- [ ] Error handling and clear exit codes
- [ ] File permission and path validation

**Deliverable**: Working Go CLI tool that fills Berlin.de templates

### Phase 2: PocketBase Integration
**Duration**: Hook development and testing

**2.1 PocketBase Hook Development**
```javascript
// In pb_hooks/document_generation.pb.js
onRecordAfterCreate((e) => {
  if (e.collection.name === "generation_requests") {
    const record = e.record
    const templateFile = record.expandedOne("template_id").docx_file
    const formData = record.get("form_data")
    
    // Get template file path from PocketBase storage
    const templatePath = $app.dao().expandRecord(templateFile, ...)
    
    // Create temp JSON file for form data
    const jsonPath = "/tmp/form_data_" + record.id + ".json"
    $os.writeFile(jsonPath, JSON.stringify(formData))
    
    // Execute Go CLI tool
    const cmd = new $exec.Command("./docx-filler", templatePath, jsonPath, "/tmp/output_" + record.id + ".docx")
    const result = cmd.run()
    
    if (result.exitCode === 0) {
      // Save generated DOCX to generated_documents collection
      const outputFile = new File("/tmp/output_" + record.id + ".docx")
      // Create generated_documents record with file
      // Update generation_status to completed
    } else {
      // Log error and set status to failed
      $app.logger().error("DOCX generation failed", "error", result.stderr)
    }
    
    // Cleanup temp files
    $os.remove(jsonPath)
  }
})
```

**2.2 Template Management**
- [ ] Upload interface for Berlin.de DOCX templates
- [ ] Manual placeholder configuration (JSON field)
- [ ] Template activation/deactivation
- [ ] Use existing PocketBase admin UI for template management

**Deliverable**: Complete PocketBase → Go CLI integration

### Phase 3: Frontend Extension
**Duration**: Extend existing UI patterns

**3.1 Project Interface Extension**
- [ ] Add template selection to existing project form
- [ ] Dynamic form generation based on template placeholders
- [ ] Use existing styling and layout patterns
- [ ] Simple "Generate Documents" button

**3.2 Document Management**
- [ ] List generated documents in existing project view
- [ ] Download links for completed DOCX files
- [ ] Generation status indication
- [ ] Error message display

**Deliverable**: Working end-to-end workflow in existing UI

### Phase 4: Admin Features - Minimal
**Duration**: Basic commenting using existing patterns

**4.1 Simple Commenting**
- [ ] Extend existing comments collection for document references
- [ ] Admin-only commenting on generated documents
- [ ] Basic comment display in document list
- [ ] Text-based comment export (no complex DOCX integration)

**Deliverable**: Basic admin review capability

### Phase 5: Deployment & Testing
**Duration**: Production readiness

**5.1 Production Setup**
- [ ] Go CLI tool compilation for target environment
- [ ] File permissions and security setup
- [ ] PocketBase configuration for file storage
- [ ] SSL and basic security (existing patterns)

**5.2 Testing with Real Templates**
- [ ] Upload 2-3 actual Berlin.de DOCX forms
- [ ] Manual placeholder mapping
- [ ] End-to-end generation testing
- [ ] Error handling verification

**Deliverable**: Production-ready system

## Technical Implementation Details

### Go CLI Tool Structure
```go
package main

import (
    "encoding/json"
    "log"
    "os"
    "github.com/nguyendh/go-docx-template"
)

func main() {
    if len(os.Args) != 4 {
        log.Fatal("Usage: ./docx-filler <template.docx> <data.json> <output.docx>")
    }
    
    templatePath := os.Args[1]
    dataPath := os.Args[2] 
    outputPath := os.Args[3]
    
    // 1. Load template (creates copy, preserves original)
    tmpl, err := docxtemplate.Open(templatePath)
    if err != nil {
        log.Fatalf("Template load failed: %v", err)
    }
    defer tmpl.Close()
    
    // 2. Load JSON data
    dataBytes, err := os.ReadFile(dataPath)
    if err != nil {
        log.Fatalf("Data load failed: %v", err)
    }
    
    var data map[string]interface{}
    json.Unmarshal(dataBytes, &data)
    
    // 3. Fill template (works on copy)
    err = tmpl.Render(data)
    if err != nil {
        log.Fatalf("Template render failed: %v", err)
    }
    
    // 4. Save filled document
    err = tmpl.SaveAs(outputPath)
    if err != nil {
        log.Fatalf("Save failed: %v", err)
    }
    
    log.Printf("Success: Generated %s", outputPath)
}
```

### PocketBase Hook Pattern
```javascript
// Essential hook structure for MVP
onRecordAfterCreate((e) => {
  e.next() // CRITICAL: Must call e.next()
  
  if (e.collection.name === "generation_requests") {
    // Template processing logic here
    // Use try-catch for error handling
    // Update record status based on CLI result
  }
})
```

### Deployment Structure
```
/production/
├── pocketbase              # Main PocketBase binary  
├── docx-filler            # Go CLI tool binary
├── pb_data/               # Database and file storage
├── pb_hooks/              # JavaScript hooks
└── pb_public/             # Frontend files (existing)
```

## Original Template Preservation Strategy

### Principle
**Berlin.de DOCX files are sacred** - Never modify originals under any circumstances

### Implementation
1. **Storage**: Original templates stored as PocketBase file fields
2. **Processing**: CLI tool receives path to original, creates in-memory copy
3. **Modification**: All changes happen on the copy only
4. **Output**: Filled copy saved as new file, original untouched
5. **Verification**: Original file checksums can be verified for integrity

### Code Example
```go
// This is what happens inside docxtemplate.Open()
func Open(templatePath string) (*Template, error) {
    // Reads original file but creates working copy
    originalData, err := os.ReadFile(templatePath)
    workingCopy := make([]byte, len(originalData))
    copy(workingCopy, originalData) // ORIGINAL PRESERVED
    
    return &Template{data: workingCopy}, nil
}
```

## Risk Mitigation - Simplified

### Technical Risks - Minimized

**Risk 1: Go CLI Integration Failure**
- **Mitigation**: Test CLI independently first, then integrate hooks
- **Fallback**: Manual CLI usage via command line

**Risk 2: Template Complexity**
- **Mitigation**: Start with simplest Berlin.de forms (text-only)
- **Iteration**: Add complex features (tables, checkboxes) incrementally

**Risk 3: File Permissions**
- **Mitigation**: Comprehensive permission testing in production environment
- **Documentation**: Clear setup instructions for file system access

### Compliance Risks - Addressed

**DSGVO Compliance**
- **Data**: Use existing PocketBase DSGVO features
- **Files**: Leverage PocketBase file management for retention policies
- **Audit**: Extend existing audit_logs collection

**Security**  
- **Access**: Build on existing PocketBase authentication
- **Files**: Use PocketBase file access controls
- **Network**: Existing HTTPS configuration

## Success Criteria - MVP

### Functional Success
- [ ] Berlin.de DOCX template upload and storage
- [ ] Form data input via web interface
- [ ] Successful DOCX generation preserving original templates
- [ ] Generated document download
- [ ] Basic admin commenting

### Technical Success
- [ ] Single-command deployment (2 binaries)
- [ ] No external service dependencies
- [ ] Integration with existing PocketBase patterns
- [ ] Error handling and user feedback

### User Success  
- [ ] Intuitive workflow building on existing interface
- [ ] Reliable document generation
- [ ] Fast response times (<30 seconds per document)
- [ ] Clear error messages when issues occur

## Timeline - Realistic

**Total MVP Development**: 4-6 weeks of focused development

- **Week 1**: Go CLI tool development and testing
- **Week 2**: PocketBase hook integration and debugging  
- **Week 3**: Frontend extensions and user workflow
- **Week 4**: Admin features and basic commenting
- **Week 5**: Production deployment and real template testing
- **Week 6**: Documentation and refinement

**Key Dependencies**: 
- Go development skills for CLI tool
- Access to Berlin.de DOCX templates for testing
- Production server environment for deployment testing

## Conclusion - Pragmatic Approach

This revised plan represents a **dramatic simplification** focused on delivering the core value proposition:

✅ **Template Preservation**: Berlin.de originals never modified
✅ **Simple Deployment**: Two binaries, no complex infrastructure  
✅ **PocketBase Integration**: Leverages existing patterns and UI
✅ **Reliable Processing**: Proven Go libraries for DOCX handling
✅ **Fast MVP**: 4-6 weeks to working prototype

The approach sacrifices complex features (HTML preview, advanced UI) for **reliability, simplicity, and fast delivery** - exactly what's needed for a successful City Challenge Berlin 2025 prototype.

By building on the existing PocketBase foundation and adding only the essential DOCX processing capability, we minimize risk while maximizing the chances of delivering a working, useful tool within the project timeframe.

---

*This revised plan incorporates feedback emphasizing simplicity, existing technology utilization, and preservation of Berlin.de template integrity. The hybrid PocketBase + Go CLI approach provides the optimal balance of functionality and deployment simplicity.*

*Document Status: Revised v2.0 | Ready for implementation*