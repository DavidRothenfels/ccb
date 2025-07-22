#!/bin/bash

# Create templates directory if not exists
mkdir -p original

# Download all important VgV and UVgO templates
echo "Downloading Berlin procurement templates..."

# Wirt-213 series - Angebotsschreiben
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-213-p-angebotsschreiben-ohne-lose.docx" -O "original/wirt-213-p.docx"
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-213-1-p-angebotsschreiben-12-lose.docx" -O "original/wirt-213-1-p.docx"
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-215-p-zusaetzliche-besondere-vertragsbedingungen_03-2025.docx" -O "original/wirt-215-p.docx"
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-235-p-verzeichnis-leistungen-andere-unternehmen_04-2025.docx" -O "original/wirt-235-p.docx"
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-236-p-verpflichtungserklaerung-anderer-unternehmer_04-2025.docx" -O "original/wirt-236-p.docx"
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-238-p-bieter-bewerbergemeinschaft_04-2025.docx" -O "original/wirt-238-p.docx"

# Key procurement forms
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-211-eu-p-aufforderung-angebotsabgabe_04_2025.docx" -O "original/wirt-211-eu-p.docx"
wget -q "https://www.berlin.de/vergabeservice/vergabeleitfaden/formulare/wirt-338-p-mitteilung-ueber-zuschlag_05-2025.docx" -O "original/wirt-338-p.docx"

echo "Downloads complete!"
ls -la original/