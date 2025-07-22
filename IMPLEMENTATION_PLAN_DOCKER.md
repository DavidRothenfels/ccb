# Vergabe-Vorbereitungs-Tool - Docker/Coolify Implementation Plan

*Version: 3.0 - Docker-Native Approach | Date: January 2025*

## Problem Statement

**Previous Issue**: CLI-Tool approach doesn't work for Docker/Coolify deployment
**User Requirement**: Single PocketBase container, deployable via Docker on Coolify
**Challenge**: DOCX processing within PocketBase container only

## Solution: Custom PocketBase Build with Go Plugin

### Architecture - Docker-Native
```
Single Docker Container:
┌─────────────────────────────────────┐
│  Custom PocketBase Binary           │
│  ├── Standard PocketBase Features   │
│  ├── Built-in DOCX Processing       │
│  ├── Berlin.de Templates Storage    │
│  └── SQLite Database                │
└─────────────────────────────────────┘
```

### Technology Stack - Final
- **Backend**: Custom PocketBase v0.28.4 with embedded Go DOCX processing
- **DOCX Library**: `github.com/nguyenthienan/docxtemplater` (Go port)
- **Frontend**: Vanilla JavaScript extending existing interface
- **Database**: SQLite with file storage for templates
- **Deployment**: Single Docker container on Coolify

## Implementation Approach

### Option 1: Custom PocketBase Build (RECOMMENDED)

**Why This Works for Docker:**
- Single binary = Single container
- No external dependencies
- Templates stored inside container or mounted volume
- Native Go performance

**Project Structure:**
```
/project-root/
├── main.go                    # Custom PocketBase entry point
├── pkg/docx/                  # DOCX processing logic
│   └── processor.go
├── templates/                 # Berlin.de DOCX templates
│   ├── wirt-213-p.docx
│   └── wirt-215-p.docx
├── pb_data/                   # PocketBase data (mounted volume)
├── pb_public/                 # Frontend (existing)
├── pb_migrations/             # Database migrations
├── Dockerfile                 # Docker build definition
├── go.mod                     # Go dependencies
└── go.sum
```

### Core Implementation

#### 1. Custom PocketBase Main
```go
// main.go
package main

import (
    "log"
    "os"
    "path/filepath"

    "github.com/pocketbase/pocketbase"
    "github.com/pocketbase/pocketbase/core"
    
    "your-project/pkg/docx"
)

func main() {
    app := pocketbase.New()

    // Hook: When generation_requests record is created
    app.OnRecordAfterCreateRequest("generation_requests").Add(func(e *core.RecordCreateEvent) error {
        record := e.Record
        
        // Extract data from record
        templateId := record.GetString("template_id")
        formData := record.Get("form_data").(map[string]interface{})
        
        // Get template file path
        templateRecord, err := app.Dao().FindRecordById("templates", templateId)
        if err != nil {
            return err
        }
        
        templateFile := templateRecord.GetString("docx_file")
        templatePath := filepath.Join("/app/pb_data/storage", templateFile)
        
        // Generate output path
        outputPath := filepath.Join("/app/pb_data/storage", "generated", record.Id+".docx")
        
        // Process DOCX template
        err = docx.ProcessTemplate(templatePath, formData, outputPath)
        if err != nil {
            // Update record with error status
            record.Set("status", "failed")
            record.Set("error_message", err.Error())
        } else {
            // Update record with success status and file path
            record.Set("status", "completed")
            record.Set("output_file", "generated/"+record.Id+".docx")
        }
        
        // Save updated record
        return app.Dao().SaveRecord(record)
    })

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}
```

#### 2. DOCX Processing Module
```go
// pkg/docx/processor.go
package docx

import (
    "fmt"
    "os"
    
    "github.com/nguyenthienan/docxtemplater"
)

// ProcessTemplate fills a DOCX template with data
func ProcessTemplate(templatePath string, data map[string]interface{}, outputPath string) error {
    // Ensure output directory exists
    os.MkdirAll(filepath.Dir(outputPath), 0755)
    
    // Open template file (ORIGINAL IS NEVER MODIFIED)
    templateFile, err := os.Open(templatePath)
    if err != nil {
        return fmt.Errorf("failed to open template: %w", err)
    }
    defer templateFile.Close()
    
    // Create output file
    outputFile, err := os.Create(outputPath)
    if err != nil {
        return fmt.Errorf("failed to create output file: %w", err)
    }
    defer outputFile.Close()
    
    // Process template (works on copy, preserves original)
    processor := docxtemplater.New(templateFile)
    
    // Set template data
    for key, value := range data {
        processor.Set(key, value)
    }
    
    // Render template
    err = processor.Render()
    if err != nil {
        return fmt.Errorf("failed to render template: %w", err)
    }
    
    // Write to output file
    err = processor.Write(outputFile)
    if err != nil {
        return fmt.Errorf("failed to write output: %w", err)
    }
    
    return nil
}
```

#### 3. Docker Configuration
```dockerfile
# Dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build custom PocketBase
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o pocketbase ./main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/pocketbase .

# Copy templates directory
COPY templates/ ./templates/

# Create directories for data and generated files
RUN mkdir -p pb_data/storage/generated

# Expose port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1

# Run PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
```

#### 4. Go Module Definition
```go
// go.mod
module your-project

go 1.22

require (
    github.com/pocketbase/pocketbase v0.28.4
    github.com/nguyenthienan/docxtemplater v1.0.0  // Check actual version
)
```

### Database Schema Extensions

#### generation_requests (new collection)
```json
{
    "name": "generation_requests",
    "type": "base",
    "schema": [
        {"name": "template_id", "type": "relation", "required": true, "options": {"collectionId": "templates_collection_id"}},
        {"name": "form_data", "type": "json", "required": true},
        {"name": "status", "type": "select", "options": {"values": ["pending", "processing", "completed", "failed"]}},
        {"name": "output_file", "type": "text"},
        {"name": "error_message", "type": "text"}
    ]
}
```

#### templates (extend existing)
```json
{
    "name": "templates", 
    "schema": [
        {"name": "name", "type": "text", "required": true},
        {"name": "berlin_form_id", "type": "text"},
        {"name": "docx_file", "type": "file", "options": {"maxSelect": 1, "mimeTypes": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}},
        {"name": "placeholders", "type": "json"}
    ]
}
```

## Deployment on Coolify

### Step 1: Repository Setup
```bash
# Your project repository should contain:
- main.go
- pkg/docx/processor.go  
- Dockerfile
- go.mod, go.sum
- templates/ (Berlin.de DOCX files)
- pb_migrations/ (existing)
- pb_public/ (existing)
```

### Step 2: Coolify Configuration
```yaml
# Environment Variables in Coolify
TEMPLATES_DIR=/app/templates
STORAGE_DIR=/app/pb_data/storage
```

### Step 3: Volume Configuration
```bash
# Persistent volume for PocketBase data
/app/pb_data -> persistent volume

# Optional: External template mounting
/app/templates -> mounted from host (if templates change frequently)
```

## User Workflow - Simplified

### 1. Template Upload (Admin)
- Upload Berlin.de DOCX to templates collection
- Define placeholders manually: `{"applicant_name": "Company Name", "date": "Application Date"}`
- Activate template

### 2. Document Generation (User)  
- Select project and templates
- Fill form based on template placeholders
- Click "Generate Documents"
- System creates generation_requests record
- Hook processes automatically
- Download completed DOCX files

### 3. Admin Review
- View generated documents
- Add comments to generation_requests
- Export comment summaries

## Berlin.de Template Preservation

### Implementation Details
```go
// Template processing ensures original files are never modified
func ProcessTemplate(templatePath string, data map[string]interface{}, outputPath string) error {
    // 1. Original file is only READ, never written
    templateFile, err := os.Open(templatePath) // READ-ONLY
    if err != nil {
        return err
    }
    defer templateFile.Close()
    
    // 2. Processing library creates internal copy
    processor := docxtemplater.New(templateFile) // Works on copy
    
    // 3. All modifications happen on the copy
    processor.Set("applicant_name", data["applicant_name"])
    processor.Render() // Modifies copy only
    
    // 4. Only the filled copy is written to output
    outputFile, _ := os.Create(outputPath) // NEW FILE
    processor.Write(outputFile) // Write copy, not original
    
    return nil
}
```

### Verification Strategy
```bash
# Before and after checksums to verify originals unchanged
md5sum /app/templates/*.docx > /tmp/before.md5
# ... processing happens ...  
md5sum /app/templates/*.docx > /tmp/after.md5
diff /tmp/before.md5 /tmp/after.md5 # Should be empty
```

## Development Workflow

### Local Development
```bash
# 1. Clone repository
git clone your-repo

# 2. Install Go dependencies  
go mod tidy

# 3. Test DOCX processing separately
go run pkg/docx/test_processor.go

# 4. Run custom PocketBase
go run main.go serve --dir=./pb_data_dev

# 5. Test via browser at localhost:8090
```

### Docker Testing
```bash
# Build image
docker build -t your-project .

# Run container
docker run -p 8090:8090 -v $(pwd)/pb_data:/app/pb_data your-project

# Test document generation workflow
```

## Advantages of This Approach

### ✅ Single Container Deployment
- One Docker image for Coolify
- No orchestration complexity
- Simple volume mounting

### ✅ Template Preservation  
- Original Berlin.de files never modified
- Checksum verification possible
- Copy-based processing

### ✅ Performance
- Native Go DOCX processing
- No HTTP overhead between services
- In-memory template handling

### ✅ Maintainability
- Standard PocketBase patterns
- Clear separation of concerns
- Extensible for additional features

## Limitations & Trade-offs

### ❌ Custom Binary Maintenance
- Must rebuild on PocketBase updates
- Cannot use standard PocketBase images

### ❌ Go Development Required
- Need Go knowledge for DOCX logic
- More complex than pure JavaScript

### ⚠️ Library Dependencies
- Depends on Go DOCX library quality
- May need fallback for complex templates

## Success Criteria

### Technical
- [ ] Single Docker container deployment
- [ ] Successful DOCX generation from Berlin.de templates  
- [ ] Original templates preserved and verified
- [ ] Integration with existing PocketBase patterns
- [ ] Coolify deployment working

### User Experience
- [ ] Simple template upload process
- [ ] Intuitive form filling interface
- [ ] Reliable document generation
- [ ] Clear error messages
- [ ] Fast processing times

## Next Steps

1. **Validate DOCX Library**: Test `nguyenthienan/docxtemplater` with actual Berlin.de templates
2. **Create MVP**: Build minimal custom PocketBase with one template
3. **Docker Testing**: Verify container builds and runs correctly
4. **Coolify Deployment**: Test actual deployment on Coolify
5. **Extend Functionality**: Add remaining templates and admin features

---

**This approach solves the Docker deployment requirement while maintaining the simplicity of a single PocketBase container. The custom build adds DOCX processing directly into PocketBase, eliminating external dependencies while preserving Berlin.de template integrity.**