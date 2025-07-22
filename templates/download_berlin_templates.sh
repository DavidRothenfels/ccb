#!/bin/bash

# Download Berlin.de procurement templates
# This script downloads the official procurement forms from berlin.de

TEMPLATE_DIR="/mnt/c/Users/danie/claude/code/citychallenge/templates/original"
mkdir -p "$TEMPLATE_DIR"

echo "Downloading Berlin procurement templates..."

# VgV Forms (EU threshold)
echo "Downloading VgV forms..."
wget -O "$TEMPLATE_DIR/wirt-111-vgv-vorblatt.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/vgv/wirt-111-vgv-vorblatt.docx" 2>/dev/null || echo "Failed: wirt-111-vgv-vorblatt.docx"
wget -O "$TEMPLATE_DIR/wirt-111-1-vgv-vermerk.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/vgv/wirt-111-1-vgv-vermerk.docx" 2>/dev/null || echo "Failed: wirt-111-1-vgv-vermerk.docx"
wget -O "$TEMPLATE_DIR/wirt-338-vgv-mitteilung-zuschlag.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/vgv/wirt-338-vgv-mitteilung-zuschlag.docx" 2>/dev/null || echo "Failed: wirt-338-vgv-mitteilung-zuschlag.docx"
wget -O "$TEMPLATE_DIR/wirt-352-vgv-mitteilung-aufhebung.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/vgv/wirt-352-vgv-mitteilung-aufhebung.docx" 2>/dev/null || echo "Failed: wirt-352-vgv-mitteilung-aufhebung.docx"

# UVgO Forms (below EU threshold)
echo "Downloading UVgO forms..."
wget -O "$TEMPLATE_DIR/wirt-121-uvgo-p-bekanntmachung.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/uvgo/wirt-121-uvgo-p-bekanntmachung.docx" 2>/dev/null || echo "Failed: wirt-121-uvgo-p-bekanntmachung.docx"
wget -O "$TEMPLATE_DIR/wirt-123-uvgo-p-teilnahmewettbewerb.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/uvgo/wirt-123-uvgo-p-teilnahmewettbewerb.docx" 2>/dev/null || echo "Failed: wirt-123-uvgo-p-teilnahmewettbewerb.docx"
wget -O "$TEMPLATE_DIR/wirt-211-uvgo-p-aufforderung.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/uvgo/wirt-211-uvgo-p-aufforderung.docx" 2>/dev/null || echo "Failed: wirt-211-uvgo-p-aufforderung.docx"
wget -O "$TEMPLATE_DIR/wirt-334-uvgo-p-informationsschreiben.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/uvgo/wirt-334-uvgo-p-informationsschreiben.docx" 2>/dev/null || echo "Failed: wirt-334-uvgo-p-informationsschreiben.docx"

# KonzVgV Forms (concession procurement)
echo "Downloading KonzVgV forms..."
wget -O "$TEMPLATE_DIR/wirt-211-konzvgv-p-aufforderung.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/konzvgv/wirt-211-konzvgv-p-aufforderung.docx" 2>/dev/null || echo "Failed: wirt-211-konzvgv-p-aufforderung.docx"
wget -O "$TEMPLATE_DIR/wirt-213-konzvgv-p-angebotsschreiben.docx" "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/konzvgv/wirt-213-konzvgv-p-angebotsschreiben.docx" 2>/dev/null || echo "Failed: wirt-213-konzvgv-p-angebotsschreiben.docx"

# Common base URL patterns from berlin.de
BASE_URL="https://www.berlin.de/vergabeservice/_assets/formulare"

# Try alternative download URLs
echo "Trying alternative download URLs..."
wget -O "$TEMPLATE_DIR/wirt-111-vgv.docx" "$BASE_URL/wirt-111-vgv.docx" 2>/dev/null || echo "Failed alternative: wirt-111-vgv.docx"
wget -O "$TEMPLATE_DIR/wirt-111-1-vgv.docx" "$BASE_URL/wirt-111-1-vgv.docx" 2>/dev/null || echo "Failed alternative: wirt-111-1-vgv.docx"
wget -O "$TEMPLATE_DIR/wirt-121-uvgo-p.docx" "$BASE_URL/wirt-121-uvgo-p.docx" 2>/dev/null || echo "Failed alternative: wirt-121-uvgo-p.docx"
wget -O "$TEMPLATE_DIR/wirt-211-uvgo-p.docx" "$BASE_URL/wirt-211-uvgo-p.docx" 2>/dev/null || echo "Failed alternative: wirt-211-uvgo-p.docx"

echo "Download complete. Checking which files were successfully downloaded..."
ls -la "$TEMPLATE_DIR"/*.docx 2>/dev/null | grep -v "0 " || echo "No files successfully downloaded"