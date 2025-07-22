#!/bin/bash

# Download Berlin.de procurement templates
# This script downloads the official procurement forms from berlin.de

TEMPLATE_DIR="/mnt/c/Users/danie/claude/code/citychallenge/templates/original"
mkdir -p "$TEMPLATE_DIR"

echo "Downloading Berlin procurement templates..."

# Base URL for forms
BASE_URL="https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare"

# Core VgV forms (EU threshold)
echo "Downloading VgV forms..."
wget -O "$TEMPLATE_DIR/wirt-111-vorvermerk.docx" "$BASE_URL/wirt-111-vorvermerk.docx" 2>/dev/null && echo "✓ wirt-111-vorvermerk.docx" || echo "✗ wirt-111-vorvermerk.docx"
wget -O "$TEMPLATE_DIR/wirt-111-1-vermerk-vgv.docx" "$BASE_URL/wirt-111-1-vermerk-zur-vorbereitung-eine-vergabe-vgv_2025-03.docx" 2>/dev/null && echo "✓ wirt-111-1-vermerk-vgv.docx" || echo "✗ wirt-111-1-vermerk-vgv.docx"
wget -O "$TEMPLATE_DIR/wirt-111-2-vermerk-dl.docx" "$BASE_URL/wirt-111-2-vermerk-dl_2025-03.docx" 2>/dev/null && echo "✓ wirt-111-2-vermerk-dl.docx" || echo "✗ wirt-111-2-vermerk-dl.docx"
wget -O "$TEMPLATE_DIR/wirt-111-3-vermerk-verteidigung.docx" "$BASE_URL/wirt-111-3-vermerk-verteidigung_2025-03.docx" 2>/dev/null && echo "✓ wirt-111-3-vermerk-verteidigung.docx" || echo "✗ wirt-111-3-vermerk-verteidigung.docx"
wget -O "$TEMPLATE_DIR/wirt-111-4-vermerk-konz.docx" "$BASE_URL/wirt-111-4-vermerk-konz_2025-03.docx" 2>/dev/null && echo "✓ wirt-111-4-vermerk-konz.docx" || echo "✗ wirt-111-4-vermerk-konz.docx"

# UVgO forms (below EU threshold)
echo -e "\nDownloading UVgO forms..."
wget -O "$TEMPLATE_DIR/wirt-111-5-vermerk-uvgo.docx" "$BASE_URL/wirt-111-5-vermerk-ueber-die-vorbereitung-einer-vergabe-uvgo-25-05.docx" 2>/dev/null && echo "✓ wirt-111-5-vermerk-uvgo.docx" || echo "✗ wirt-111-5-vermerk-uvgo.docx"

# Additional common forms
echo -e "\nDownloading additional procurement forms..."
# Request to participate forms
wget -O "$TEMPLATE_DIR/wirt-211-eu-p-aufforderung.docx" "$BASE_URL/wirt-211-eu-p-aufforderung-zur-angebotsabgabe_2025-03.docx" 2>/dev/null && echo "✓ wirt-211-eu-p-aufforderung.docx" || echo "✗ wirt-211-eu-p-aufforderung.docx"
wget -O "$TEMPLATE_DIR/wirt-211-uvgo-p-aufforderung.docx" "$BASE_URL/wirt-211-uvgo-p-aufforderung-zur-angebotsabgabe_2025-03.docx" 2>/dev/null && echo "✓ wirt-211-uvgo-p-aufforderung.docx" || echo "✗ wirt-211-uvgo-p-aufforderung.docx"

# Bidder forms
wget -O "$TEMPLATE_DIR/wirt-213-p-angebotsschreiben.docx" "$BASE_URL/wirt-213-p-angebotsschreiben_2025-03.docx" 2>/dev/null && echo "✓ wirt-213-p-angebotsschreiben.docx" || echo "✗ wirt-213-p-angebotsschreiben.docx"
wget -O "$TEMPLATE_DIR/wirt-213-1-p-nebenangebot.docx" "$BASE_URL/wirt-213-1-p-angebotsschreiben-nebenangebot_2025-03.docx" 2>/dev/null && echo "✓ wirt-213-1-p-nebenangebot.docx" || echo "✗ wirt-213-1-p-nebenangebot.docx"

# Award notification forms
wget -O "$TEMPLATE_DIR/wirt-338-p-mitteilung-zuschlag.docx" "$BASE_URL/wirt-338-p-mitteilung-zuschlagserteilung_2025-03.docx" 2>/dev/null && echo "✓ wirt-338-p-mitteilung-zuschlag.docx" || echo "✗ wirt-338-p-mitteilung-zuschlag.docx"
wget -O "$TEMPLATE_DIR/wirt-352-p-mitteilung-aufhebung.docx" "$BASE_URL/wirt-352-p-mitteilung-aufhebung-einstellung_2025-03.docx" 2>/dev/null && echo "✓ wirt-352-p-mitteilung-aufhebung.docx" || echo "✗ wirt-352-p-mitteilung-aufhebung.docx"

# Company declaration forms
echo -e "\nDownloading company declaration forms..."
wget -O "$TEMPLATE_DIR/wirt-215-p-eigenerklaerung.docx" "$BASE_URL/wirt-215-p-eigenerklaerung-zum-unternehmen_2025-03.docx" 2>/dev/null && echo "✓ wirt-215-p-eigenerklaerung.docx" || echo "✗ wirt-215-p-eigenerklaerung.docx"
wget -O "$TEMPLATE_DIR/wirt-235-p-eigenerklaerung-nachunternehmer.docx" "$BASE_URL/wirt-235-p-eigenerklaerung-nachunternehmer_2025-03.docx" 2>/dev/null && echo "✓ wirt-235-p-eigenerklaerung-nachunternehmer.docx" || echo "✗ wirt-235-p-eigenerklaerung-nachunternehmer.docx"
wget -O "$TEMPLATE_DIR/wirt-236-p-eigenerklaerung-bietergemeinschaft.docx" "$BASE_URL/wirt-236-p-eigenerklaerung-bietergemeinschaft_2025-03.docx" 2>/dev/null && echo "✓ wirt-236-p-eigenerklaerung-bietergemeinschaft.docx" || echo "✗ wirt-236-p-eigenerklaerung-bietergemeinschaft.docx"
wget -O "$TEMPLATE_DIR/wirt-238-p-verpflichtungserklaerung.docx" "$BASE_URL/wirt-238-p-verpflichtungserklaerung_2025-03.docx" 2>/dev/null && echo "✓ wirt-238-p-verpflichtungserklaerung.docx" || echo "✗ wirt-238-p-verpflichtungserklaerung.docx"

echo -e "\n\nDownload complete. Summary:"
echo "Total files downloaded:"
ls -la "$TEMPLATE_DIR"/*.docx 2>/dev/null | grep -v " 0 " | wc -l
echo -e "\nSuccessfully downloaded files:"
ls -la "$TEMPLATE_DIR"/*.docx 2>/dev/null | grep -v " 0 " | awk '{print $9}' | xargs -n1 basename