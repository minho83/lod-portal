// ── LOD 도우미 - DB 검색 모듈 ──

const SearchModule = {
  currentCategory: 'all',

  init() {
    document.getElementById('searchInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.doSearch();
    });
  },

  setCategory(el, cat) {
    this.currentCategory = cat;
    document.querySelectorAll('#searchCategoryChips .chip').forEach(c => c.className = 'chip');
    el.className = 'chip active';
  },

  async doSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    if (!query) return;

    showLoading('searchResults');

    try {
      const params = new URLSearchParams({ q: query, category: this.currentCategory, limit: '20' });
      const resp = await fetch(apiUrl('/api/search?') + params, { signal: AbortSignal.timeout(8000) });
      const data = await resp.json();

      if (data.success && data.results && data.results.length > 0) {
        this.renderResults(data);
      } else {
        showEmpty('searchResults', '&#x1F50D;', '검색 결과 없음', `"${query}"에 대한 결과가 없습니다.`);
      }
    } catch (err) {
      showEmpty('searchResults', '&#x26A0;', '검색 오류', '서버에 연결할 수 없습니다.');
    }
  },

  renderResults(data) {
    const container = document.getElementById('searchResults');
    let html = `<div class="search-result-header">"${data.query}" 검색 결과 <span style="color:var(--accent)">${data.count}건</span></div>`;
    html += '<div class="search-grid">';

    data.results.forEach(item => {
      html += this.renderResultCard(item);
    });

    html += '</div>';
    container.innerHTML = html;
  },

  renderResultCard(item) {
    const categoryInfo = {
      'item': { icon: '&#x1F5E1;', label: '아이템' },
      'skill': { icon: '&#x2694;', label: '기술' },
      'spell': { icon: '&#x2728;', label: '마법' }
    };
    const info = categoryInfo[item.category] || { icon: '&#x1F4C4;', label: item.category };

    let details = '';

    if (item.category === 'item') {
      const detailParts = [];
      if (item.categoryName) detailParts.push(item.categoryName);
      if (item.job && item.job !== '공통') detailParts.push(item.job);
      if (item.level && item.level !== '0') detailParts.push(`Lv.${item.level}`);
      if (detailParts.length > 0) details += `<div class="result-detail">${detailParts.join(' · ')}</div>`;

      // 스탯
      const stats = [];
      if (item.str && item.str !== '0') stats.push(`STR${parseInt(item.str) > 0 ? '+' : ''}${item.str}`);
      if (item.dex && item.dex !== '0') stats.push(`DEX${parseInt(item.dex) > 0 ? '+' : ''}${item.dex}`);
      if (item.int && item.int !== '0') stats.push(`INT${parseInt(item.int) > 0 ? '+' : ''}${item.int}`);
      if (item.wis && item.wis !== '0') stats.push(`WIS${parseInt(item.wis) > 0 ? '+' : ''}${item.wis}`);
      if (item.con && item.con !== '0') stats.push(`CON${parseInt(item.con) > 0 ? '+' : ''}${item.con}`);
      if (item.hp && item.hp !== '0') stats.push(`HP${parseInt(item.hp) > 0 ? '+' : ''}${item.hp}`);
      if (item.mp && item.mp !== '0') stats.push(`MP${parseInt(item.mp) > 0 ? '+' : ''}${item.mp}`);
      if (stats.length > 0) details += `<div class="result-stats">${stats.join(' ')}</div>`;

      // 무기 데미지
      if (item.categoryName === '무기' && (item.smallDamage || item.largeDamage)) {
        const small = item.smallDamage ? item.smallDamage.replace('m', '~') : '-';
        const large = item.largeDamage ? item.largeDamage.replace('m', '~') : '-';
        details += `<div class="result-detail">데미지: ${small} (소) / ${large} (대)</div>`;
      }

      // 방어구 AC
      if (['방어구', '방패'].includes(item.categoryName)) {
        const defParts = [];
        if (item.ac && item.ac !== '0') defParts.push(`AC: ${item.ac}`);
        if (item.magicDefense && item.magicDefense !== '0') defParts.push(`마방: ${item.magicDefense}`);
        if (defParts.length > 0) details += `<div class="result-detail">${defParts.join(' · ')}</div>`;
      }
    }

    if (item.category === 'skill' || item.category === 'spell') {
      if (item.costMana && item.costMana !== '0') {
        details += `<div class="result-detail">MP 소모: ${Number(item.costMana).toLocaleString()}</div>`;
      }
      if (item.needLevel && item.needLevel !== '0' && item.needLevel !== '1') {
        details += `<div class="result-detail">필요 레벨: ${item.needLevel}</div>`;
      }
    }

    if (item.description && item.description.trim()) {
      details += `<div class="result-desc">${item.description}</div>`;
    }

    return `
      <div class="content-card">
        <div class="result-header">
          <span class="result-category cat-${item.category}">${info.icon} ${info.label}</span>
          <span class="result-name">${item.displayName || item.name}</span>
        </div>
        ${details}
      </div>
    `;
  }
};
