class BigNum {
    constructor(mantissa, exp) {
        if (mantissa === 0) {
            this.m = 0;
            this.e = 0;
        } else {
            this.m = mantissa;
            this.e = exp;
            this.normalize();
        }
    }

    static fromNumber(n) {
        if (n === 0) return new BigNum(0, 0);
        if (n < 0) return BigNum.fromNumber(-n).neg();
        const e = Math.floor(Math.log10(n));
        const m = n / Math.pow(10, e);
        return new BigNum(m, e);
    }

    static fromString(str) {
        if (!str) return new BigNum(0, 0);
        str = str.trim();
        if (str.includes('e')) {
            const parts = str.toLowerCase().split('e');
            return new BigNum(parseFloat(parts[0]), parseInt(parts[1]));
        }
        return BigNum.fromNumber(parseFloat(str));
    }

    static fromExp(exp) {
        return new BigNum(1, exp);
    }

    static zero() {
        return new BigNum(0, 0);
    }

    static one() {
        return new BigNum(1, 0);
    }

    normalize() {
        if (this.m === 0) {
            this.e = 0;
            return this;
        }
        while (this.m >= 10) {
            this.m /= 10;
            this.e += 1;
        }
        while (this.m < 1 && this.m > 0) {
            this.m *= 10;
            this.e -= 1;
        }
        return this;
    }

    clone() {
        return new BigNum(this.m, this.e);
    }

    neg() {
        return new BigNum(-this.m, this.e);
    }

    abs() {
        return new BigNum(Math.abs(this.m), this.e);
    }

    add(other) {
        if (!(other instanceof BigNum)) other = BigNum.fromNumber(other);
        if (this.m === 0) return other.clone();
        if (other.m === 0) return this.clone();
        if (this.e >= other.e) {
            const diff = this.e - other.e;
            const om = other.m / Math.pow(10, diff);
            return new BigNum(this.m + om, this.e);
        } else {
            const diff = other.e - this.e;
            const tm = this.m / Math.pow(10, diff);
            return new BigNum(tm + other.m, other.e);
        }
    }

    sub(other) {
        if (!(other instanceof BigNum)) other = BigNum.fromNumber(other);
        return this.add(other.neg());
    }

    mul(other) {
        if (!(other instanceof BigNum)) other = BigNum.fromNumber(other);
        if (this.m === 0 || other.m === 0) return BigNum.zero();
        return new BigNum(this.m * other.m, this.e + other.e);
    }

    div(other) {
        if (!(other instanceof BigNum)) other = BigNum.fromNumber(other);
        if (other.m === 0) return BigNum.zero();
        if (this.m === 0) return BigNum.zero();
        return new BigNum(this.m / other.m, this.e - other.e);
    }

    pow(n) {
        if (n === 0) return BigNum.one();
        if (n === 1) return this.clone();
        if (n < 0) return BigNum.one().div(this.pow(-n));
        let result = BigNum.one();
        let base = this.clone();
        let exp = n;
        while (exp > 0) {
            if (exp % 2 === 1) result = result.mul(base);
            base = base.mul(base);
            exp = Math.floor(exp / 2);
        }
        return result;
    }

    pow10(exp) {
        return new BigNum(this.m, this.e + exp);
    }

    cmp(other) {
        if (!(other instanceof BigNum)) other = BigNum.fromNumber(other);
        if (this.m === 0 && other.m === 0) return 0;
        if (this.m === 0) return other.m > 0 ? -1 : 1;
        if (other.m === 0) return this.m > 0 ? 1 : -1;
        const thisNeg = this.m < 0;
        const otherNeg = other.m < 0;
        if (thisNeg && !otherNeg) return -1;
        if (!thisNeg && otherNeg) return 1;
        const sign = thisNeg ? -1 : 1;
        if (this.e > other.e) return sign;
        if (this.e < other.e) return -sign;
        if (this.m > other.m) return sign;
        if (this.m < other.m) return -sign;
        return 0;
    }

    eq(other) { return this.cmp(other) === 0; }
    lt(other) { return this.cmp(other) < 0; }
    lte(other) { return this.cmp(other) <= 0; }
    gt(other) { return this.cmp(other) > 0; }
    gte(other) { return this.cmp(other) >= 0; }

    isZero() { return this.m === 0; }

    floor() {
        if (this.e < 0) return BigNum.zero();
        if (this.e >= 15) return this.clone();
        const num = Math.floor(this.m * Math.pow(10, this.e));
        return BigNum.fromNumber(num);
    }

    ceil() {
        if (this.e < 0) return BigNum.one();
        return this.clone();
    }

    toNumber() {
        if (this.m === 0) return 0;
        if (this.e > 308) return Number.POSITIVE_INFINITY;
        if (this.e < -308) return 0;
        return this.m * Math.pow(10, this.e);
    }

    toJSON() {
        if (this.e >= 15) {
            return { __bignum__: true, m: this.m, e: this.e };
        }
        return this.toNumber();
    }

    toString() {
        if (this.m === 0) return '0.00e0';
        return this.m.toFixed(2) + 'e' + this.e;
    }

    toLocaleString() {
        return this.toString();
    }
}

BigNum.fromJSON = function(obj) {
    if (obj && obj.__bignum__) return new BigNum(obj.m, obj.e);
    if (typeof obj === 'number') return BigNum.fromNumber(obj);
    if (typeof obj === 'string') return BigNum.fromString(obj);
    return BigNum.zero();
};

const Utils = {
    bn(val, exp) {
        if (val instanceof BigNum) return val;
        if (typeof exp === 'number') return new BigNum(val, exp);
        if (typeof val === 'number') return BigNum.fromNumber(val);
        if (typeof val === 'string' && val.includes('e')) return BigNum.fromString(val);
        if (typeof val === 'string') return BigNum.fromNumber(parseFloat(val) || 0);
        return BigNum.zero();
    },

    numAdd(a, b) { return this.bn(a).add(this.bn(b)); },
    numSub(a, b) { return this.bn(a).sub(this.bn(b)); },
    numMul(a, b) { return this.bn(a).mul(this.bn(b)); },
    numDiv(a, b) { return this.bn(a).div(this.bn(b)); },

    numFormat(n) {
        return this.bn(n).toString();
    },

    canAfford(current, cost) {
        return this.bn(current).gte(this.bn(cost));
    },

    saveGame(data) {
        const saveData = {};
        for (const k in data) {
            if (data[k] instanceof BigNum) {
                saveData[k] = data[k].toJSON();
            } else if (k === 'battleLog') {
                saveData[k] = data[k];
            } else if (Array.isArray(data[k])) {
                saveData[k] = data[k].map(v => v instanceof BigNum ? v.toJSON() : v);
            } else if (typeof data[k] === 'object' && data[k] !== null) {
                saveData[k] = data[k];
            } else {
                saveData[k] = data[k];
            }
        }
        localStorage.setItem('leiting_legend_save', JSON.stringify(saveData));
    },

    loadGame() {
        const save = localStorage.getItem('leiting_legend_save');
        if (!save) return null;
        try {
            const data = JSON.parse(save);
            const bnFields = ['gold','yuanbao','huangjin','material','hp','maxHp','atk','def','power','exp'];
            bnFields.forEach(k => {
                if (data[k] !== undefined) data[k] = BigNum.fromJSON(data[k]);
            });
            ['equipEnhance','equipStar'].forEach(k => {
                if (data[k] !== undefined && typeof data[k] === 'object' && data[k].__bignum__) {
                    data[k] = Math.floor(data[k].m * Math.pow(10, data[k].e));
                }
            });
            return data;
        } catch(e) {
            console.error('Load error:', e);
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
