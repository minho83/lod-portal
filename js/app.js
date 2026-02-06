// ── LOD 포털 - 앱 라우터 및 공유 유틸 ──

const SECTIONS = ['party', 'calc', 'search', 'wiki'];
let activeSection = 'party';
const initialized = {};

// ── Server URL 관리 ──
let SERVER_URL = '';

function getServerUrl() {
  const params = new URLSearchParams(location.search);
  const fromParam = params.get('server');
  if (fromParam) return fromParam.replace(/\/+$/, '');
  const saved = localStorage.getItem('partyServerUrl');
  if (saved) return saved.replace(/\/+$/, '');
  if (location.protocol !== 'file:') return '';
  return '';
}

function initServerUrl() {
  SERVER_URL = getServerUrl();
  const input = document.getElementById('serverUrl');
  if (input) {
    input.value = SERVER_URL;
    if (!SERVER_URL && location.protocol !== 'file:') {
      document.getElementById('serverBar').style.display = 'none';
    }
  }
}

function connectServer() {
  const input = document.getElementById('serverUrl');
  let url = input.value.trim().replace(/\/+$/, '');
  if (url && !url.startsWith('http')) url = 'http://' + url;
  SERVER_URL = url;
  localStorage.setItem('partyServerUrl', url);
  checkServerStatus();
  // 현재 섹션 새로고침
  if (activeSection === 'party' && typeof PartyModule !== 'undefined') {
    PartyModule.loadParties();
  }
}

function apiUrl(path) {
  return SERVER_URL + path;
}

async function checkServerStatus() {
  const dot = document.getElementById('serverStatus');
  if (!dot) return;
  try {
    const resp = await fetch(apiUrl('/health'), { signal: AbortSignal.timeout(5000) });
    const data = await resp.json();
    dot.className = data.status === 'ok' ? 'server-status ok' : 'server-status err';
  } catch {
    dot.className = 'server-status err';
  }
}

// ── 라우팅 ──
function navigateTo(section) {
  if (!SECTIONS.includes(section)) section = 'party';
  location.hash = section;
}

function handleRoute() {
  const hash = location.hash.slice(1) || 'party';
  activeSection = SECTIONS.includes(hash) ? hash : 'party';

  SECTIONS.forEach(s => {
    const el = document.getElementById('section-' + s);
    if (el) el.style.display = s === activeSection ? '' : 'none';
  });

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === activeSection);
  });

  initSection(activeSection);

  // 파티 전용 공지바 표시/숨기기
  const noticebar = document.getElementById('partyNoticebar');
  if (noticebar) noticebar.style.display = activeSection === 'party' ? '' : 'none';

  // 파티 탭이 아닐 때 자동 새로고침 일시 정지
  if (typeof PartyModule !== 'undefined') {
    if (activeSection === 'party') {
      PartyModule.resumeRefresh();
    } else {
      PartyModule.pauseRefresh();
    }
  }
}

function initSection(section) {
  if (initialized[section]) return;
  initialized[section] = true;
  switch (section) {
    case 'party':
      if (typeof PartyModule !== 'undefined') PartyModule.init();
      break;
    case 'calc':
      if (typeof CalcUI !== 'undefined') CalcUI.init();
      break;
    case 'search':
      if (typeof SearchModule !== 'undefined') SearchModule.init();
      break;
    case 'wiki':
      if (typeof WikiModule !== 'undefined') WikiModule.init();
      break;
  }
}

// ── 공유 유틸 ──
function formatNumber(n) {
  return n?.toLocaleString('ko-KR') ?? '0';
}

function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="loading"><div class="spinner"></div><div style="color: var(--text-dim);">불러오는 중...</div></div>';
}

function showEmpty(containerId, icon, title, desc) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">${icon}</div><h3>${title}</h3><p>${desc || ''}</p></div>`;
}

// ── 초기화 ──
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
  initServerUrl();
  checkServerStatus();
  handleRoute();

  const serverInput = document.getElementById('serverUrl');
  if (serverInput) {
    serverInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') connectServer();
    });
  }
});
