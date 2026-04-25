// MAGICAL PARTICLES

  (function() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const colors = ['rgba(201,162,39,0.8)', 'rgba(232,197,90,0.6)', 'rgba(139,26,26,0.5)', 'rgba(64,145,108,0.5)'];
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

  // STATE

  let state = {
    foodType: '', quantity: 0, expiry: 0, location: '',
    score: 0, urgency: 0, distance: 0, capacity: 0,
    scoreClass: '', priorityLabel: ''
  };

  let timerInterval = null;
  let timerSec = 90;
  const CIRCUMFERENCE = 2 * Math.PI * 56; // ~351.9

 
  // HELPERS

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  
  // FORM SUBMIT

  function submitForm() {
    const ft = document.getElementById('food-type').value.trim();
    const qty = document.getElementById('quantity').value.trim();
    const exp = document.getElementById('expiry').value;
    const loc = document.getElementById('location').value.trim();

    if (!ft || !qty || !exp || !loc) {
      alert('Please fill all fields before casting the spell!');
      return;
    }

    state.foodType = ft;
    state.quantity = parseInt(qty);
    state.expiry = parseInt(exp);
    state.location = loc;

    showScreen('screen-loading');
    runLoader();
  }

  // LOADER

  function runLoader() {
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('loading-text');
    const steps = [
      [0,  'CONSULTING THE MARAUDER\'S MAP'],
      [22, 'CALCULATING EXPIRY URGENCY'],
      [50, 'SCANNING THE ORDER NETWORK'],
      [78, 'COMPUTING FOOD LIFE SCORE'],
      [100,'PROPHECY READY']
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(interval);
        setTimeout(computeScore, 500);
        return;
      }
      fill.style.width = steps[i][0] + '%';
      const textNode = label.childNodes[0];
      if (textNode) textNode.nodeValue = steps[i][1];
      else label.firstChild.textContent = steps[i][1];
      i++;
    }, 650);
  }

  // COMPUTE SCORE

  function computeScore() {
    const urgencyMap = { 1: 40, 2: 30, 4: 20, 8: 10 };
    const urgency = urgencyMap[state.expiry];
    const distance = rand(20, 35);
    const capacity = rand(15, 25);
    const total = urgency + distance + capacity;

    state.urgency = urgency;
    state.distance = distance;
    state.capacity = capacity;
    state.score = total;

    if (total >= 80) {
      state.scoreClass = 'red';
      state.priorityLabel = ' CRITICAL';
    } else if (total >= 60) {
      state.scoreClass = 'yellow';
      state.priorityLabel = ' MEDIUM';
    } else {
      state.scoreClass = 'green';
      state.priorityLabel = ' LOW';
    }

    renderScore();
    showScreen('screen-score');
  }

  function renderScore() {
    const s = state;
    const el = id => document.getElementById(id);

    el('score-display').className = 'score-num ' + s.scoreClass;
    let count = 0;
    const target = s.score;
    const step = Math.ceil(target / 30);
    const counter = setInterval(() => {
      count = Math.min(count + step, target);
      el('score-display').textContent = count;
      if (count >= target) clearInterval(counter);
    }, 40);

    const badge = el('score-badge');
    badge.className = 'score-badge ' + s.scoreClass;
    el('score-priority').textContent = s.priorityLabel;

    el('sf-urgency').textContent = s.urgency + '/40';
    el('sf-distance').textContent = s.distance + '/35';
    el('sf-capacity').textContent = s.capacity + '/25';

    const expiryLabel = { 1: '1 hr (Critical)', 2: '2 hrs (Urgent)', 4: '4 hrs (Moderate)', 8: '8 hrs (Low)' };
    el('score-info-row').innerHTML = `
      <div class="info-chip">
        <div class="info-chip-label"> Food Type</div>
        <div class="info-chip-val">${s.foodType}</div>
      </div>
      <div class="info-chip">
        <div class="info-chip-label">Quantity</div>
        <div class="info-chip-val">${s.quantity} servings</div>
      </div>
      <div class="info-chip">
        <div class="info-chip-label">Expiry</div>
        <div class="info-chip-val">${expiryLabel[s.expiry]}</div>
      </div>
    `;
  }

  //  NGO SCREEN
  
  function goToNGO() {
    showScreen('screen-ngo');
  }

  function sendRequest() {
    showScreen('screen-response');
    startTimer();
  }

  //TIMER
  
  function startTimer() {
    timerSec = 90;
    const ring = document.getElementById('timer-ring');
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
    document.getElementById('escalation-msg').style.display = 'block';
    setTimeout(() => {
      if (confirm('Escalating to Robin Hood Army (5 km).\n\nClick OK to simulate their acceptance.')) {
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

  // FINAL SCREEN
  
  function buildFinalScreen() {
    const expiryLabel = { 1: '1 hr', 2: '2 hrs', 4: '4 hrs', 8: '8 hrs' };
    document.getElementById('final-chips').innerHTML = `
      <div class="chip">🍱 <span>${state.foodType}</span></div>
      <div class="chip">👥 <span>${state.quantity} servings</span></div>
      <div class="chip">⏱ <span>${expiryLabel[state.expiry]}</span></div>
      <div class="chip">📍 <span>${state.location}</span></div>
      <div class="chip">⚡ Score: <span>${state.score}</span></div>
    `;
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

  //RESTART
  
  function restart() {
    clearInterval(timerInterval);
    document.getElementById('food-type').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('expiry').value = '';
    document.getElementById('location').value = '';
    document.getElementById('progress-fill').style.width = '0%';
    showScreen('screen-form');
  }