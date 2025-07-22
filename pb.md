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