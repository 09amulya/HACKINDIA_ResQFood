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
// 📍 Get user's real location (NO API NEEDED)
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        reject("Location permission denied");
      }
    );
  });
}
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
let coords;


// real DATA — NGO Registry
async function calculateNGOScores() {
  try {
    // Convert expiry hours → actual timestamp
    const expiryTime = new Date(Date.now() + state.expiryHours * 60 * 60 * 1000);
    try {
      coords = await getUserLocation();
      console.log("User location:", coords);
    } catch (err) {
      console.warn("Using fallback location");
      coords = { lat: 28.6139, lng: 77.2090 }; // fallback
    }
    const res = await fetch("http://localhost:5000/api/users/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quantity: state.quantity,
        expiryTime: expiryTime,
        location: {
          lat: coords.lat,
          lng: coords.lng
        }
      })
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON from backend");
      return;
    }

    // Map backend response to frontend format
    state.ngoList = data.map((ngo, index) => {
  const p = getPriority(Math.round(ngo.finalScore));

    return {
      id: index,
      name: ngo.name,
      finalScore: Math.round(ngo.finalScore),
      urgencyScore: Math.round(ngo.urgencyScore),
      distanceScore: Math.round(ngo.distanceScore),
      capacityScore: Math.round(ngo.capacityScore),

      travelTimeMin: Math.floor(Math.random() * 30) + 5, 
      ngoDistanceKm: Math.floor(Math.random() * 10) + 1,

      capacityPerDay: 100,
      currentLoad: 20,

      priorityLabel: p.label,
      priorityClass: p.cls
    };
  });

    selectBestNGO();
    
  } catch (err) {
    console.error(err);
    alert("Error connecting to backend");
  }
}

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
  if (score >= 75) return { label: "High", cls: "red" };
  if (score >= 50) return { label: "Medium", cls: "yellow" };
  return { label: "Low", cls: "green" };
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
      setTimeout(async () => {
        await calculateNGOScores();  
        selectBestNGO();             
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


function selectBestNGO() {
  if (!state.ngoList.length) return;

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
  ngoId = parseInt(ngoId);  // 🔥 add this

  const ngo = state.ngoList.find((n) => n.id === ngoId);
  if (!ngo) return;

  showToast('Connecting to ' + ngo.name + '...', 'Dialling...', 'info');
}

function handleRequest(ngoId) {
  ngoId = parseInt(ngoId);  // 🔥 THIS LINE FIXES EVERYTHING

  const ngo = state.ngoList.find((n) => n.id === ngoId);

  if (!ngo) {
    console.log("NGO not found", ngoId);
    return;
  }

  state.selectedNGO = ngo;

  showToast(
    'Request sent to ' + ngo.name,
    'ETA: ~' + ngo.travelTimeMin + ' min  |  Score: ' + ngo.finalScore,
    'success'
  );

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
