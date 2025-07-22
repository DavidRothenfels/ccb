// DOCX Generation Module
// Uses docx library to create real Word documents

async function generateDocxFromDocument(doc, project, template) {
    const docx = window.docx;
    
    if (!docx) {
        console.error('docx library not loaded');
        return null;
    }
    
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;
    
    const formData = doc.filled_content.filled_data || {};
    
    // Create document sections
    const children = [];
    
    // Add document content
    if (doc.filled_content.sections) {
        doc.filled_content.sections.forEach(section => {
            const sectionElements = createDocxSection(section, template, formData, docx);
            children.push(...sectionElements);
        });
    }
    
    // Create document
    const document = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1134, // 2cm
                        right: 1134,
                        bottom: 1134,
                        left: 1134
                    }
                }
            },
            children: children
        }],
        styles: {
            default: {
                heading1: {
                    run: {
                        size: 32,
                        bold: true,
                        color: "000000"
                    },
                    paragraph: {
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }
                },
                heading2: {
                    run: {
                        size: 28,
                        bold: true,
                        color: "000000"
                    },
                    paragraph: {
                        spacing: { before: 400, after: 200 }
                    }
                },
                heading3: {
                    run: {
                        size: 24,
                        bold: true,
                        color: "000000"
                    },
                    paragraph: {
                        spacing: { before: 200, after: 200 }
                    }
                }
            }
        }
    });
    
    return document;
}

function createDocxSection(section, template, formData, docx) {
    const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = docx;
    const elements = [];
    
    switch (section.type) {
        case 'letterhead':
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.title + ':',
                            bold: true,
                            size: 24
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
            section.fields.forEach(field => {
                if (formData[field]) {
                    elements.push(
                        new Paragraph({
                            children: [new TextRun(formData[field])],
                            spacing: { after: 100 }
                        })
                    );
                }
            });
            elements.push(new Paragraph({ text: '', spacing: { after: 400 } }));
            break;
            
        case 'recipient':
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.title + ':',
                            bold: true,
                            size: 24
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
            section.fields.forEach(field => {
                if (formData[field]) {
                    elements.push(
                        new Paragraph({
                            children: [new TextRun(formData[field])],
                            spacing: { after: 100 }
                        })
                    );
                }
            });
            elements.push(new Paragraph({ text: '', spacing: { after: 400 } }));
            break;
            
        case 'reference':
            const rows = [];
            section.fields.forEach(field => {
                if (formData[field]) {
                    const fieldDef = template.template_fields[field];
                    rows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({
                                            text: fieldDef?.label || field,
                                            bold: true
                                        })]
                                    })],
                                    width: { size: 30, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [new Paragraph(formData[field])],
                                    width: { size: 70, type: WidthType.PERCENTAGE }
                                })
                            ]
                        })
                    );
                }
            });
            if (rows.length > 0) {
                elements.push(
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: rows
                    })
                );
                elements.push(new Paragraph({ text: '', spacing: { after: 400 } }));
            }
            break;
            
        case 'title':
            elements.push(
                new Paragraph({
                    text: section.content,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 600 }
                })
            );
            break;
            
        case 'header':
            elements.push(
                new Paragraph({
                    text: section.content,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );
            break;
            
        case 'content':
        case 'paragraph':
            let content = section.content || '';
            const runs = [];
            
            if (content) {
                runs.push(new TextRun(content));
            }
            
            if (section.fields) {
                section.fields.forEach(field => {
                    if (formData[field]) {
                        runs.push(new TextRun(' '));
                        runs.push(new TextRun({
                            text: formData[field],
                            bold: true,
                            underline: {}
                        }));
                    }
                });
            }
            
            elements.push(
                new Paragraph({
                    children: runs,
                    spacing: { after: 200 }
                })
            );
            break;
            
        case 'field_group':
            const groupRuns = [];
            if (section.label) {
                groupRuns.push(new TextRun({
                    text: section.label + ' ',
                    bold: true
                }));
            }
            section.fields.forEach((field, idx) => {
                if (formData[field]) {
                    if (idx > 0) groupRuns.push(new TextRun(' '));
                    groupRuns.push(new TextRun({
                        text: formData[field],
                        underline: {}
                    }));
                }
            });
            elements.push(
                new Paragraph({
                    children: groupRuns,
                    spacing: { after: 200 }
                })
            );
            break;
            
        case 'numbered_section':
            elements.push(
                new Paragraph({
                    text: `${section.number}. ${section.title}`,
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 200 }
                })
            );
            
            if (section.content) {
                elements.push(
                    new Paragraph({
                        text: section.content,
                        spacing: { after: 200 }
                    })
                );
            }
            
            if (section.fields) {
                section.fields.forEach(field => {
                    if (formData[field]) {
                        const fieldDef = template.template_fields[field];
                        elements.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: (fieldDef?.label || field) + ': ',
                                        bold: true
                                    }),
                                    new TextRun(formData[field])
                                ],
                                spacing: { after: 100 }
                            })
                        );
                    }
                });
            }
            
            if (section.subsections) {
                section.subsections.forEach(sub => {
                    const subElements = createDocxSection(sub, template, formData, docx);
                    elements.push(...subElements);
                });
            }
            break;
            
        case 'options':
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.title + ':',
                            bold: true
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
            section.fields.forEach(field => {
                if (formData[field]) {
                    elements.push(
                        new Paragraph({
                            children: [
                                new TextRun('☑ '),
                                new TextRun(formData[field])
                            ],
                            spacing: { after: 100 }
                        })
                    );
                }
            });
            elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));
            break;
            
        case 'deadline':
        case 'deadlines':
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.title + ':',
                            bold: true
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
            section.fields.forEach(field => {
                if (formData[field]) {
                    const fieldDef = template.template_fields[field];
                    let value = formData[field];
                    if (field.includes('datum') || field.includes('date')) {
                        value = new Date(value).toLocaleDateString('de-DE');
                    }
                    elements.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: (fieldDef?.label || field) + ': ',
                                    bold: true
                                }),
                                new TextRun(value)
                            ],
                            spacing: { after: 100 }
                        })
                    );
                }
            });
            elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));
            break;
            
        case 'attachments':
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.title + ':',
                            bold: true
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
            section.content.forEach(item => {
                elements.push(
                    new Paragraph({
                        children: [
                            new TextRun('☐ '),
                            new TextRun(item)
                        ],
                        spacing: { after: 100 },
                        indent: { left: 720 } // 0.5 inch
                    })
                );
            });
            elements.push(new Paragraph({ text: '', spacing: { after: 400 } }));
            break;
            
        case 'footer':
            elements.push(
                new Paragraph({ text: '', spacing: { before: 800 } })
            );
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: section.title + ':',
                            bold: true
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
            const footerLines = section.content.split('\\n');
            footerLines.forEach(line => {
                elements.push(
                    new Paragraph({
                        text: line,
                        spacing: { after: 100 }
                    })
                );
            });
            break;
    }
    
    return elements;
}

// Export function to be used by app.js
window.generateDocxFromDocument = generateDocxFromDocument;