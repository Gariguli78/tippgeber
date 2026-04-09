let currentStep = 1;
const totalSteps = 5;

// ── URL-Parameter auslesen und in versteckte Felder schreiben ──────────────
(function injectTrackingParams() {
    const params = new URLSearchParams(window.location.search);
    const quelle = params.get('quelle') || 'direkt';
    const tippgeber = params.get('id') || '';

    // Alle Tracking-Felder im Dokument befüllen (PKV + Alternativ-Formular)
    document.querySelectorAll('[name="quelle"]').forEach(el => el.value = quelle);
    document.querySelectorAll('[name="tippgeber_id"]').forEach(el => el.value = tippgeber);

    // Optional: Tippgeber-Hinweis einblenden
    if (tippgeber) {
        document.querySelectorAll('.tippgeber-hint').forEach(el => {
            el.textContent = `Du wurdest empfohlen von: Referenz ${tippgeber}`;
            el.style.display = 'block';
        });
    }
})();

// ── Fortschrittsbalken ─────────────────────────────────────────────────────
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function nextStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgress();
}

function showAlternative() {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('stepAlternative').classList.add('active');
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressBar').style.backgroundColor = '#c5a059';
}