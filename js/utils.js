const INF_EXP = 9999;
const INF_VALUE = Number.POSITIVE_INFINITY;

const Utils = {
    numAdd(a, b) {
        if (a === INF_VALUE || b === INF_VALUE) return INF_VALUE;
        return a + b;
    },
    numSub(a, b) {
        if (a === INF_VALUE) return INF_VALUE;
        if (b === INF_VALUE) return -INF_VALUE;
        return a - b;
    },
    numMul(a, b) {
        if ((a === INF_VALUE && b !== 0) || (b === INF_VALUE && a !== 0)) return INF_VALUE;
        return a * b;
    },
    numDiv(a, b) {
        if (a === INF_VALUE && b !== INF_VALUE && b !== 0) return INF_VALUE;
        if (b === 0) return 0;
        return a / b;
    },
    numFormat(n) {
        if (n === INF_VALUE || n > 1e300) return '1.00e' + INF_EXP;
        if (n === 0) return '0.00e0';
        if (n < 0.01 && n > 0) n = 0;
        const absN = Math.abs(n);
        if (!isFinite(absN)) return '1.00e' + INF_EXP;
        const exp = Math.floor(Math.log10(absN));
        const mantissa = n / Math.pow(10, exp);
        return mantissa.toFixed(2) + 'e' + exp;
    },
    canAfford(current, cost) {
        if (current === INF_VALUE) return true;
        return current >= cost;
    },
    createInf() {
        return INF_VALUE;
    },
    isInf(n) {
        return n === INF_VALUE || !isFinite(n);
    },
    saveGame(data) {
        const saveData = { ...data };
        ['gold','yuanbao','huangjin','material'].forEach(k => {
            if (saveData[k] === INF_VALUE) saveData[k] = '__INF__';
        });
        localStorage.setItem('leiting_legend_save', JSON.stringify(saveData));
    },
    loadGame() {
        const save = localStorage.getItem('leiting_legend_save');
        if (!save) return null;
        try {
            const data = JSON.parse(save);
            ['gold','yuanbao','huangjin','material'].forEach(k => {
                if (data[k] === '__INF__') data[k] = INF_VALUE;
            });
            return data;
        } catch(e) {
            return null;
        }
    },
    clearSave() {
        localStorage.removeItem('leiting_legend_save');
    },
    todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    }
};
