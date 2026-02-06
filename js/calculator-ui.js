// ── LOD 도우미 - 라르 계산기 UI ──

const CalcUI = {
  currentMode: 'required',
  dansuTable: [
    { dansu: 7, exp: 2000000000 },
    { dansu: 8, exp: 107000000000 },
    { dansu: 9, exp: 212000000000 },
    { dansu: 10, exp: 315000000000 },
    { dansu: 11, exp: 420000000000 },
    { dansu: 12, exp: 530000000000 },
    { dansu: 13, exp: 631000000000 },
    { dansu: 14, exp: 1250000000000 },
    { dansu: 15, exp: 1900000000000 },
    { dansu: 16, exp: 2500000000000 },
    { dansu: 17, exp: 3150000000000 },
    { dansu: 18, exp: 3750000000000 },
    { dansu: 19, exp: 4400000000000 },
    { dansu: 20, exp: 5000000000000 },
    { dansu: 21, exp: 6000000000000 },
    { dansu: 22, exp: 7100000000000 },
    { dansu: 23, exp: 8200000000000 },
    { dansu: 24, exp: 9300000000000 },
    { dansu: 25, exp: 10300000000000 },
    { dansu: 26, exp: 11500000000000 },
    { dansu: 27, exp: 12600000000000 },
    { dansu: 28, exp: 13500000000000 },
    { dansu: 29, exp: 14500000000000 },
    { dansu: 30, exp: 15600000000000 },
    { dansu: 31, exp: 17600000000000 },
    { dansu: 32, exp: 20700000000000 },
    { dansu: 33, exp: 24820000000000 },
    { dansu: 34, exp: 29900000000000 },
    { dansu: 35, exp: 36000000000000 },
    { dansu: 36, exp: 40000000000000 },
    { dansu: 37, exp: 51000000000000 },
    { dansu: 38, exp: 60000000000000 },
    { dansu: 39, exp: 70000000000000 },
    { dansu: 40, exp: 81000000000000 },
    { dansu: 41, exp: 93500000000000 },
    { dansu: 42, exp: 108000000000000 },
    { dansu: 43, exp: 122500000000000 },
    { dansu: 44, exp: 137000000000000 },
    { dansu: 45, exp: 151500000000000 },
    { dansu: 46, exp: 169500000000000 },
    { dansu: 47, exp: 187500000000000 },
    { dansu: 48, exp: 206000000000000 },
    { dansu: 49, exp: 224500000000000 },
    { dansu: 50, exp: 248000000000000 },
    { dansu: 51, exp: 271500000000000 },
    { dansu: 52, exp: 292000000000000 },
    { dansu: 53, exp: 318500000000000 },
    { dansu: 54, exp: 342000000000000 },
    { dansu: 55, exp: 367150000000000 },
    { dansu: 56, exp: 394200000000000 },
    { dansu: 57, exp: 422250000000000 },
    { dansu: 58, exp: 451350000000000 },
    { dansu: 59, exp: 482500000000000 },
    { dansu: 60, exp: 512400000000000 },
    { dansu: 61, exp: 545000000000000 },
    { dansu: 62, exp: 577000000000000 },
    { dansu: 63, exp: 611000000000000 },
    { dansu: 64, exp: 646500000000000 },
    { dansu: 65, exp: 682500000000000 },
    { dansu: 66, exp: 719500000000000 },
    { dansu: 67, exp: 758500000000000 },
    { dansu: 68, exp: 798000000000000 },
    { dansu: 69, exp: 837000000000000 },
    { dansu: 70, exp: 878000000000000 },
    { dansu: 71, exp: 921000000000000 }
  ],

  init() {
    this.switchMode('required');
  },

  switchMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('#calcModeChips .chip').forEach(c => c.className = 'chip');
    const active = document.querySelector(`#calcModeChips [data-mode="${mode}"]`);
    if (active) active.className = 'chip active';
    this.renderForm();
    document.getElementById('calcResult').innerHTML = '';
  },

  // ── 빠른 입력 버튼 HTML ──
  quickBtns(id) {
    return `<div class="calc-quick-btns">
      <button type="button" class="calc-quick-btn" onclick="CalcUI.addVal('${id}',1000000)">+100만</button>
      <button type="button" class="calc-quick-btn" onclick="CalcUI.addVal('${id}',100000)">+10만</button>
      <button type="button" class="calc-quick-btn" onclick="CalcUI.addVal('${id}',10000)">+1만</button>
      <button type="button" class="calc-quick-btn" onclick="CalcUI.addVal('${id}',1000)">+천</button>
      <button type="button" class="calc-quick-btn" onclick="CalcUI.addVal('${id}',100)">+백</button>
      <button type="button" class="calc-quick-btn reset" onclick="CalcUI.resetVal('${id}')">초기화</button>
    </div>`;
  },

  addVal(id, amount) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = (parseInt(el.value) || 0) + amount;
    this.updateAutoTier();
  },

  resetVal(id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
    this.updateAutoTier();
  },

  // ── 자동 단수 표시 업데이트 ──
  updateAutoTier() {
    const tierEl = document.getElementById('calcAutoTier');
    if (!tierEl) return;
    const hp = parseInt(document.getElementById('calcHp')?.value) || 0;
    const mp = parseInt(document.getElementById('calcMp')?.value) || 0;
    if (hp === 0 && mp === 0) {
      tierEl.innerHTML = '<span>현재 단수</span><span class="tier-value">-</span>';
      return;
    }
    const exp = LodCalc.calculateTotalExp(hp, mp);
    const d = LodCalc.calculateDansu(exp, this.dansuTable);
    tierEl.innerHTML = `<span>현재 단수: <strong class="tier-value">${d.dansu}단</strong></span><span style="font-size:12px;color:var(--text-dim)">${this.formatExp(exp)}</span>`;
  },

  // ── HP/MP 입력 필드 생성 ──
  hpField(label, id, placeholder) {
    return `
      <div class="calc-field-group">
        <label class="calc-label">${label}</label>
        <div class="calc-input-wrap">
          <input type="number" id="${id}" class="calc-input hp" placeholder="${placeholder || '예: 5500000'}" min="0" oninput="CalcUI.updateAutoTier()">
          <span class="calc-unit">HP</span>
        </div>
        ${this.quickBtns(id)}
      </div>`;
  },

  mpField(label, id, placeholder) {
    return `
      <div class="calc-field-group">
        <label class="calc-label">${label}</label>
        <div class="calc-input-wrap">
          <input type="number" id="${id}" class="calc-input mp" placeholder="${placeholder || '예: 2800000'}" min="0" oninput="CalcUI.updateAutoTier()">
          <span class="calc-unit">MP</span>
        </div>
        ${this.quickBtns(id)}
      </div>`;
  },

  autoTierHtml() {
    return '<div class="calc-auto-tier" id="calcAutoTier"><span>현재 단수</span><span class="tier-value">-</span></div>';
  },

  dansuSelect(id, defaultVal) {
    return `<select id="${id}" class="calc-select">
      ${this.dansuTable.map(d => `<option value="${d.dansu}" ${d.dansu === defaultVal ? 'selected' : ''}>${d.dansu}단 (${this.formatExp(d.exp)})</option>`).join('')}
    </select>`;
  },

  renderForm() {
    const form = document.getElementById('calcForm');
    switch (this.currentMode) {
      case 'required':
        form.innerHTML = `
          ${this.hpField('현재 HP', 'calcHp')}
          ${this.mpField('현재 MP', 'calcMp')}
          ${this.autoTierHtml()}
          ${this.hpField('목표 HP', 'calcTargetHp', '비워두면 HP 변경 없음')}
          ${this.mpField('목표 MP', 'calcTargetMp', '비워두면 MP 변경 없음')}
          <div class="calc-necklace">
            <div class="calc-necklace-title">목걸이 강화 레벨 (선택)</div>
            <div class="calc-stepper">
              <button type="button" class="calc-step-btn" onclick="CalcUI.stepNecklace(-1)">-</button>
              <div class="calc-step-value" id="calcNecklace">0</div>
              <button type="button" class="calc-step-btn" onclick="CalcUI.stepNecklace(1)">+</button>
              <span class="calc-step-label">강화 보너스: <span id="calcNecklaceBonus">0%</span></span>
            </div>
          </div>
          <button class="btn-primary calc-btn" onclick="CalcUI.calcRequired()">필요 라르 계산</button>
        `;
        break;

      case 'target':
        form.innerHTML = `
          ${this.hpField('현재 HP', 'calcHp')}
          ${this.mpField('현재 MP', 'calcMp')}
          ${this.autoTierHtml()}
          <div class="calc-field-group">
            <label class="calc-label">목표 단수</label>
            ${this.dansuSelect('calcTargetDansu', 30)}
          </div>
          <div class="calc-field-group">
            <label class="calc-label">올릴 스탯</label>
            <div class="filter-chips" style="margin-top:4px">
              <button class="chip active" id="calcStatBoth" onclick="CalcUI.setStat('both',this)">HP+MP</button>
              <button class="chip" id="calcStatHp" onclick="CalcUI.setStat('hp',this)">HP만</button>
              <button class="chip" id="calcStatMp" onclick="CalcUI.setStat('mp',this)">MP만</button>
            </div>
          </div>
          <button class="btn-primary calc-btn" onclick="CalcUI.calcTarget()">필요 라르 계산</button>
        `;
        this._statChoice = 'both';
        break;

      case 'raise':
        form.innerHTML = `
          ${this.hpField('현재 HP', 'calcHp')}
          ${this.mpField('현재 MP', 'calcMp')}
          ${this.autoTierHtml()}
          <div class="calc-field-group">
            <label class="calc-label">보유 라르 수</label>
            <div class="calc-input-wrap">
              <input type="number" id="calcLahr" class="calc-input" placeholder="예: 5000" min="0">
              <span class="calc-unit">개</span>
            </div>
          </div>
          <div class="calc-field-group">
            <label class="calc-label">올릴 스탯</label>
            <div class="filter-chips" style="margin-top:4px">
              <button class="chip active" id="calcStatHp" onclick="CalcUI.setStat('hp',this)">HP</button>
              <button class="chip" id="calcStatMp" onclick="CalcUI.setStat('mp',this)">MP</button>
            </div>
          </div>
          <button class="btn-primary calc-btn" onclick="CalcUI.calcRaise()">올릴 수 있는 수치 계산</button>
        `;
        this._statChoice = 'hp';
        break;

      case 'fullexp':
        form.innerHTML = `
          ${this.hpField('HP', 'calcHp', '예: 6000000')}
          ${this.mpField('MP', 'calcMp', '예: 3000000')}
          ${this.autoTierHtml()}
          <button class="btn-primary calc-btn" onclick="CalcUI.calcFullExp()">경험치 계산</button>
        `;
        break;
    }
  },

  _statChoice: 'both',
  _necklaceLevel: 0,

  setStat(choice, el) {
    this._statChoice = choice;
    const parent = el.closest('.filter-chips');
    parent.querySelectorAll('.chip').forEach(c => c.className = 'chip');
    el.className = 'chip active';
  },

  stepNecklace(delta) {
    this._necklaceLevel = Math.max(0, Math.min(30, this._necklaceLevel + delta));
    const el = document.getElementById('calcNecklace');
    const bonusEl = document.getElementById('calcNecklaceBonus');
    if (el) el.textContent = this._necklaceLevel;
    if (bonusEl) bonusEl.textContent = this.getNecklaceBonus(this._necklaceLevel).toFixed(1) + '%';
  },

  getNecklaceBonus(level) {
    let bonus = 0;
    for (let i = 1; i <= level; i++) {
      bonus += (i % 5 === 0) ? 0.2 : 0.1;
    }
    return bonus;
  },

  // ── 계산 함수들 ──

  calcRequired() {
    const hp = parseInt(document.getElementById('calcHp').value) || 0;
    const mp = parseInt(document.getElementById('calcMp').value) || 0;
    const targetHp = parseInt(document.getElementById('calcTargetHp').value) || hp;
    const targetMp = parseInt(document.getElementById('calcTargetMp').value) || mp;

    if (hp === 0 && mp === 0) return this.showError('HP 또는 MP를 입력해주세요.');
    if (targetHp < hp && targetMp < mp) return this.showError('목표 값이 현재 값보다 커야 합니다.');

    const currentExp = LodCalc.calculateTotalExp(hp, mp);
    const targetExp = LodCalc.calculateTotalExp(targetHp, targetMp);
    const currentDansu = LodCalc.calculateDansu(currentExp, this.dansuTable);
    const targetDansu = LodCalc.calculateDansu(targetExp, this.dansuTable);
    const neededExp = Math.max(0, targetExp - currentExp);

    // 라르 수 계산: HP와 MP 각각의 증가 경로를 시뮬레이션
    let hpLahr = 0, mpLahr = 0;
    let simHp = hp;
    while (simHp < targetHp) {
      const inc = LodCalc.getHpExpIncrement(simHp);
      simHp += inc;
      hpLahr++;
    }
    let simMp = mp;
    while (simMp < targetMp) {
      const inc = LodCalc.getMpExpIncrement(simMp);
      simMp += inc;
      mpLahr++;
    }
    const totalLahr = hpLahr + mpLahr;

    // 목걸이 추뎀
    const neckBonus = this.getNecklaceBonus(this._necklaceLevel);
    const addDmg = neckBonus > 0 ? Math.floor((targetHp + targetMp * 2) * neckBonus / 100) : 0;

    let html = `
      <div class="calc-result-card">
        <div class="calc-result-title">필요 라르 계산 결과</div>
        <div class="calc-result-grid">
          <div class="calc-result-item">
            <div class="calc-result-label">HP</div>
            <div class="calc-result-value hp-color">${hp.toLocaleString()} → ${targetHp.toLocaleString()} <span style="font-size:12px;color:var(--text-dim)">(${hpLahr.toLocaleString()}개)</span></div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">MP</div>
            <div class="calc-result-value mp-color">${mp.toLocaleString()} → ${targetMp.toLocaleString()} <span style="font-size:12px;color:var(--text-dim)">(${mpLahr.toLocaleString()}개)</span></div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">단수 변화</div>
            <div class="calc-result-value accent">${currentDansu.dansu}단 → ${targetDansu.dansu}단</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">필요 경험치</div>
            <div class="calc-result-value">${this.formatExp(neededExp)}</div>
          </div>
        </div>
        <div class="calc-result-highlight">
          <span class="calc-highlight-label">총 필요 라르</span>
          <span class="calc-highlight-value">${totalLahr.toLocaleString()}개</span>
        </div>
        ${neckBonus > 0 ? `<div style="margin-top:12px;font-size:13px;color:var(--text-dim)">목걸이 +${this._necklaceLevel} (${neckBonus.toFixed(1)}%) 추가 데미지: <strong style="color:var(--accent)">${addDmg.toLocaleString()}</strong></div>` : ''}
        <div class="calc-result-note">* 정가 기준: ${(totalLahr * 10000).toLocaleString()}원 (라르 1개 = 10,000원)</div>
      </div>
    `;
    document.getElementById('calcResult').innerHTML = html;
  },

  calcTarget() {
    const hp = parseInt(document.getElementById('calcHp').value) || 0;
    const mp = parseInt(document.getElementById('calcMp').value) || 0;
    const targetDansu = parseInt(document.getElementById('calcTargetDansu').value);

    if (hp === 0 && mp === 0) return this.showError('HP 또는 MP를 입력해주세요.');

    const target = this.dansuTable.find(d => d.dansu === targetDansu);
    if (!target) return this.showError('올바른 단수를 선택해주세요.');

    const currentExp = LodCalc.calculateTotalExp(hp, mp);
    const currentDansu = LodCalc.calculateDansu(currentExp, this.dansuTable);
    const neededExp = Math.max(0, target.exp - currentExp);

    if (neededExp === 0) {
      return this.showResult(`
        <div class="calc-result-highlight" style="border-color:var(--complete)">
          <span class="calc-highlight-label">이미 ${targetDansu}단 달성!</span>
          <span class="calc-highlight-value" style="color:var(--complete)">현재 ${currentDansu.dansu}단</span>
        </div>`);
    }

    // 시뮬레이션: 필요한 라르 수 계산
    let simHp = hp, simMp = mp, lahrUsed = 0;
    const raiseHp = this._statChoice === 'both' || this._statChoice === 'hp';
    const raiseMp = this._statChoice === 'both' || this._statChoice === 'mp';

    while (LodCalc.calculateTotalExp(simHp, simMp) < target.exp && lahrUsed < 100000000) {
      if (raiseHp && raiseMp) {
        // HP 2 : MP 1 비율
        if (lahrUsed % 3 < 2) {
          simHp += LodCalc.getHpExpIncrement(simHp);
        } else {
          simMp += LodCalc.getMpExpIncrement(simMp);
        }
      } else if (raiseHp) {
        simHp += LodCalc.getHpExpIncrement(simHp);
      } else {
        simMp += LodCalc.getMpExpIncrement(simMp);
      }
      lahrUsed++;
    }

    const newExp = LodCalc.calculateTotalExp(simHp, simMp);
    const newDansu = LodCalc.calculateDansu(newExp, this.dansuTable);

    let html = `
      <div class="calc-result-card">
        <div class="calc-result-title">${targetDansu}단 달성 필요 라르</div>
        <div class="calc-result-grid">
          <div class="calc-result-item">
            <div class="calc-result-label">HP 변화</div>
            <div class="calc-result-value hp-color">${hp.toLocaleString()} → ${simHp.toLocaleString()}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">MP 변화</div>
            <div class="calc-result-value mp-color">${mp.toLocaleString()} → ${simMp.toLocaleString()}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">단수 변화</div>
            <div class="calc-result-value accent">${currentDansu.dansu}단 → ${newDansu.dansu}단</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">총 경험치</div>
            <div class="calc-result-value">${this.formatExp(newExp)}</div>
          </div>
        </div>
        <div class="calc-result-highlight">
          <span class="calc-highlight-label">필요 라르</span>
          <span class="calc-highlight-value">${lahrUsed.toLocaleString()}개</span>
        </div>
        <div class="calc-result-note">* 정가 기준: ${(lahrUsed * 10000).toLocaleString()}원 | 스탯 배분: ${raiseHp && raiseMp ? 'HP+MP (2:1)' : raiseHp ? 'HP만' : 'MP만'}</div>
      </div>
    `;
    document.getElementById('calcResult').innerHTML = html;
  },

  calcRaise() {
    const hp = parseInt(document.getElementById('calcHp').value) || 0;
    const mp = parseInt(document.getElementById('calcMp').value) || 0;
    const lahrCount = parseInt(document.getElementById('calcLahr').value) || 0;

    if (lahrCount === 0) return this.showError('보유 라르 수를 입력해주세요.');

    const currentExp = LodCalc.calculateTotalExp(hp, mp);
    const currentDansu = LodCalc.calculateDansu(currentExp, this.dansuTable);

    let simHp = hp, simMp = mp;
    if (this._statChoice === 'hp') {
      for (let i = 0; i < lahrCount; i++) {
        simHp += LodCalc.getHpExpIncrement(simHp);
      }
    } else {
      for (let i = 0; i < lahrCount; i++) {
        simMp += LodCalc.getMpExpIncrement(simMp);
      }
    }

    const newExp = LodCalc.calculateTotalExp(simHp, simMp);
    const newDansu = LodCalc.calculateDansu(newExp, this.dansuTable);
    const gainedExp = newExp - currentExp;

    const statLabel = this._statChoice === 'hp' ? 'HP' : 'MP';
    const oldVal = this._statChoice === 'hp' ? hp : mp;
    const newVal = this._statChoice === 'hp' ? simHp : simMp;
    const colorClass = this._statChoice === 'hp' ? 'hp-color' : 'mp-color';

    let html = `
      <div class="calc-result-card">
        <div class="calc-result-title">라르 ${lahrCount.toLocaleString()}개로 올릴 수 있는 수치</div>
        <div class="calc-result-grid">
          <div class="calc-result-item">
            <div class="calc-result-label">${statLabel} 변화</div>
            <div class="calc-result-value ${colorClass}">${oldVal.toLocaleString()} → ${newVal.toLocaleString()}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">${statLabel} 증가량</div>
            <div class="calc-result-value ${colorClass}">+${(newVal - oldVal).toLocaleString()}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">경험치 증가</div>
            <div class="calc-result-value">${this.formatExp(gainedExp)}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">단수 변화</div>
            <div class="calc-result-value accent">${currentDansu.dansu}단 → ${newDansu.dansu}단</div>
          </div>
        </div>
        ${newDansu.nextExp ? `<div class="calc-progress-wrap">
          <div class="calc-progress-bar"><div class="calc-progress-fill" style="width:${newDansu.progress.toFixed(1)}%"></div></div>
          <div class="calc-progress-text">다음 ${newDansu.dansu + 1}단까지 ${newDansu.progress.toFixed(1)}%</div>
        </div>` : ''}
      </div>
    `;
    document.getElementById('calcResult').innerHTML = html;
  },

  calcFullExp() {
    const hp = parseInt(document.getElementById('calcHp').value) || 0;
    const mp = parseInt(document.getElementById('calcMp').value) || 0;

    if (hp === 0 && mp === 0) return this.showError('HP 또는 MP를 입력해주세요.');

    const hpExp = LodCalc.calculateHpExp(hp);
    const mpExp = LodCalc.calculateMpExp(mp);
    const totalExp = hpExp + mpExp;
    const dansu = LodCalc.calculateDansu(totalExp, this.dansuTable);

    // HP/MP 증가량 정보
    const hpInc = LodCalc.getHpExpIncrement(hp);
    const mpInc = LodCalc.getMpExpIncrement(mp);

    let html = `
      <div class="calc-result-card">
        <div class="calc-result-title">경험치 계산 결과</div>
        <div class="calc-result-grid">
          <div class="calc-result-item">
            <div class="calc-result-label">HP 경험치</div>
            <div class="calc-result-value hp-color">${this.formatExp(hpExp)}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">MP 경험치</div>
            <div class="calc-result-value mp-color">${this.formatExp(mpExp)}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">총 경험치</div>
            <div class="calc-result-value">${this.formatExp(totalExp)}</div>
          </div>
          <div class="calc-result-item">
            <div class="calc-result-label">현재 단수</div>
            <div class="calc-result-value accent">${dansu.dansu}단</div>
          </div>
        </div>
        ${dansu.nextExp ? `<div class="calc-progress-wrap">
          <div class="calc-progress-bar"><div class="calc-progress-fill" style="width:${dansu.progress.toFixed(1)}%"></div></div>
          <div class="calc-progress-text">다음 ${dansu.dansu + 1}단까지 ${dansu.progress.toFixed(1)}% (${this.formatExp(dansu.nextExp - totalExp)} 필요)</div>
        </div>` : ''}
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-dim)">
          현재 구간 증가량: HP <strong style="color:var(--warrior)">+${hpInc}</strong>/라르, MP <strong style="color:var(--mage)">+${mpInc}</strong>/라르
        </div>
      </div>
    `;
    document.getElementById('calcResult').innerHTML = html;
  },

  // ── 유틸 ──

  formatExp(exp) {
    if (exp >= 1e12) return (exp / 1e12).toFixed(2) + '조';
    if (exp >= 1e8) return (exp / 1e8).toFixed(2) + '억';
    if (exp >= 1e4) return (exp / 1e4).toFixed(1) + '만';
    return exp.toLocaleString();
  },

  showError(msg) {
    document.getElementById('calcResult').innerHTML = `
      <div class="calc-result-card" style="border-color: var(--warrior);">
        <div style="color: var(--warrior); text-align: center; padding: 12px;">${msg}</div>
      </div>
    `;
  },

  showResult(html) {
    document.getElementById('calcResult').innerHTML = `<div class="calc-result-card">${html}</div>`;
  }
};
