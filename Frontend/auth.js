/**
 * ResQFood — Auth Utilities
 * Include this script in index.html (before closing </body>)
 * It handles: goToAuth(), goToDonate(), header button routing, session awareness
 */

// ─── ROUTING FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Navigate to auth page with a stored user-type hint.
 * The auth page reads this to decide which view to show (login vs signup).
 * @param {'ngo'|'donor'} type
 */
function goToAuth(type) {
  localStorage.setItem('userType', type);
  window.location.href = 'auth.html';
}

/**
 * Donor flow: no login required — scroll directly to donation form.
 * If already on index.html, just ensure the form screen is visible.
 */
function goToDonate() {
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    // Already on main page — make sure form screen is active
    if (typeof showScreen === 'function') {
      showScreen('screen-form');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.location.href = 'index.html';
  }
}

// ─── SESSION HELPERS ────────────────────────────────────────────────────────

/**
 * Returns the stored NGO user object, or null if not logged in.
 */
function getLoggedInUser() {
  const token = localStorage.getItem('authToken');
  const user  = localStorage.getItem('ngoUser');
  if (!token || !user) return null;
  try { return JSON.parse(user); } catch { return null; }
}

/**
 * Returns true if a valid session exists.
 */
function isLoggedIn() {
  return !!getLoggedInUser();
}

// ─── HEADER AWARENESS ───────────────────────────────────────────────────────

/**
 * Call this on DOMContentLoaded to update header buttons based on session state.
 * If NGO is logged in, replace "Register as NGO" with "My Dashboard".
 */
function initHeaderAuth() {
  const user = getLoggedInUser();
  const ngoBtn = document.querySelector('.ngo-register-btn') || document.querySelector('[data-ngo-btn]');
  if (!ngoBtn) return;

  if (user && user.role === 'ngo') {
    ngoBtn.textContent = '⚑ My Dashboard';
    ngoBtn.onclick = () => { window.location.href = 'dashboard.html'; };
    ngoBtn.style.borderColor = 'var(--green-hp)';
    ngoBtn.style.color = 'var(--green-hp)';
  } else {
    ngoBtn.onclick = () => goToAuth('ngo');
  }
}

// ─── BACKEND API HELPERS ─────────────────────────────────────────────────────

const API_BASE = '/api'; // Change to your backend URL in production

async function apiRegister(payload) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data; // { token, user }
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data; // { token, user }
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initHeaderAuth);
