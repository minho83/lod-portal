// ── LOD 도우미 - 파티 빈자리 모듈 ──

const PartyModule = {
  allParties: [],
  currentDate: null,
  currentFilter: '',
  currentTimeFilter: '',
  refreshInterval: null,
  refreshCountdown: 30,
  retryCount: 0,
  MAX_RETRY: 3,
  isLoading: false,
  isPaused: false,

  JOB_INFO: {
    warrior: { name: 'Warrior', kr: '전사', icon: '&#x2694;' },
    rogue:   { name: 'Rogue',   kr: '도적', icon: '&#x1F5E1;' },
    mage:    { name: 'Mage',    kr: '법사', icon: '&#x2728;' },
    cleric:  { name: 'Cleric',  kr: '직자', icon: '&#x2695;' },
    taoist:  { name: 'Taoist',  kr: '도가', icon: '&#x262F;' }
  },

  LOCATION_ICONS: {
    '탑층': '&#x1F3F0;', '상층': '&#x1F3DB;', '고층': '&#x26F0;',
    '설원': '&#x2744;', '필드': '&#x1F332;',
    '나겔탑': '&#x1F5FC;', '나겔링': '&#x1F48D;'
  },

  init() {
    this.initKoreanDate();
    this.updateDateDisplay();
    this.loadParties();
    this.startRefreshTimer();
  },

  initKoreanDate() {
    const koStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
    this.currentDate = new Date(koStr);
    this.currentDate.setHours(0, 0, 0, 0);
  },

  formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  formatDisplayDate(d) {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dName = dayNames[d.getDay()];
    const koStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
    const today = new Date(koStr);
    today.setHours(0, 0, 0, 0);
    const isToday = d.getTime() === today.getTime();
    return `${month}/${day} (${dName})${isToday ? ' 오늘' : ''}`;
  },

  changeDate(delta) {
    this.currentDate.setDate(this.currentDate.getDate() + delta);
    this.updateDateDisplay();
    this.loadParties();
  },

  updateDateDisplay() {
    const el = document.getElementById('partyDateDisplay');
    if (el) el.textContent = this.formatDisplayDate(this.currentDate);
  },

  setFilter(el, job) {
    this.currentFilter = job;
    document.querySelectorAll('#partyFilterChips .chip').forEach(c => {
      c.className = 'chip';
    });
    if (job) {
      el.className = `chip active-${job}`;
    } else {
      el.className = 'chip active';
    }
    this.updateFilterSummary();
    this.renderParties();
  },

  setTimeFilter(el, time) {
    this.currentTimeFilter = time;
    document.querySelectorAll('#partyTimeChips .chip').forEach(c => {
      c.className = 'chip';
    });
    el.className = 'chip active';
    this.updateFilterSummary();
    this.renderParties();
  },

  toggleFilters() {
    const body = document.getElementById('partyFilterBody');
    const arrow = document.getElementById('partyFilterArrow');
    if (body) body.classList.toggle('open');
    if (arrow) arrow.classList.toggle('open');
  },

  updateFilterSummary() {
    const jobName = this.currentFilter ? this.JOB_INFO[this.currentFilter].kr : '전체';
    const timeName = this.currentTimeFilter || '전체 시간';
    const parts = [jobName];
    if (this.currentTimeFilter) parts.push(timeName);
    const el = document.getElementById('partyFilterSummary');
    if (el) el.textContent = parts.join(' · ');
  },

  buildTimeChips() {
    const times = [...new Set(this.allParties.map(p => p.time_slot))].sort();
    const container = document.getElementById('partyTimeChips');
    if (!container) return;
    const isAllActive = !this.currentTimeFilter;
    let html = `<button class="chip${isAllActive ? ' active' : ''}" onclick="PartyModule.setTimeFilter(this, '')">전체 시간</button>`;
    times.forEach(t => {
      const count = this.allParties.filter(p => p.time_slot === t).length;
      const isActive = this.currentTimeFilter === t;
      html += `<button class="chip${isActive ? ' active' : ''}" onclick="PartyModule.setTimeFilter(this, '${t}')">${t} (${count})</button>`;
    });
    container.innerHTML = html;
  },

  async loadParties(isRetry = false) {
    if (this.isLoading && !isRetry) return;
    this.isLoading = true;
    this.refreshCountdown = 30;

    const dateStr = this.formatDate(this.currentDate);
    const includeEl = document.getElementById('partyIncludeComplete');
    const includeComplete = includeEl ? includeEl.checked : false;

    const isFirstLoad = this.allParties.length === 0 && !isRetry;
    if (isFirstLoad) {
      showLoading('partyContent');
    }

    try {
      const resp = await fetch(apiUrl('/api/party/vacancy?') + new URLSearchParams({
        date: dateStr,
        include_complete: includeComplete ? '1' : '0'
      }), { signal: AbortSignal.timeout(8000) });
      const data = await resp.json();

      this.retryCount = 0;
      if (data.success) {
        this.allParties = data.parties || [];
        this.buildTimeChips();
        this.renderStats(data);
        this.renderParties();
      } else {
        this.allParties = [];
        this.buildTimeChips();
        this.renderStats({ stats: {} });
        this.renderParties();
      }
    } catch (err) {
      console.error('Load error:', err);
      if (this.retryCount < this.MAX_RETRY) {
        this.retryCount++;
        const delay = this.retryCount * 2000;
        if (this.allParties.length === 0) {
          showEmpty('partyContent', '&#x1F504;', `재연결 중... (${this.retryCount}/${this.MAX_RETRY})`);
        }
        setTimeout(() => this.loadParties(true), delay);
        this.isLoading = false;
        return;
      }
      if (this.allParties.length === 0) {
        const isLocal = !SERVER_URL && location.protocol !== 'file:';
        const msg = isLocal
          ? '서버에 일시적으로 연결할 수 없습니다. 자동으로 재시도합니다.'
          : '서버에 연결할 수 없습니다. 상단에서 서버 URL을 확인해주세요.';
        showEmpty('partyContent', '&#x26A0;', '연결 오류', msg);
      }
      const dot = document.getElementById('serverStatus');
      if (dot) dot.className = 'server-status err';
      this.retryCount = 0;
    }

    this.isLoading = false;
    checkServerStatus();
  },

  renderStats(data) {
    const stats = data.stats || {};
    const parties = this.allParties;
    const totalVacancies = parties.reduce((sum, p) => sum + (p.vacancies?.total || 0), 0);
    const vacantParties = parties.filter(p => (p.vacancies?.total || 0) > 0).length;

    const jobVacancies = {};
    Object.keys(this.JOB_INFO).forEach(job => {
      jobVacancies[job] = parties.reduce((sum, p) => sum + (p.vacancies?.[job] || 0), 0);
    });

    let html = `
      <div class="stat-card"><div class="stat-value">${parties.length}</div><div class="stat-label">전체 파티</div></div>
      <div class="stat-card"><div class="stat-value">${vacantParties}</div><div class="stat-label">빈자리 파티</div></div>
      <div class="stat-card"><div class="stat-value">${totalVacancies}</div><div class="stat-label">빈자리 수</div></div>
    `;

    Object.entries(this.JOB_INFO).forEach(([key, info]) => {
      if (jobVacancies[key] > 0) {
        html += `<div class="stat-card"><div class="stat-value" style="-webkit-text-fill-color: var(--${key}); background: none;">${jobVacancies[key]}</div><div class="stat-label">${info.kr} 빈자리</div></div>`;
      }
    });

    const el = document.getElementById('partyStatsBar');
    if (el) el.innerHTML = html;
  },

  renderParties() {
    const container = document.getElementById('partyContent');
    if (!container) return;
    let filtered = this.allParties;

    if (this.currentFilter) {
      filtered = filtered.filter(p => (p.vacancies?.[this.currentFilter] || 0) > 0);
    }
    if (this.currentTimeFilter) {
      filtered = filtered.filter(p => p.time_slot === this.currentTimeFilter);
    }

    if (filtered.length === 0) {
      const filterName = this.currentFilter ? this.JOB_INFO[this.currentFilter].kr : '';
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">&#x1F50D;</div><h3>파티 없음</h3><p>${filterName ? filterName + ' 빈자리가 있는 파티가 없습니다.' : '해당 날짜에 파티 데이터가 없습니다.'}</p></div>`;
      return;
    }

    const groups = {};
    filtered.forEach(p => {
      const ts = p.time_slot || '미정';
      if (!groups[ts]) groups[ts] = [];
      groups[ts].push(p);
    });

    const sortedTimes = Object.keys(groups).sort();
    let html = '';

    sortedTimes.forEach(time => {
      const parties = groups[time];
      const vacantCount = parties.filter(p => (p.vacancies?.total || 0) > 0).length;
      html += `<div class="time-group"><div class="time-header"><span class="time-badge">${time}</span><span class="time-count">${parties.length}개 파티${vacantCount > 0 ? ` &middot; ${vacantCount}개 빈자리` : ''}</span></div><div class="party-grid">`;
      parties.forEach(p => { html += this.renderPartyCard(p); });
      html += '</div></div>';
    });

    container.innerHTML = html;
  },

  renderPartyCard(party) {
    const loc = party.location || '미정';
    const locIcon = Object.entries(this.LOCATION_ICONS).find(([k]) => loc.includes(k));
    const icon = locIcon ? locIcon[1] : '&#x1F4CD;';
    const isComplete = party.is_complete;
    const sender = party.organizer || (party.sender_name ? party.sender_name.split('/')[0] : '');
    const vacancies = party.vacancies || {};

    let vacancyTags = '';
    Object.entries(this.JOB_INFO).forEach(([key, info]) => {
      const count = vacancies[key] || 0;
      if (count > 0) {
        vacancyTags += `<span class="vacancy-tag ${key}">${info.kr} ${count}자리</span>`;
      }
    });

    let slotRows = '';
    const jobs = ['warrior', 'rogue', 'mage', 'cleric', 'taoist'];
    jobs.forEach(job => {
      const slots = party[`${job}_slots`] || [];
      if (slots.length === 0) return;
      const info = this.JOB_INFO[job];
      let slotsHtml = '';
      slots.forEach(s => {
        if (s === '') {
          slotsHtml += `<span class="slot empty ${job}">모집중</span>`;
        } else {
          slotsHtml += `<span class="slot filled">${s}</span>`;
        }
      });
      slotRows += `<div class="slot-row"><span class="slot-job ${job}">${info.kr}</span><div class="slot-list">${slotsHtml}</div></div>`;
    });

    let reqHtml = '';
    const reqs = party.requirements || {};
    if (typeof reqs === 'object' && Object.keys(reqs).length > 0) {
      reqHtml = '<div class="requirements">';
      Object.entries(reqs).forEach(([job, req]) => {
        reqHtml += `<div class="req-item"><strong>${job}</strong>: ${req}</div>`;
      });
      reqHtml += '</div>';
    }

    return `
      <div class="party-card${isComplete ? ' complete' : ''}">
        <div class="card-top">
          <div class="card-location">
            <div class="location-icon">${icon}</div>
            <div>
              <div class="location-name">${loc}</div>
              ${party.party_name ? `<div class="party-name">${party.party_name}</div>` : ''}
            </div>
          </div>
          <div class="card-meta">
            ${sender ? `<div class="card-sender">@${sender}</div>` : ''}
            ${party.updated_at ? `<div class="card-updated">${this.formatTimeAgo(party.updated_at)}</div>` : ''}
          </div>
        </div>
        ${vacancyTags ? `<div class="vacancy-summary">${vacancyTags}</div>` : ''}
        <div class="slot-rows">${slotRows}</div>
        ${reqHtml}
      </div>
    `;
  },

  formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return '방금';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  },

  startRefreshTimer() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => {
      if (this.isPaused) return;
      this.refreshCountdown--;
      const el = document.getElementById('partyRefreshTimer');
      if (el) el.textContent = `${this.refreshCountdown}s`;
      if (this.refreshCountdown <= 0) {
        this.loadParties();
      }
    }, 1000);
  },

  pauseRefresh() {
    this.isPaused = true;
  },

  resumeRefresh() {
    this.isPaused = false;
  }
};
