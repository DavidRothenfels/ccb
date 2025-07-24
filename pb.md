# PocketBase Direkte Datenbank-Modifikationen

## Wichtige Hinweise

**WARNUNG**: Direkte Datenbankmanipulationen sind riskant!
- **IMMER** ein Backup von `pb_data` erstellen bevor Änderungen vorgenommen werden
- **IMMER** PocketBase stoppen bevor die SQLite-Datenbank modifiziert wird
- Änderungen an `_collections` während PocketBase läuft können zu Datenverlust führen

## Häufige Fehler und Lösungen

### 1. Migration schlägt fehl bei Feld-Typ-Änderungen

**Problem**: Migrations scheitern oft wenn versucht wird einen Feldtyp zu ändern (z.B. TEXT zu RELATION)

**Lösung**: Direkte SQLite-Modifikation:

```bash
# 1. PocketBase stoppen
pkill -f pocketbase

# 2. Backup erstellen
cp -r pb_data pb_data_backup_$(date +%Y%m%d_%H%M%S)

# 3. SQLite öffnen
sqlite3 pb_data/data.db
```

### 2. TEXT zu RELATION konvertieren

**Schritt 1**: IDs sammeln
```sql
-- Projects Collection ID finden
SELECT id, name FROM _collections WHERE name = 'projects';

-- Users Collection ID finden  
SELECT id, name FROM _collections WHERE name = 'users';

-- Aktuelle Schema anzeigen
SELECT fields FROM _collections WHERE name = 'projects';
```

**Schritt 2**: Schema JSON vorbereiten

Altes Feld (TEXT):
```json
{
  "id": "text2375276105",
  "name": "user",
  "type": "text",
  "max": 100,
  "required": true,
  ...
}
```

Neues Feld (RELATION):
```json
{
  "id": "text2375276105",
  "name": "user", 
  "type": "relation",
  "required": true,
  "presentable": false,
  "hidden": false,
  "system": false,
  "options": {
    "collectionId": "USERS_COLLECTION_ID",
    "cascadeDelete": false,
    "minSelect": null,
    "maxSelect": 1
  }
}
```

**Schritt 3**: Update durchführen
```sql
-- WICHTIG: Das gesamte fields Array muss als ein String übergeben werden
UPDATE _collections 
SET fields = '[GESAMTES_MODIFIZIERTES_JSON_ARRAY]'
WHERE name = 'projects';
```

### 3. Berechtigungen (Rules) direkt setzen

```sql
UPDATE _collections
SET 
  listRule = '@request.auth.id != "" && user = @request.auth.id',
  viewRule = '@request.auth.id != "" && user = @request.auth.id',
  updateRule = '@request.auth.id != "" && user = @request.auth.id',
  deleteRule = '@request.auth.id != "" && user = @request.auth.id'
WHERE name = 'projects';
```

### 4. Verifizierung

Nach den Änderungen:
1. PocketBase neu starten
2. Admin UI öffnen (http://localhost:8091/_/)
3. Collections > projects prüfen
4. Testen ob:
   - User-Feld als Relation angezeigt wird
   - Bestehende Daten noch funktionieren
   - Neue Records erstellt werden können

## Best Practices

1. **Entwicklung**: Migrations für Struktur-Erstellung verwenden
2. **Bugfixes**: Direkte SQL-Modifikationen wenn Migrations fehlschlagen
3. **Dokumentation**: Alle direkten Änderungen hier dokumentieren
4. **Testing**: Nach jeder Änderung umfassend testen

## Bekannte Probleme

- PocketBase 0.28.4 hat Probleme mit Field-Type-Änderungen in Migrations
- Filter-Syntax muss ohne Spaces um Operatoren sein: `user="id"` nicht `user = "id"`
- Relations müssen die Collection ID verwenden, nicht den Namen
- Migrations für neue Select-Felder schlagen fehl mit "Go type conversion error"

### 5. Select-Feld zu bestehender Tabelle hinzufügen

**Problem**: Migration für Select-Felder schlägt fehl mit "Go type conversion error: could not convert [object Object] to core.Field"

**Lösung**: Direkte Datenbank-Modifikation:

```bash
# 1. Spalte zur Tabelle hinzufügen
cd pb_data && sqlite3 data.db "ALTER TABLE templates ADD COLUMN threshold_type TEXT DEFAULT 'beide';"

# 2. PocketBase Schema aktualisieren
# WICHTIG: Select-Felder haben "values" und "maxSelect" als direkte Properties!
sqlite3 data.db <<EOF
UPDATE _collections 
SET fields = json_insert(
    fields, 
    '$[#]', 
    json('{"hidden":false,"id":"select'||substr(lower(hex(randomblob(16))), 1, 10)||'","name":"threshold_type","presentable":false,"required":false,"system":false,"type":"select","maxSelect":1,"values":["oberschwellig","unterschwellig","beide"]}')
)
WHERE name = 'templates';
EOF

# 3. Existierende Daten aktualisieren (optional)
sqlite3 data.db "UPDATE templates SET threshold_type = 'oberschwellig' WHERE category IN ('VgV', 'VSVgV');"
sqlite3 data.db "UPDATE templates SET threshold_type = 'unterschwellig' WHERE category = 'UVgO';"
sqlite3 data.db "UPDATE templates SET threshold_type = 'beide' WHERE category = 'Vermerk';"
```

**Wichtig**: Die ID im JSON muss eindeutig sein (z.B. "select" + Zufallszahlen)

### 6. PocketBase Admin UI Error: "TypeError: can't access property length, s.values is null"

**Problem**: Beim Öffnen einer Collection in der PocketBase Admin UI erscheint der Fehler "TypeError: can't access property length, s.values is null"

**Ursache**: Select-Felder in JSON-Feldern verwenden `options` statt `values` als Property-Name. PocketBase erwartet für Select-Felder immer `values`.

**Lösung**: Alle Select-Felder in JSON-Spalten korrigieren:

```python
#!/usr/bin/env python3
import json
import sqlite3

# Connect to database
conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

# Beispiel: template_fields in templates collection
cursor.execute("SELECT id, template_fields FROM templates WHERE template_fields LIKE '%\"type\":\"select\"%'")
templates = cursor.fetchall()

for template_id, fields_json in templates:
    fields = json.loads(fields_json)
    modified = False
    
    # Fix each select field
    for field_key, field_data in fields.items():
        if field_data.get('type') == 'select':
            if 'options' in field_data and 'values' not in field_data:
                # Move options to values
                field_data['values'] = field_data.pop('options')
                modified = True
    
    if modified:
        cursor.execute(
            "UPDATE templates SET template_fields = ? WHERE id = ?",
            (json.dumps(fields, ensure_ascii=False), template_id)
        )

conn.commit()
conn.close()
```

**Debugging-Tipps**:
```bash
# Alle Select-Felder in JSON-Spalten finden
sqlite3 pb_data/data.db "SELECT name FROM sqlite_master WHERE type='table';" | while read table; do
    echo "Checking table: $table"
    sqlite3 pb_data/data.db "SELECT sql FROM sqlite_master WHERE name='$table';" | grep -i json
done

# Select-Felder mit falscher Struktur finden
sqlite3 -json pb_data/data.db "SELECT template_fields FROM templates;" | \
python3 -c "
import json, sys
for row in json.load(sys.stdin):
    fields = json.loads(row['template_fields'])
    for k, v in fields.items():
        if v.get('type') == 'select' and 'options' in v:
            print(f'Found select with options: {k}')
"
```

### 7. Spalte existiert in DB aber nicht in PocketBase UI

**Problem**: "duplicate column name" Fehler beim Hinzufügen eines Feldes, das bereits in der SQLite-Tabelle existiert aber nicht im PocketBase Schema

**Ursache**: Die Spalte wurde direkt mit ALTER TABLE hinzugefügt, aber PocketBase weiß nichts davon

**Lösung 1**: Spalte aus der Datenbank entfernen
```bash
cd pb_data && sqlite3 data.db "ALTER TABLE templates DROP COLUMN threshold_type;"
```

**Lösung 2**: Spalte im PocketBase Schema registrieren
```sql
-- Prüfen welche Spalten in der Tabelle existieren
PRAGMA table_info(templates);

-- Aktuelle fields aus _collections holen und manuell das fehlende Feld hinzufügen
-- WICHTIG: Bei Select-Feldern sind "values" und "maxSelect" direkte Properties, nicht unter "options"!
UPDATE _collections 
SET fields = json_insert(
    fields, 
    '$[#]', 
    json('{"id":"select'||substr(lower(hex(randomblob(16))), 1, 10)||'","name":"threshold_type","type":"select","required":false,"presentable":false,"hidden":false,"system":false,"maxSelect":1,"values":["oberschwellig","unterschwellig","beide"]}')
)
WHERE name = 'templates';
```

**Wichtig**: Nach Lösung 1 kann das Feld normal über die UI hinzugefügt werden. Bei Lösung 2 muss PocketBase neugestartet werden.

## Nützliche SQL Befehle

```sql
-- Alle Collections anzeigen
SELECT id, name, type FROM _collections;

-- Collection Details
SELECT * FROM _collections WHERE name = 'projects';

-- Fields als lesbares JSON
SELECT json_pretty(fields) FROM _collections WHERE name = 'projects';

-- Backup einer Collection
CREATE TABLE _collections_backup AS SELECT * FROM _collections;
```