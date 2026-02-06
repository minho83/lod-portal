/**
 * LOD 라르 계산기 - 핵심 계산 모듈
 * 경험치 계산 로직 (구간별 증가량 고려)
 *
 * 실측 데이터 기반:
 * - HP 600만 + MP 300만 = 54단 (342조)
 * - HP 602.5만 + MP 300만 = 57단 (422.25조)
 */
(function(window) {
    'use strict';

    // ========================================
    // HP 구간별 증가량 정의 (경험치 계산용)
    // ========================================
    const hpExpTiers = [
        { min: 0, max: 5550000, increment: 50 },        // 0 ~ 555만: 50씩
        { min: 5550000, max: 5600000, increment: 45 },  // 555만 ~ 560만: 45씩
        { min: 5600000, max: 5650000, increment: 40 },  // 560만 ~ 565만: 40씩
        { min: 5650000, max: 5700000, increment: 35 },  // 565만 ~ 570만: 35씩
        { min: 5700000, max: 5750000, increment: 30 },  // 570만 ~ 575만: 30씩
        { min: 5750000, max: 5800000, increment: 25 },  // 575만 ~ 580만: 25씩
        { min: 5800000, max: 5850000, increment: 20 },  // 580만 ~ 585만: 20씩
        { min: 5850000, max: 5900000, increment: 15 },  // 585만 ~ 590만: 15씩
        { min: 5900000, max: 5950000, increment: 10 },  // 590만 ~ 595만: 10씩
        { min: 5950000, max: 6000000, increment: 5 },   // 595만 ~ 600만: 5씩
        { min: 6000000, max: Infinity, increment: 1 }   // 600만 이상: 1씩
    ];

    // ========================================
    // MP 구간별 증가량 정의 (경험치 계산용)
    // ========================================
    const mpExpTiers = [
        { min: 0, max: 2800000, increment: 25 },        // 0 ~ 280만: 25씩
        { min: 2800000, max: 2850000, increment: 20 },  // 280만 ~ 285만: 20씩
        { min: 2850000, max: 2900000, increment: 15 },  // 285만 ~ 290만: 15씩
        { min: 2900000, max: 2950000, increment: 10 },  // 290만 ~ 295만: 10씩
        { min: 2950000, max: 3000000, increment: 5 },   // 295만 ~ 300만: 5씩
        { min: 3000000, max: Infinity, increment: 1 }   // 300만 이상: 1씩
    ];

    // ========================================
    // 헬퍼 함수: 현재 값에 해당하는 증가량 가져오기
    // ========================================
    function getHpExpIncrement(hp) {
        for (const tier of hpExpTiers) {
            if (hp >= tier.min && hp < tier.max) {
                return tier.increment;
            }
        }
        return 1; // 기본값 (600만+)
    }

    function getMpExpIncrement(mp) {
        for (const tier of mpExpTiers) {
            if (mp >= tier.min && mp < tier.max) {
                return tier.increment;
            }
        }
        return 1; // 기본값 (300만+)
    }

    // ========================================
    // HP -> 경험치 변환 (구간별 증가량 고려)
    // ========================================
    function calculateHpExp(hp) {
        if (hp <= 0) return 0;

        const BASE_INCREMENT = 50;
        let totalExp = 0;
        let currentHp = 0;

        for (const tier of hpExpTiers) {
            if (currentHp >= hp) break;

            const increment = tier.increment;
            const tierStart = Math.max(currentHp, tier.min);
            const tierEnd = Math.min(hp, tier.max);

            if (tierStart >= tierEnd) continue;

            const steps = Math.floor((tierEnd - tierStart) / increment);
            if (steps <= 0) continue;

            const actualEnd = tierStart + steps * increment;

            const baseExp = actualEnd * (actualEnd - 50) * 5 - tierStart * (tierStart - 50) * 5;
            const adjustedExp = baseExp * (BASE_INCREMENT / increment);
            totalExp += adjustedExp;

            currentHp = actualEnd;
        }

        return totalExp;
    }

    // ========================================
    // MP -> 경험치 변환 (구간별 증가량 고려)
    // ========================================
    function calculateMpExp(mp) {
        if (mp <= 0) return 0;

        const BASE_INCREMENT = 25;
        let totalExp = 0;
        let currentMp = 0;

        for (const tier of mpExpTiers) {
            if (currentMp >= mp) break;

            const increment = tier.increment;
            const tierStart = Math.max(currentMp, tier.min);
            const tierEnd = Math.min(mp, tier.max);

            if (tierStart >= tierEnd) continue;

            const steps = Math.floor((tierEnd - tierStart) / increment);
            if (steps <= 0) continue;

            const actualEnd = tierStart + steps * increment;

            const baseExp = actualEnd * (actualEnd - 25) * 10 - tierStart * (tierStart - 25) * 10;
            const adjustedExp = baseExp * (BASE_INCREMENT / increment);
            totalExp += adjustedExp;

            currentMp = actualEnd;
        }

        return totalExp;
    }

    // ========================================
    // 총 경험치 계산
    // ========================================
    function calculateTotalExp(hp, mp) {
        return calculateHpExp(hp) + calculateMpExp(mp);
    }

    // ========================================
    // 경험치로 단수 계산
    // ========================================
    function calculateDansu(totalExp, dansuTable) {
        if (!dansuTable || dansuTable.length === 0) {
            return { dansu: 6, nextExp: 0, currentExp: 0, progress: 0 };
        }

        if (totalExp < dansuTable[0].exp) {
            return {
                dansu: 6,
                nextExp: dansuTable[0].exp,
                currentExp: 0,
                progress: (totalExp / dansuTable[0].exp) * 100
            };
        }

        for (let i = dansuTable.length - 1; i >= 0; i--) {
            if (totalExp >= dansuTable[i].exp) {
                const currentDansu = dansuTable[i].dansu;
                const nextDansu = i < dansuTable.length - 1 ? dansuTable[i + 1] : null;
                const progress = nextDansu
                    ? ((totalExp - dansuTable[i].exp) / (nextDansu.exp - dansuTable[i].exp)) * 100
                    : 100;
                return {
                    dansu: currentDansu,
                    nextExp: nextDansu ? nextDansu.exp : null,
                    currentExp: dansuTable[i].exp,
                    progress: Math.min(progress, 100)
                };
            }
        }
        return { dansu: 6, nextExp: dansuTable[0].exp, currentExp: 0, progress: 0 };
    }

    // ========================================
    // 전역 객체로 노출
    // ========================================
    window.LodCalc = {
        calculateHpExp: calculateHpExp,
        calculateMpExp: calculateMpExp,
        calculateTotalExp: calculateTotalExp,
        calculateDansu: calculateDansu,
        getHpExpIncrement: getHpExpIncrement,
        getMpExpIncrement: getMpExpIncrement,
        getHpTiers: function() { return hpExpTiers.slice(); },
        getMpTiers: function() { return mpExpTiers.slice(); }
    };

})(window);
