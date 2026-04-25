// MAGICAL PARTICLES

(function () {
  const container = document.getElementById('particles');
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const colors = [
      'rgba(201,162,39,0.8)',
      'rgba(232,197,90,0.6)',
      'rgba(139,26,26,0.5)',
      'rgba(64,145,108,0.5)',
    ];
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      --dur: ${6 + Math.random() * 8}s;
      --delay: ${Math.random() * 10}s;
      --drift: ${(Math.random() - 0.5) * 120}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
    `;
    container.appendChild(p);
  }
})();

// APPLICATION STATE

let state = {
  foodType: '',
  quantity: 0,
  expiryHours: 0,
  location: '',
  selectedNGO: null,
  ngoList: [],
};

let timerInterval = null;
let timerSec = 90;
const CIRCUMFERENCE = 2 * Math.PI * 56; // ~351.9

// MOCK DATA — NGO Registry
const NGO_REGISTRY = [
  {
    id: 'annapoorna',
    name: 'Annapoorna Foundation',
    travelTimeMin: 8,
    capacityPerDay: 200,
    currentLoad: 40,
    ngoDistanceKm: 2,
    dispatchMin: 3,
    phone: '+91-98100-11111',
  },
  {
    id: 'robinhood',
    name: 'Robin Hood Army',
    travelTimeMin: 18,
    capacityPerDay: 150,
    currentLoad: 90,
    ngoDistanceKm: 5,
    dispatchMin: 8,
    phone: '+91-98100-22222',
  },
  {
    id: 'feedingindia',
    name: 'Feeding India Hub',
    travelTimeMin: 30,
    capacityPerDay: 300,
    currentLoad: 165,
    ngoDistanceKm: 8,
    dispatchMin: 15,
    phone: '+91-98100-33333',
  },
];

// CORE SCORING ENGINE
function calculateFoodLifeScore(food, ngo) {
  const MAX_EXPIRY_HRS = 8;
  const MAX_TRAVEL_MIN = 60;

  const urgencyScore = Math.max(
    0,
    Math.round(((MAX_EXPIRY_HRS - food.expiryHours) / MAX_EXPIRY_HRS) * 100)
  );

  const distanceScore = Math.max(
    0,
    Math.round(((MAX_TRAVEL_MIN - ngo.travelTimeMin) / MAX_TRAVEL_MIN) * 100)
  );

  const availablePct  = (ngo.capacityPerDay - ngo.currentLoad) / ngo.capacityPerDay;
  const capacityScore = Math.max(0, Math.round(availablePct * 100));

  const finalScore = Math.min(
    100,
    Math.round(
      urgencyScore  * 0.45 +
      distanceScore * 0.35 +
      capacityScore * 0.20
    )
  );

  return { finalScore, urgencyScore, distanceScore, capacityScore };
}

function getPriority(score) {
  if (score >= 70) return { label: 'High Priority',   cls: 'red'    };
  if (score >= 40) return { label: 'Medium Priority', cls: 'yellow' };
  return              { label: 'Low Priority',    cls: 'green'  };
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// HEADER BUTTON LOGIC
// goToAuth(type) — sets hidden role and redirects to auth page
function goToAuth(type) {
  localStorage.setItem('userType', type);
  window.location.href = 'auth.html';
}

// FORM SUBMIT -> Form -> Loading -> NGO -> Response -> Delivery
function submitForm() {
  const ft  = document.getElementById('food-type').value.trim();
  const qty = document.getElementById('quantity').value.trim();
  const exp = document.getElementById('expiry').value;
  const loc = document.getElementById('location').value.trim();

  if (!ft || !qty || !exp || !loc) {
    alert('Please fill all fields before initiating the routing protocol.');
    return;
  }

  state.foodType    = ft;
  state.quantity    = parseInt(qty);
  state.expiryHours = parseInt(exp);
  state.location    = loc;

  showScreen('screen-loading');
  runLoader();
}

// LOADER
function runLoader() {
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('loading-text');

  const steps = [
    [0,   "CONSULTING THE MARAUDER'S MAP"],
    [22,  'CALCULATING EXPIRY URGENCY'],
    [50,  'SCANNING THE ORDER NETWORK'],
    [78,  'COMPUTING ROUTING SCORES'],
    [100, 'OPTIMAL MATCHES IDENTIFIED'],
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(interval);
      setTimeout(() => {
        calculateNGOScores();
        updateUI();
      }, 500);
      return;
    }
    fill.style.width = steps[i][0] + '%';
    const textNode = label.childNodes[0];
    if (textNode) textNode.nodeValue = steps[i][1];
    else label.firstChild.textContent = steps[i][1];
    i++;
  }, 650);
}

function calculateNGOScores() {
  const food = { expiryHours: state.expiryHours, quantity: state.quantity };

  state.ngoList = NGO_REGISTRY.map((ngo) => {
    const { finalScore, urgencyScore, distanceScore, capacityScore } =
      calculateFoodLifeScore(food, ngo);

    const { label: priorityLabel, cls: priorityClass } = getPriority(finalScore);
    const capacityPct = Math.round(
      ((ngo.capacityPerDay - ngo.currentLoad) / ngo.capacityPerDay) * 100
    );

    return {
      ...ngo,
      finalScore,
      urgencyScore,
      distanceScore,
      capacityScore,
      priorityLabel,
      priorityClass,
      capacityPct,
    };
  });

  selectBestNGO();
}

function selectBestNGO() {
  let best = state.ngoList[0];
  state.ngoList.forEach((ngo) => {
    if (ngo.finalScore > best.finalScore) best = ngo;
  });
  state.selectedNGO = best;
}

function updateUI() {
  const list = document.getElementById('ngo-dynamic-list');
  list.innerHTML = '';

  const sorted = [...state.ngoList].sort((a, b) => b.finalScore - a.finalScore);

  sorted.forEach((ngo) => {
    const isOptimal = ngo.id === state.selectedNGO.id;
    const card = document.createElement('div');
    card.className = 'ngo-card' + (isOptimal ? ' best' : '');
    card.dataset.ngoId = ngo.id;

    card.innerHTML = `
      <div class="ngo-avatar"></div>

      <div class="ngo-info">
        <div class="ngo-name">${ngo.name}</div>
        <div class="ngo-meta">
          ${ngo.capacityPerDay} meals/day
          &nbsp;&middot;&nbsp;
          ${ngo.capacityPerDay - ngo.currentLoad} slots available
          &nbsp;&middot;&nbsp;
          ETA ${ngo.travelTimeMin} min
        </div>

        <div class="ngo-capacity-bar">
          <div class="ngo-capacity-fill" style="width:${ngo.capacityPct}%"></div>
        </div>

        <div class="ngo-score-row">
          <span class="ngo-score-label">Routing Score</span>
          <span class="ngo-score-val ${ngo.priorityClass}">${ngo.finalScore}</span>
          <span class="ngo-score-priority ${ngo.priorityClass}">${ngo.priorityLabel}</span>
        </div>

        <div class="ngo-breakdown">
          <span class="breakdown-item">
            <span class="breakdown-key">U</span>
            <span class="breakdown-val">${ngo.urgencyScore}</span>
          </span>
          <span class="breakdown-sep">|</span>
          <span class="breakdown-item">
            <span class="breakdown-key">D</span>
            <span class="breakdown-val">${ngo.distanceScore}</span>
          </span>
          <span class="breakdown-sep">|</span>
          <span class="breakdown-item">
            <span class="breakdown-key">C</span>
            <span class="breakdown-val">${ngo.capacityScore}</span>
          </span>
        </div>
      </div>

      <div class="ngo-right-panel">
        <div class="ngo-dist-block">
          <span class="ngo-dist-km">${ngo.ngoDistanceKm} km</span>
          ${isOptimal ? '<span class="ngo-optimal-tag">OPTIMAL</span>' : ''}
        </div>
        <div class="ngo-actions">
          <button class="ngo-btn ngo-btn-call" onclick="handleCall('${ngo.id}')">
            Call
          </button>
          <button class="ngo-btn ngo-btn-request${isOptimal ? ' ngo-btn-request--optimal' : ''}"
                  onclick="handleRequest('${ngo.id}')">
            Request
          </button>
        </div>
      </div>
    `;

    list.appendChild(card);
  });

  showScreen('screen-ngo');
}

// ACTION HANDLERS

function handleCall(ngoId) {
  const ngo = state.ngoList.find((n) => n.id === ngoId);
  if (!ngo) return;
  showToast('Connecting to ' + ngo.name + '...', 'Dialling ' + ngo.phone, 'info');
}

function handleRequest(ngoId) {
  const ngo = state.ngoList.find((n) => n.id === ngoId);
  if (!ngo) return;
  state.selectedNGO = ngo;
  showToast('Request sent to ' + ngo.name, 'ETA: ~' + ngo.travelTimeMin + ' min  |  Score: ' + ngo.finalScore, 'success');
  setTimeout(sendRequest, 2000);
}

function showToast(title, subtitle, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML =
    '<div class="toast-title">' + title + '</div>' +
    '<div class="toast-sub">' + subtitle + '</div>';

  document.body.appendChild(t);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => t.classList.add('toast-visible'));
  });

  setTimeout(() => {
    t.classList.remove('toast-visible');
    setTimeout(() => t.remove(), 400);
  }, 3200);
}

function sendRequest() {
  document.getElementById('response-ngo-name').textContent = state.selectedNGO.name;
  document.getElementById('response-heading').textContent =
    'Request Dispatched to ' + state.selectedNGO.name;
  showScreen('screen-response');
  startTimer();
}

// TIMER

function startTimer() {
  timerSec = 90;
  const ring    = document.getElementById('timer-ring');
  const display = document.getElementById('timer-display');

  ring.style.stroke = 'var(--gold)';
  ring.style.filter = 'drop-shadow(0 0 3px rgba(154,115,24,0.35))';
  document.getElementById('escalation-msg').style.display = 'none';

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timerSec--;
    display.textContent = timerSec;

    const offset = CIRCUMFERENCE * (1 - timerSec / 90);
    ring.style.strokeDashoffset = offset;

    if (timerSec <= 30) {
      ring.style.stroke = 'var(--amber)';
      ring.style.filter = 'drop-shadow(0 0 3px rgba(184,94,8,0.35))';
    }
    if (timerSec <= 10) {
      ring.style.stroke = 'var(--crimson2)';
      ring.style.filter = 'drop-shadow(0 0 3px rgba(176,48,32,0.35))';
    }
    if (timerSec <= 0) {
      clearInterval(timerInterval);
      triggerEscalation();
    }
  }, 1000);
}

function triggerEscalation() {
  clearInterval(timerInterval);
  const escMsg  = document.getElementById('escalation-msg');
  escMsg.style.display = 'block';

  const sorted   = [...state.ngoList].sort((a, b) => b.finalScore - a.finalScore);
  const fallback = sorted.find((n) => n.id !== state.selectedNGO.id);

  if (fallback) {
    escMsg.textContent =
      'No response received. Escalating to ' +
      fallback.name + ' (' + fallback.ngoDistanceKm + ' km, Score: ' + fallback.finalScore + ')...';
  }

  setTimeout(() => {
    if (confirm('Escalating to ' + (fallback ? fallback.name : 'next ally') + '.\n\nClick OK to simulate acceptance.')) {
      if (fallback) state.selectedNGO = fallback;
      acceptDelivery();
    }
  }, 1500);
}

function acceptDelivery() {
  clearInterval(timerInterval);
  showScreen('screen-final');
  buildFinalScreen();
  animateTrack();
}

// FINAL DELIVERY SCREEN

function buildFinalScreen() {
  const expiryLabel = { 1: '1 hr', 2: '2 hrs', 4: '4 hrs', 8: '8 hrs' };
  const ngo = state.selectedNGO;

  document.getElementById('final-ngo-name').textContent = ngo.name;
  document.getElementById('final-subtitle').textContent =
    'A ' + ngo.name + ' coordinator is en route. ETA ~' + ngo.travelTimeMin + ' minutes.';

  document.getElementById('final-chips').innerHTML =
    '<div class="chip">&#127857; <span>' + state.foodType + '</span></div>' +
    '<div class="chip">&#128101; <span>' + state.quantity + ' servings</span></div>' +
    '<div class="chip">&#9201; <span>' + (expiryLabel[state.expiryHours] || state.expiryHours + ' hrs') + '</span></div>' +
    '<div class="chip">&#128205; <span>' + state.location + '</span></div>' +
    '<div class="chip">&#9889; Score: <span>' + ngo.finalScore + '</span></div>' +
    '<div class="chip">&#128663; ETA: <span>~' + ngo.travelTimeMin + ' min</span></div>';

  document.getElementById('td3').classList.remove('done');
  document.getElementById('td4').classList.remove('done', 'active');
  document.getElementById('track-fill').style.width = '0%';
  document.getElementById('deliver-btn').style.display = 'inline-flex';
}

function animateTrack() {
  setTimeout(() => {
    document.getElementById('track-fill').style.width = '66%';
  }, 500);
}

function simulateDelivery() {
  document.getElementById('td3').classList.add('done');
  document.getElementById('td3').textContent = '✓';
  document.getElementById('td4').classList.add('active');
  document.getElementById('track-fill').style.width = '100%';
  document.getElementById('deliver-btn').style.display = 'none';

  setTimeout(() => {
    document.getElementById('td4').classList.remove('active');
    document.getElementById('td4').classList.add('done');
    document.getElementById('td4').textContent = '✓';
  }, 2200);
}

// RESTART
function restart() {
  clearInterval(timerInterval);
  document.getElementById('food-type').value = '';
  document.getElementById('quantity').value  = '';
  document.getElementById('expiry').value    = '';
  document.getElementById('location').value  = '';
  document.getElementById('progress-fill').style.width = '0%';
  state.ngoList     = [];
  state.selectedNGO = null;
  showScreen('screen-form');
}
