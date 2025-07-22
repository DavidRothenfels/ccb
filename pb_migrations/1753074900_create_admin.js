migrate((app) => {
    // Check if admin already exists
    try {
        const existingAdmin = app.findFirstRecordByFilter(
            "users", 
            "email = 'admin@citychallenge.berlin'"
        )
        console.log("Admin user already exists")
    } catch (err) {
        // Admin doesn't exist, create one
        console.log("Creating default admin user...")
        
        const usersCollection = app.findCollectionByNameOrId("users")
        const adminUser = new Record(usersCollection, {
            "email": "admin@citychallenge.berlin",
            "username": "admin",
            "emailVisibility": true,
            "verified": true,
            "role": "admin",
            "user_type": "admin",
            "password": "citychallenge2025",
            "passwordConfirm": "citychallenge2025"
        })
        
        app.save(adminUser)
        
        console.log("Admin user created successfully")
        console.log("Email: admin@citychallenge.berlin")
        console.log("Password: citychallenge2025")
    }
    
    // Create default templates if they don't exist
    try {
        const vgvTemplates = app.findRecordsByFilter(
            "templates",
            "category = 'VgV'",
            "",
            1
        )
        
        if (vgvTemplates.length === 0) {
            console.log("Creating default templates...")
            
            const templatesCollection = app.findCollectionByNameOrId("templates")
            
            // VgV Template
            const vgvTemplate = new Record(templatesCollection, {
                "name": "VgV Standardvorlage",
                "category": "VgV",
                "original_filename": "vgv_standard.docx",
                "active": true,
                "template_fields": {
                    "vergabestelle_name": {
                        "type": "text",
                        "label": "Vergabestelle - Name",
                        "required": true,
                        "max_length": 255,
                        "section": "vergabestelle"
                    },
                    "vergabenummer": {
                        "type": "text",
                        "label": "Vergabenummer",
                        "required": true,
                        "max_length": 100,
                        "section": "projekt"
                    },
                    "auftragsbezeichnung": {
                        "type": "text",
                        "label": "Auftragsbezeichnung",
                        "required": true,
                        "max_length": 500,
                        "section": "projekt"
                    }
                }
            })
            app.save(vgvTemplate)
            
            // UVgO Template
            const uvgoTemplate = new Record(templatesCollection, {
                "name": "UVgO Standardvorlage",
                "category": "UVgO",
                "original_filename": "uvgo_standard.docx",
                "active": true,
                "template_fields": {
                    "vergabestelle_name": {
                        "type": "text",
                        "label": "Vergabestelle - Name",
                        "required": true,
                        "max_length": 255,
                        "section": "vergabestelle"
                    },
                    "vergabenummer": {
                        "type": "text",
                        "label": "Vergabenummer",
                        "required": true,
                        "max_length": 100,
                        "section": "projekt"
                    },
                    "auftragsbezeichnung": {
                        "type": "text",
                        "label": "Auftragsbezeichnung",
                        "required": true,
                        "max_length": 500,
                        "section": "projekt"
                    }
                }
            })
            app.save(uvgoTemplate)
            
            console.log("Default templates created")
        }
    } catch (templateErr) {
        console.log("Could not check/create templates:", templateErr.message)
    }
}, (app) => {
    // Rollback - nothing to do
})