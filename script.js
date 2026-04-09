let currentStep = 1;
const totalSteps = 5;

// ── URL-Parameter auslesen und in versteckte Felder schreiben ──────────────
(function injectTrackingParams() {
    const params     = new URLSearchParams(window.location.search);
    const quelle     = params.get('quelle') || 'direkt';
    const tippgeber  = params.get('id') || '';

    document.querySelectorAll('[name="quelle"]').forEach(el => el.value = quelle);
    document.querySelectorAll('[name="tippgeber_id"]').forEach(el => el.value = tippgeber);

    if (tippgeber) {
        document.querySelectorAll('.tippgeber-hint').forEach(el => {
            el.textContent = 'Du wurdest empfohlen von: Referenz ' + tippgeber;
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
    document.getElementById('step' + currentStep).classList.remove('active');
    currentStep = step;
    document.getElementById('step' + currentStep).classList.add('active');
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAlternative() {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('stepAlternative').classList.add('active');
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressBar').style.backgroundColor = '#c5a059';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Formular-Submit via AJAX ───────────────────────────────────────────────
document.getElementById('quizForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const isAlternative = document.getElementById('stepAlternative').classList.contains('active');

    // ── Validierung ────────────────────────────────────────────────────────
    if (isAlternative) {
        const emailZusatz   = document.querySelector('[name="email_zusatz"]').value.trim();
        const consentZusatz = document.querySelector('[name="consent_analyse_zusatz"]').checked;
        if (!emailZusatz)   { showFieldError('email_zusatz', 'Bitte gib deine E-Mail-Adresse ein.'); return; }
        if (!consentZusatz) { showConsentError('consent_analyse_zusatz'); return; }
    } else {
        const email   = document.querySelector('[name="email"]').value.trim();
        const consent = document.querySelector('[name="consent_analyse"]').checked;
        if (!email)   { showFieldError('email', 'Bitte gib deine E-Mail-Adresse ein.'); return; }
        if (!consent) { showConsentError('consent_analyse'); return; }
    }

    // ── Button-Ladezustand ─────────────────────────────────────────────────
    const submitBtn = isAlternative
        ? document.querySelector('#stepAlternative button[type="submit"]')
        : document.querySelector('#step5 button[type="submit"]');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Wird gesendet …';

    // ── AJAX-Request ───────────────────────────────────────────────────────
    fetch('https://formspree.io/f/mdappyeq', {
        method:  'POST',
        body:    new FormData(document.getElementById('quizForm')),
        headers: { 'Accept': 'application/json' }
    })
    .then(function (response) {
        if (response.ok) {
            showSuccess(isAlternative);
        } else {
            return response.json().then(function (data) {
                throw new Error(data.error || 'Unbekannter Fehler');
            });
        }
    })
    .catch(function (err) {
        submitBtn.disabled    = false;
        submitBtn.textContent = isAlternative ? 'Persönliche Empfehlung erhalten' : 'Jetzt kostenlose Auswertung erhalten';
        showError('Etwas ist schiefgelaufen. Bitte versuche es nochmal oder melde dich direkt bei uns.');
        console.error('Formspree error:', err);
    });
});

// ── Erfolgsmeldung ─────────────────────────────────────────────────────────
function showSuccess(isAlternative) {
    const container = document.querySelector('.quiz-container');
    container.innerHTML = `
        <div style="text-align:center; padding: 48px 24px;">
            <div style="font-size:3rem; margin-bottom:16px;">✅</div>
            <h2 style="color:#0a2540; font-size:1.6rem; margin-bottom:12px;">
                ${isAlternative ? 'Anfrage erhalten!' : 'Deine Auswertung ist unterwegs!'}
            </h2>
            <p style="color:#555; font-size:1rem; max-width:420px; margin:0 auto 24px; line-height:1.6;">
                ${isAlternative
                    ? 'Wir melden uns innerhalb von 24 Stunden mit einer persönlichen Empfehlung für deine Zusatzabsicherung.'
                    : 'Wir analysieren deine Angaben und schicken dir innerhalb von 24 Stunden deine persönliche PKV-Tarifanalyse — unverbindlich und kostenfrei.'
                }
            </p>
            <p style="font-size:0.85rem; color:#aaa;">
                Kein Mail erhalten? Schau auch im Spam-Ordner nach.
            </p>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Fehlermeldungen ────────────────────────────────────────────────────────
function showFieldError(fieldName, message) {
    const field = document.querySelector('[name="' + fieldName + '"]');
    field.style.borderColor = '#f87171';
    field.focus();

    let hint = field.nextElementSibling;
    if (!hint || !hint.classList.contains('field-error')) {
        hint = document.createElement('p');
        hint.className = 'field-error';
        hint.style.cssText = 'color:#f87171;font-size:0.82rem;margin:-8px 0 10px;';
        field.after(hint);
    }
    hint.textContent = message;

    field.addEventListener('input', function () {
        field.style.borderColor = '';
        if (hint) hint.remove();
    }, { once: true });
}

function showConsentError(fieldName) {
    const checkbox = document.querySelector('[name="' + fieldName + '"]');
    const label    = checkbox.closest('.consent-label');
    label.style.borderColor = '#f87171';
    label.style.background  = '#fff5f5';

    let hint = label.parentElement.querySelector('.consent-error');
    if (!hint) {
        hint = document.createElement('p');
        hint.className = 'consent-error';
        hint.style.cssText = 'color:#f87171;font-size:0.82rem;margin-top:-4px;';
        hint.textContent   = 'Bitte stimme der Datenverarbeitung zu, um fortzufahren.';
        label.after(hint);
    }

    checkbox.addEventListener('change', function () {
        label.style.borderColor = '';
        label.style.background  = '';
        if (hint) hint.remove();
    }, { once: true });
}

function showError(message) {
    const existing = document.querySelector('.submit-error');
    if (existing) existing.remove();
    const el = document.createElement('p');
    el.className = 'submit-error';
    el.style.cssText = 'color:#f87171;font-size:0.88rem;margin-top:12px;text-align:center;';
    el.textContent = message;
    document.querySelector('#step5 button[type="submit"]').after(el);
}
