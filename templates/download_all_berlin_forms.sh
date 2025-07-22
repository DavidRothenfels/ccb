#!/bin/bash

# Download ALL Berlin.de procurement templates
# This script downloads all official procurement forms from berlin.de

TEMPLATE_DIR="/mnt/c/Users/danie/claude/code/citychallenge/templates/berlin_forms"
mkdir -p "$TEMPLATE_DIR"

BASE_URL="https://www.berlin.de"

echo "Downloading ALL Berlin procurement templates..."
echo "============================================="

# Array of all form URLs
declare -a FORMS=(
    # Vermerke (Internal notes)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-111-vorvermerk.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-111-1-vermerk-zur-vorbereitung-eine-vergabe-vgv_2025-03.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-111-2-vermerk-dl_2025-03.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-111-3-vermerk-verteidigung_2025-03.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-111-4-vermerk-konz_2025-03.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-111-5-vermerk-ueber-die-vorbereitung-einer-vergabe-uvgo-25-05.docx"
    
    # Bekanntmachungen (Announcements)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-121-uvgo-p-bekanntmachung-oea_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-123-uvgo-p-bekanntmachung-teilnahmewettbewerb_04_2025.docx"
    
    # Aufforderungen (Invitations)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-1231-eu-p-aufforderung_interessenbestaetigung_teilnahmeantrag_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-1231-konzvgv-p-teilnahmeantrag_interessenbekundung_05_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-211-eu-p-aufforderung-angebotsabgabe_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-211-konzvgv-p-aufforderung-angebotsabgabe_05_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-211-uvgo-p-aufforderung-angebotsabgabe_04_2025.docx"
    
    # Teilnahmeanträge (Participation requests)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-1232-eu-p-teilnahmeantrag_interessenbekundung_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-1232-konzvgv-p-interessenbestaetigung_teilnahmeantrag_05_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-1232-uvgo-p-teilnahmeantrag_04_2025.docx"
    
    # Erklärungen (Declarations)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-124-eu-p-erklaerung-ausschlussgruende_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-124-konzvgv-p-erklaerung-auschlussgruende_angaben_05_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-124-uvgo-erklaerung-ausschlussgruende-angaben_04-2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-1242-uvgo-p-anforderungerklaerungausschlussgruendenangabenunternehmen.docx"
    
    # Angebotsschreiben (Bid letters)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-213-konzvgv-p-angebotsschreiben-05_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-213_p_angebotsschreiben_ol_23-11-07.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-213_1_p_angebotsschreiben_mit_12l-23-11-07.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-213_2_p_angebotsschreiben_mit_30l-23-11-07.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-213_3_p_angebotsschreiben_mit_60l-23-11-07.docx"
    
    # BVB/ZVB (Terms and conditions)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-2142-p-bvb-schutzklausel.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-2144_p_bvb_teil-b_kontrolle_sanktionen_24-08-05.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-215-p-zvb_bvb_25-2.docx"
    
    # Unteraufträge und Eignungsleihe (Subcontracts)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-235-p-unterauftraege_eignungsleihe_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-236-konzvgv-p-verpflichtungserklaerung-anderer-unternehmen_05_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-236-p-verpflichtungserklaerung-anderer-unternehmen_04_2025.docx"
    
    # Bietergemeinschaften (Bidding consortiums)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-238-konzvgv-p-erklaerung-bietergemeinschaft.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-238-p-erklaerung-bietergemeinschaft.docx"
    
    # Niederschriften (Minutes)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-313-p-niederschrift-ueber-die-oeffnung-der-angebote.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-3130-p-niederschrift-oeffnung-der-angebote-zusammenstellung-der-angebote.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-3131-p-niederschrift-oeffnung-der-angebote-zusammenstellung-lose.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-3132-p-niederschrift-oeffnung-der-angebote-besonderheiten.docx"
    
    # Nachforderungen (Subsequent requests)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-129-eu-p-erlaeuterung-nachforderung-bewerber_2019_02.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-329-eu-p-nachforderung-bieter_2019_02.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-3292-3293-p-nachforderung-wettbewerbsregister.docx"
    
    # Informationsschreiben (Information letters)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-132-eu-p-info-nichtberuecksichtigte-bewerber_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-132-uvgo-p-info-nicht-beruecksichtigter-bewerberteilnahmeantrag_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-333-eu-p-info_-134gwb_erfolgreichen-bieter.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-334-eu-p-absage_unterrichtung_bieter_04_2025.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-3341_p_uvgo-unterrichtung_bieter-23-11-29.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-334p_uvgo-absage_begruendung-23-11-29.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-335-eu-p-antrag-nichtberuecksichtigung-bieter_04_2025.docx"
    
    # Zuschlag und Aufhebung (Award and cancellation)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-338-mitteilung-ueber-zuschlag.docx"
    "/vergabeservice/vergabeleitfaden/formulare/wirt-352-p-mitteilung-ueber-aufhebung.docx"
    
    # Sonstige (Miscellaneous)
    "/vergabeservice/vergabeleitfaden/formulare/wirt-226-p-mindestanforderungen-nebenangeboten.docx"
    "/vergabeservice/vergabeleitfaden/formulare/iv_v_wirt-3380-3381-p-aufforderung-und-erklaerung-bindefristverlaengerung-mai2025.docx"
    
    # Assets folder forms
    "/vergabeservice/vergabeleitfaden/assets/wirt-124-1-einhaltung-restriktiver-massnahmen_final.docx"
    "/vergabeservice/vergabeleitfaden/assets/wirt-129-konzvgv-erlaeuterung-nachforderung-bewerber.docx"
    "/vergabeservice/vergabeleitfaden/assets/wirt-129-uvgo-p-erlaeuterung-nachforderung-bewerber.docx"
    "/vergabeservice/vergabeleitfaden/assets/wirt-214_bvb_mindeststundenentgelt_24-04-26.docx"
    "/vergabeservice/vergabeleitfaden/assets/wirt-228-aufkleber.docx"
    "/vergabeservice/vergabeleitfaden/assets/wirt-329-konzvgv-nachforderung-bieter.docx"
    "/vergabeservice/vergabeleitfaden/assets/wirt-329-uvgo-p-nachforderung-bieter.docx"
    "/vergabeservice/vergabeleitfaden/assets/wirt-335-uvgo-p-unterrichtung-bewerber-u-bieter-ueber-nichtberuecksichtigung.docx"
)

# Download each form
TOTAL=${#FORMS[@]}
SUCCESS=0
FAILED=0

for i in "${!FORMS[@]}"; do
    FORM_URL="${FORMS[$i]}"
    FILENAME=$(basename "$FORM_URL")
    
    echo -e "\n[$((i+1))/$TOTAL] Downloading: $FILENAME"
    
    if wget -q -O "$TEMPLATE_DIR/$FILENAME" "${BASE_URL}${FORM_URL}" 2>/dev/null; then
        # Check if file is not empty
        if [ -s "$TEMPLATE_DIR/$FILENAME" ]; then
            echo "✓ Success: $FILENAME"
            ((SUCCESS++))
        else
            echo "✗ Failed (empty file): $FILENAME"
            rm -f "$TEMPLATE_DIR/$FILENAME"
            ((FAILED++))
        fi
    else
        echo "✗ Failed (download error): $FILENAME"
        ((FAILED++))
    fi
done

echo -e "\n============================================="
echo "Download Summary:"
echo "Total forms: $TOTAL"
echo "Successfully downloaded: $SUCCESS"
echo "Failed: $FAILED"
echo -e "\nSuccessfully downloaded files:"
ls -la "$TEMPLATE_DIR"/*.docx 2>/dev/null | awk '{print $9}' | xargs -n1 basename | sort