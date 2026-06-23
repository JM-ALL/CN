const Utils = {
    numAdd(a, b) {
        return a + b;
    },
    numSub(a, b) {
        return a - b;
    },
    numMul(a, b) {
        return a * b;
    },
    numDiv(a, b) {
        return b === 0 ? 0 : a / b;
    },
    numFormat(n) {
        if (n === 0) return '0.00e0';
        if (n < 0.01 && n > 0) n = 0;
        const absN = Math.abs(n);
        const exp = Math.floor(Math.log10(absN));
        const mantissa = n / Math.pow(10, exp);
        return mantissa.toFixed(2) + 'e' + exp;
    },
    canAfford(current, cost) {
        return current >= cost;
    },
    saveGame(data) {
        localStorage.setItem('leiting_legend_save', JSON.stringify(data));
    },
    loadGame() {
        const save = localStorage.getItem('leiting_legend_save');
        return save ? JSON.parse(save) : null;
    },
    clearSave() {
        localStorage.removeItem('leiting_legend_save');
    },
    todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    }
};
