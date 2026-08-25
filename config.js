// Nach dem Deploy des Backends hier die URL eintragen, z. B.:
// window.SURVEYFLOW_API_URL = "https://surveyflow-api.onrender.com";
window.SURVEYFLOW_API_URL = window.SURVEYFLOW_API_URL || "";

// Kurze Teilnehmer-Links:
// https://bens-c.github.io/surveyflow/?s=UMFRAGE_ID&name=NAME
// Die eigentlichen Umfragedaten werden bei einem konfigurierten Backend
// über /api/surveys/:id geladen. Ohne Backend funktioniert der Fallback
// über localStorage auf demselben Gerät.
(function () {
  const shortBase = "?s=";
  const api = (window.SURVEYFLOW_API_URL || "").replace(/\/$/, "");
  const originalWriteText = navigator.clipboard?.writeText?.bind(navigator.clipboard);

  function shortSurveyUrl(id, name) {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    url.search = shortBase + encodeURIComponent(id) + (name ? "&name=" + encodeURIComponent(name) : "");
    return url.toString();
  }

  // Share/Link-kopieren in SurveyFlow erzeugen intern weiterhin den alten
  // langen Link. Wir ersetzen nur den Link, der tatsächlich in die
  // Zwischenablage geschrieben wird.
  if (originalWriteText) {
    navigator.clipboard.writeText = function (text) {
      try {
        const u = new URL(text);
        const match = u.hash.match(/^#take=([^&]+)(?:&name=(.*))?$/);
        if (match) {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(match[1])))));
          return originalWriteText(shortSurveyUrl(decoded.id, match[2] ? decodeURIComponent(match[2]) : ""));
        }
      } catch (_) {}
      return originalWriteText(text);
    };
  }

  async function loadShortSurvey() {
    const params = new URLSearchParams(location.search);
    const id = params.get("s");
    if (!id) return;

    const name = params.get("name") || "";
    let survey = null;

    try {
      if (api) {
        const r = await fetch(api + "/api/surveys/" + encodeURIComponent(id));
        if (r.ok) survey = await r.json();
      }
    } catch (_) {}

    if (!survey) {
      try {
        const local = JSON.parse(localStorage.getItem("sf_surveys") || "[]");
        survey = local.find(s => s.id === id) || null;
      } catch (_) {}
    }

    if (!survey) {
      window.__SURVEYFLOW_SHORT_LINK_ERROR = "Umfrage nicht gefunden. Prüfe, ob das SurveyFlow-Backend eingerichtet ist.";
      return;
    }

    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(survey))));
    history.replaceState(null, "", location.pathname + "#take=" + encodeURIComponent(payload) + "&name=" + encodeURIComponent(name));

    const waitForTakeMode = () => {
      if (typeof window.takeMode === "function") {
        window.takeMode();
      } else {
        setTimeout(waitForTakeMode, 20);
      }
    };
    waitForTakeMode();
  }

  loadShortSurvey();
})();
