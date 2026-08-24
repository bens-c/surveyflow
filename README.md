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


## MongoDB Atlas Integration

Die zentrale Speicherung ist vorbereitet.

- Datenbank: `surveyflow`
- Collections: `surveys`, `responses`
- Backend: `server.js`
- Render Blueprint: `render.yaml`
- Frontend-Konfiguration: `config.js`

### Backend deployen

Das Frontend läuft auf GitHub Pages. MongoDB darf nicht direkt aus dem Browser angesprochen werden, deshalb muss `server.js` als Web Service laufen.

Bei Render:
1. Neues **Blueprint/Web Service** aus diesem Repository erstellen.
2. `MONGODB_URI` als geheime Environment Variable setzen.
3. Nach dem Deploy die URL des Web Services in `config.js` eintragen:
   `window.SURVEYFLOW_API_URL = "https://DEIN-SERVICE.onrender.com";`
4. Committen. GitHub Pages deployed das Frontend anschließend automatisch neu.

Weitere Variablen:
- `ADMIN_USER=Admin`
- `ADMIN_PASSWORD=Dumm`
- `ALLOWED_ORIGINS=https://bens-c.github.io`

Ohne gesetzte API-URL arbeitet die Seite weiterhin lokal über `localStorage`.
