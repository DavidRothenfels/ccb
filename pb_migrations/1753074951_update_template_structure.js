migrate((app) => {
    // Update template content structure to use sections
    const templatesCollection = app.findCollectionByNameOrId("templates");
    
    const templates = app.findRecordsByFilter("templates", "category = 'VgV' || category = 'UVgO'", "", 100);
    
    templates.forEach(template => {
        if (template.get('category') === 'VgV') {
            template.set('template_content', {
                sections: [
                    {
                        type: 'title',
                        content: 'Vergabevermerk - VgV'
                    },
                    {
                        type: 'header',
                        content: 'Vergabestelle'
                    },
                    {
                        type: 'letterhead',
                        title: 'Vergabestelle',
                        fields: ['vergabestelle_name', 'vergabestelle_anschrift', 'vergabestelle_ansprechpartner', 'vergabestelle_telefon', 'vergabestelle_email']
                    },
                    {
                        type: 'header',
                        content: 'Auftragsinformationen'
                    },
                    {
                        type: 'reference',
                        fields: ['auftrag_bezeichnung', 'vergabenummer', 'cpv_code']
                    },
                    {
                        type: 'header',
                        content: 'Beschreibung'
                    },
                    {
                        type: 'paragraph',
                        fields: ['auftrag_beschreibung']
                    },
                    {
                        type: 'header',
                        content: 'Verfahren'
                    },
                    {
                        type: 'reference',
                        fields: ['vergabeart', 'leistungsart']
                    },
                    {
                        type: 'header',
                        content: 'Wertangaben'
                    },
                    {
                        type: 'reference',
                        fields: ['geschaetzter_auftragswert', 'vertragslaufzeit_beginn', 'vertragslaufzeit_ende']
                    },
                    {
                        type: 'header',
                        content: 'Fristen'
                    },
                    {
                        type: 'deadlines',
                        title: 'Angebotsfrist',
                        fields: ['angebotsfrist_datum', 'angebotsfrist_uhrzeit', 'bindefrist']
                    },
                    {
                        type: 'header',
                        content: 'Zuschlagskriterien'
                    },
                    {
                        type: 'reference',
                        fields: ['zuschlag_preis_gewichtung']
                    },
                    {
                        type: 'header',
                        content: 'Sonstiges'
                    },
                    {
                        type: 'options',
                        title: 'Optionen',
                        fields: ['nebenangebote_zugelassen', 'bietergemeinschaften_zugelassen']
                    }
                ]
            });
        } else if (template.get('category') === 'UVgO') {
            template.set('template_content', {
                sections: [
                    {
                        type: 'title',
                        content: 'Vergabevermerk - UVgO'
                    },
                    {
                        type: 'header',
                        content: 'Vergabestelle'
                    },
                    {
                        type: 'letterhead',
                        title: 'Vergabestelle',
                        fields: ['vergabestelle_name', 'vergabestelle_anschrift', 'vergabestelle_ansprechpartner', 'vergabestelle_telefon', 'vergabestelle_email']
                    },
                    {
                        type: 'header',
                        content: 'Auftragsinformationen'
                    },
                    {
                        type: 'reference',
                        fields: ['auftrag_bezeichnung', 'vergabenummer']
                    },
                    {
                        type: 'header',
                        content: 'Beschreibung'
                    },
                    {
                        type: 'paragraph',
                        fields: ['auftrag_beschreibung']
                    },
                    {
                        type: 'header',
                        content: 'Verfahren'
                    },
                    {
                        type: 'reference',
                        fields: ['vergabeart', 'leistungsart']
                    },
                    {
                        type: 'header',
                        content: 'Wertangaben'
                    },
                    {
                        type: 'reference',
                        fields: ['geschaetzter_auftragswert', 'vertragslaufzeit_beginn', 'vertragslaufzeit_ende']
                    },
                    {
                        type: 'header',
                        content: 'Fristen'
                    },
                    {
                        type: 'deadlines',
                        title: 'Angebotsfrist',
                        fields: ['angebotsfrist_datum', 'angebotsfrist_uhrzeit', 'bindefrist']
                    },
                    {
                        type: 'header',
                        content: 'Zuschlagskriterien'
                    },
                    {
                        type: 'reference',
                        fields: ['zuschlag_preis_gewichtung']
                    },
                    {
                        type: 'header',
                        content: 'Sonstiges'
                    },
                    {
                        type: 'options',
                        title: 'Optionen',
                        fields: ['nebenangebote_zugelassen', 'bietergemeinschaften_zugelassen']
                    }
                ]
            });
        }
        
        app.save(template);
    });
    
}, (app) => {
    // Rollback - nothing to do as we're just updating existing records
});