// ── LOD 도우미 - 노션 위키 뷰어 ──
const WikiModule = (() => {
  'use strict';

  let loaded = false;

  function init() {
    if (loaded) return;
    loaded = true;
    loadWiki();
  }

  async function loadWiki() {
    showLoading('wikiContent');
    try {
      const resp = await fetch(apiUrl('/api/wiki'));
      const data = await resp.json();
      if (!data.success) {
        showEmpty('wikiContent', '\u{1F4D6}', '위키를 불러올 수 없습니다', data.message);
        return;
      }
      renderWiki(data.blocks);
    } catch (e) {
      showEmpty('wikiContent', '\u{1F4D6}', '위키를 불러올 수 없습니다', '서버에 연결할 수 없습니다');
    }
  }

  function renderWiki(blocks) {
    const container = document.getElementById('wikiContent');
    if (!container) return;

    const rows = extractCategoryRows(blocks);
    const allCats = rows.flatMap(row => row.columns.flat());
    let html = '';
    let catIdx = 0;

    // 상단 인트로
    html += '<div class="wiki-intro">';
    html += '<p>여러분 환영합니다! 뉴비 지원소 입니다</p>';
    html += '<p class="wiki-intro-sub">\u25B6 제목을 누르면 펼쳐집니다 | 작성자: 밀떡밀떡 / 곽진희</p>';
    html += '</div>';

    // 검색창
    html += '<div class="wiki-search">';
    html += '<input type="text" id="wikiSearchInput" class="wiki-search-input" placeholder="위키 검색..." oninput="WikiModule.onSearch(this.value)">';
    html += '<div id="wikiSearchResult" class="wiki-search-result" style="display:none"></div>';
    html += '</div>';

    // 카테고리 네비
    html += '<div class="wiki-nav" id="wikiNav">';
    allCats.forEach((cat, i) => {
      html += `<button class="chip wiki-nav-chip" onclick="WikiModule.scrollTo('wikiCat${i}')">${cat.icon}${cat.name}</button>`;
    });
    html += '</div>';

    // 카테고리별 2열 렌더
    for (const row of rows) {
      html += '<div class="wiki-row">';
      for (const colCats of row.columns) {
        html += '<div class="wiki-row-col">';
        for (const cat of colCats) {
          html += `<div class="wiki-category" id="wikiCat${catIdx}" data-cat-name="${escHtml(cat.name)}">`;
          html += `<div class="wiki-cat-header"><span class="wiki-cat-icon">${cat.icon}</span>${cat.name}</div>`;
          html += '<div class="wiki-items">';
          cat.items.forEach(item => { html += renderWikiItem(item); });
          html += '</div></div>';
          catIdx++;
        }
        html += '</div>';
      }
      html += '</div>';
    }

    // 하단 링크 & 기타
    const extras = extractExtras(blocks);
    if (extras.length > 0) {
      html += '<div class="wiki-category" id="wikiExtras">';
      html += '<div class="wiki-cat-header">\u{1F517} 유용한 링크</div>';
      html += '<div class="wiki-extras">';
      extras.forEach(e => {
        html += `<a href="${escHtml(e.url)}" target="_blank" class="wiki-extra-link">${escHtml(e.text)}</a>`;
      });
      html += '</div></div>';
    }

    container.innerHTML = html;
  }

  // heading_2 뒤에 토글이 있는지 확인 (진짜 카테고리인지 판별)
  function hasToggleAfter(children, startIdx) {
    for (let i = startIdx + 1; i < children.length; i++) {
      const t = children[i].type;
      if (t === 'heading_2' || t === 'callout') return false;
      if (t === 'toggle' || t === 'heading_1') return true;
    }
    return false;
  }

  function extractCategoryRows(blocks) {
    const rows = [];

    for (const block of blocks) {
      if (block.type !== 'column_list' || !block._columns) continue;
      const columns = [];
      for (const col of block._columns) {
        const colCats = [];
        if (!col._children) { columns.push(colCats); continue; }
        let currentCat = null;
        for (let i = 0; i < col._children.length; i++) {
          const child = col._children[i];
          const isHeader = (child.type === 'heading_2' || child.type === 'callout') && getText(child);

          if (isHeader) {
            // heading_2: 뒤에 토글이 있어야 진짜 카테고리
            const isCatHeader = child.type === 'callout' || hasToggleAfter(col._children, i);

            if (isCatHeader) {
              const raw = getText(child);
              const icon = extractEmoji(raw);
              const name = raw.replace(/^\p{Emoji_Presentation}\s*/u, '').trim();
              if (!name) continue;
              currentCat = { icon: icon || '\u{1F4C1}', name, items: [] };
              colCats.push(currentCat);
            } else if (currentCat) {
              // 토글이 없는 heading_2 → 링크/텍스트 항목으로 처리
              const text = getText(child);
              const link = getLink(child);
              if (text && text.trim()) {
                currentCat.items.push({
                  id: child.id, text, hasChildren: false, link, type: 'text'
                });
              }
            }
          } else if (currentCat && (child.type === 'toggle' || child.type === 'heading_1')) {
            const text = getText(child);
            if (text) {
              currentCat.items.push({
                id: child.id,
                text: text,
                hasChildren: child.has_children,
                preloaded: child._children || null,
                type: child.type
              });
            }
          } else if (currentCat && child.type === 'paragraph') {
            const text = getText(child);
            const link = getLink(child);
            if (text && text.trim()) {
              currentCat.items.push({
                id: child.id, text, hasChildren: false, link, type: 'text'
              });
            }
          }
        }
        columns.push(colCats);
      }
      if (columns.some(c => c.length > 0)) {
        rows.push({ columns });
      }
    }
    return rows;
  }

  function extractExtras(blocks) {
    const extras = [];
    for (const block of blocks) {
      if (block.type === 'paragraph') {
        const link = getLink(block);
        const text = getText(block);
        if (link && text) extras.push({ text, url: link });
      }
    }
    return extras;
  }

  // ── 검색 ──
  let searchTimer = null;

  function onSearch(query) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => doSearch(query), 150);
  }

  function doSearch(query) {
    const q = query.trim().toLowerCase();
    const resultDiv = document.getElementById('wikiSearchResult');
    const nav = document.getElementById('wikiNav');
    const categories = document.querySelectorAll('.wiki-category');
    const rows = document.querySelectorAll('.wiki-row');

    if (!q) {
      // 검색어 없으면 원래 상태로
      if (resultDiv) { resultDiv.style.display = 'none'; resultDiv.innerHTML = ''; }
      if (nav) nav.style.display = '';
      rows.forEach(r => r.style.display = '');
      categories.forEach(cat => {
        cat.style.display = '';
        cat.querySelectorAll('.wiki-item, .wiki-text-link, .wiki-text-item').forEach(el => el.style.display = '');
      });
      return;
    }

    // 카테고리 내 항목 필터링
    if (nav) nav.style.display = 'none';
    let totalMatches = 0;

    categories.forEach(cat => {
      const items = cat.querySelectorAll('.wiki-item, .wiki-text-link, .wiki-text-item');
      let catMatch = false;
      const catName = (cat.dataset.catName || '').toLowerCase();

      if (catName.includes(q)) {
        // 카테고리명 자체가 매치 → 전부 표시
        catMatch = true;
        items.forEach(el => { el.style.display = ''; totalMatches++; });
      } else {
        items.forEach(el => {
          const text = (el.textContent || '').toLowerCase();
          if (text.includes(q)) {
            el.style.display = '';
            catMatch = true;
            totalMatches++;
          } else {
            el.style.display = 'none';
          }
        });
      }
      cat.style.display = catMatch ? '' : 'none';
    });

    // 빈 row 숨기기
    rows.forEach(row => {
      const visibleCats = row.querySelectorAll('.wiki-category:not([style*="display: none"])');
      row.style.display = visibleCats.length > 0 ? '' : 'none';
    });

    // 결과 카운트
    if (resultDiv) {
      if (totalMatches > 0) {
        resultDiv.style.display = '';
        resultDiv.textContent = `${totalMatches}개 항목 찾음`;
      } else {
        resultDiv.style.display = '';
        resultDiv.textContent = '검색 결과가 없습니다';
      }
    }
  }

  function renderWikiItem(item) {
    if (item.type === 'text') {
      if (item.link) {
        return `<a href="${escHtml(item.link)}" target="_blank" class="wiki-text-link">${escHtml(item.text)}</a>`;
      }
      return `<div class="wiki-text-item">${escHtml(item.text)}</div>`;
    }

    const star = item.text.includes('\u2605') ? ' wiki-item-star' : '';
    return `<div class="wiki-item${star}">
      <div class="wiki-item-header" onclick="WikiModule.toggleItem(this, '${item.id}', ${item.hasChildren})">
        <span class="wiki-item-arrow">\u25B6</span>
        <span class="wiki-item-title">${escHtml(item.text)}</span>
      </div>
      <div class="wiki-item-body" id="wikiBody_${item.id}" style="display:none">${
        item.preloaded ? renderBlocks(item.preloaded) : '<div class="wiki-loading">불러오는 중...</div>'
      }</div>
    </div>`;
  }

  async function toggleItem(headerEl, blockId, hasChildren) {
    const body = document.getElementById('wikiBody_' + blockId);
    if (!body) return;
    const arrow = headerEl.querySelector('.wiki-item-arrow');
    const isOpen = body.style.display !== 'none';

    if (isOpen) {
      body.style.display = 'none';
      if (arrow) arrow.classList.remove('open');
      return;
    }

    body.style.display = '';
    if (arrow) arrow.classList.add('open');

    // 아직 로딩 안 된 경우 fetch
    if (hasChildren && body.innerHTML.includes('wiki-loading')) {
      try {
        const resp = await fetch(apiUrl('/api/wiki/blocks/' + blockId));
        const data = await resp.json();
        if (data.success) {
          body.innerHTML = renderBlocks(data.blocks);
        } else {
          body.innerHTML = '<div class="wiki-error">내용을 불러올 수 없습니다</div>';
        }
      } catch {
        body.innerHTML = '<div class="wiki-error">서버에 연결할 수 없습니다</div>';
      }
    }
  }

  function renderBlocks(blocks) {
    if (!blocks || blocks.length === 0) return '<div class="wiki-empty-body">내용 없음</div>';
    let html = '';
    for (const b of blocks) {
      html += renderBlock(b);
    }
    return html;
  }

  function renderBlock(block) {
    const type = block.type;
    const text = getText(block);
    const richHtml = getRichHtml(block);

    switch (type) {
      case 'paragraph':
        if (!text.trim()) return '';
        return `<p class="wiki-p">${richHtml}</p>`;

      case 'heading_1':
        return `<h3 class="wiki-h1">${richHtml}</h3>`;
      case 'heading_2':
        return `<h4 class="wiki-h2">${richHtml}</h4>`;
      case 'heading_3':
        return `<h5 class="wiki-h3">${richHtml}</h5>`;

      case 'bulleted_list_item':
        let blHtml = `<div class="wiki-li">\u2022 ${richHtml}</div>`;
        if (block._children) {
          blHtml += '<div class="wiki-indent">' + renderBlocks(block._children) + '</div>';
        }
        return blHtml;

      case 'numbered_list_item':
        return `<div class="wiki-li">${richHtml}</div>`;

      case 'toggle':
        const toggleHtml = block._children ? renderBlocks(block._children) : '';
        return `<div class="wiki-sub-toggle">
          <div class="wiki-sub-toggle-header" onclick="WikiModule.toggleSub(this)">
            <span class="wiki-item-arrow">\u25B6</span> ${escHtml(text)}
          </div>
          <div class="wiki-sub-toggle-body" style="display:none">${
            toggleHtml || (block.has_children ?
              `<div class="wiki-loading" data-block-id="${block.id}">불러오는 중...</div>` :
              '<div class="wiki-empty-body">내용 없음</div>')
          }</div>
        </div>`;

      case 'callout':
        return `<div class="wiki-callout">${richHtml}</div>`;

      case 'quote':
        let qHtml = `<blockquote class="wiki-quote">${richHtml}</blockquote>`;
        if (block._children) {
          qHtml += '<div class="wiki-indent">' + renderBlocks(block._children) + '</div>';
        }
        return qHtml;

      case 'divider':
        return '<hr class="wiki-divider">';

      case 'image':
        const imgUrl = block.image?.file?.url || block.image?.external?.url || '';
        const caption = block.image?.caption?.map(t => t.plain_text).join('') || '';
        if (!imgUrl) return '';
        return `<div class="wiki-image"><img src="${escHtml(imgUrl)}" alt="${escHtml(caption)}" loading="lazy"><div class="wiki-image-caption">${escHtml(caption)}</div></div>`;

      case 'bookmark':
        const bUrl = block.bookmark?.url || '';
        const bCaption = block.bookmark?.caption?.map(t => t.plain_text).join('') || bUrl;
        return `<a href="${escHtml(bUrl)}" target="_blank" class="wiki-bookmark">${escHtml(bCaption)}</a>`;

      case 'table':
        if (block._children) {
          return renderTable(block._children);
        }
        return '';

      case 'column_list':
        if (block._columns) {
          let colHtml = '<div class="wiki-columns">';
          for (const col of block._columns) {
            colHtml += '<div class="wiki-column">';
            if (col._children) colHtml += renderBlocks(col._children);
            colHtml += '</div>';
          }
          colHtml += '</div>';
          return colHtml;
        }
        return '';

      default:
        return text ? `<p class="wiki-p">${richHtml}</p>` : '';
    }
  }

  function renderTable(rows) {
    if (!rows || rows.length === 0) return '';
    let html = '<div class="wiki-table-wrap"><table class="wiki-table">';
    rows.forEach((row, i) => {
      const cells = row.table_row?.cells || [];
      const tag = i === 0 ? 'th' : 'td';
      html += '<tr>';
      cells.forEach(cell => {
        const cellText = cell.map(t => t.plain_text).join('');
        html += `<${tag}>${escHtml(cellText)}</${tag}>`;
      });
      html += '</tr>';
    });
    html += '</table></div>';
    return html;
  }

  function toggleSub(headerEl) {
    const body = headerEl.nextElementSibling;
    if (!body) return;
    const arrow = headerEl.querySelector('.wiki-item-arrow');
    const isOpen = body.style.display !== 'none';

    if (isOpen) {
      body.style.display = 'none';
      if (arrow) arrow.classList.remove('open');
    } else {
      body.style.display = '';
      if (arrow) arrow.classList.add('open');

      // lazy load if needed
      const loader = body.querySelector('.wiki-loading[data-block-id]');
      if (loader) {
        const blockId = loader.dataset.blockId;
        fetch(apiUrl('/api/wiki/blocks/' + blockId))
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              body.innerHTML = renderBlocks(data.blocks);
            } else {
              body.innerHTML = '<div class="wiki-error">내용을 불러올 수 없습니다</div>';
            }
          })
          .catch(() => {
            body.innerHTML = '<div class="wiki-error">서버에 연결할 수 없습니다</div>';
          });
      }
    }
  }

  // ── 텍스트 추출 헬퍼 ──
  function getText(block) {
    const rt = block[block.type]?.rich_text || block[block.type]?.text || [];
    if (!Array.isArray(rt)) return '';
    return rt.map(t => t.plain_text || '').join('');
  }

  function getRichHtml(block) {
    const rt = block[block.type]?.rich_text || block[block.type]?.text || [];
    if (!Array.isArray(rt)) return '';
    return rt.map(t => {
      let s = escHtml(t.plain_text || '');
      if (!s) return '';
      const a = t.annotations || {};
      if (a.bold) s = `<strong>${s}</strong>`;
      if (a.italic) s = `<em>${s}</em>`;
      if (a.strikethrough) s = `<s>${s}</s>`;
      if (a.underline) s = `<u>${s}</u>`;
      if (a.code) s = `<code class="wiki-code">${s}</code>`;
      if (a.color && a.color !== 'default') {
        const c = notionColor(a.color);
        if (c) s = `<span style="color:${c}">${s}</span>`;
      }
      if (t.href) s = `<a href="${escHtml(t.href)}" target="_blank" class="wiki-link">${s}</a>`;
      return s;
    }).join('');
  }

  function getLink(block) {
    const rt = block[block.type]?.rich_text || [];
    for (const t of rt) {
      if (t.href) return t.href;
    }
    return null;
  }

  function extractEmoji(text) {
    const match = text.match(/^(\p{Emoji_Presentation})/u);
    return match ? match[1] + ' ' : '';
  }

  function notionColor(color) {
    const map = {
      'red': '#e74c3c', 'blue': '#3498db', 'green': '#27ae60',
      'yellow': '#f1c40f', 'orange': '#e67e22', 'purple': '#9b59b6',
      'pink': '#e91e9c', 'gray': '#8b90a0',
      'red_background': null, 'blue_background': null, 'green_background': null,
      'yellow_background': null, 'orange_background': null, 'purple_background': null,
      'pink_background': null, 'gray_background': null,
      'brown': '#a0522d', 'brown_background': null
    };
    return map[color] || null;
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function refresh() {
    loaded = false;
    try { await fetch(apiUrl('/api/wiki/refresh'), { method: 'POST' }); } catch {}
    loadWiki();
  }

  return { init, toggleItem, toggleSub, scrollTo, refresh, onSearch };
})();
