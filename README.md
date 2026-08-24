# SurveyFlow

Personalisierte Umfragen mit:
- Admin-Login
- Frageneditor
- Umfragen starten/stoppen
- personalisierten Links
- QR-Code
- Antwortübersicht
- CSV-Export

## GitHub Pages

Dieses Repository enthält bereits einen GitHub-Actions-Workflow unter:

`.github/workflows/pages.yml`

Nach dem Push auf `main`:

1. GitHub Repository öffnen
2. `Settings` → `Pages`
3. Unter **Build and deployment** als Source **GitHub Actions** auswählen
4. Danach wird die Seite automatisch veröffentlicht.

## Demo-Admin

Benutzer: `Admin`
Passwort: `Dumm`

> Achtung: Das ist nur ein Demo-Login. Das Passwort liegt im JavaScript und ist auf einer öffentlichen Website einsehbar.

## Technische Einschränkung der statischen Version

Die aktuelle Version speichert Daten in `localStorage`. Dadurch sind Start/Stop-Status
und Antworten nicht zentral zwischen verschiedenen Geräten synchronisiert.

Für eine echte öffentliche Umfrageplattform braucht SurveyFlow zusätzlich ein Backend
und eine zentrale Datenbank.
