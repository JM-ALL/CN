# 雷霆传奇 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个完整的网页版H5单机挂机游戏"雷霆传奇"，包含自动战斗、装备养成、福利商城等核心系统。

**Architecture:** 单页面HTML应用，原生JS无框架依赖，分模块组织代码（utils工具、data配置、battle战斗、game主逻辑），LocalStorage持久化存档。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, LocalStorage

---

## 文件结构概览

```
/workspace/
├── index.html              # 主页面 - 游戏UI骨架
├── css/
│   └── style.css           # 游戏样式
├── js/
│   ├── utils.js            # 科学记数法工具、存档工具
│   ├── data.js             # 游戏配置数据
│   ├── battle.js           # 战斗系统逻辑
│   └── game.js             # 游戏主逻辑、UI更新、面板系统
└── docs/
    └── superpowers/
        ├── specs/2026-06-23-leiting-legend-design.md
        └── plans/2026-06-23-leiting-legend-plan.md (this file)
```

---

## Task 1: 项目初始化与工具函数

**Files:**
- Create: `/workspace/js/utils.js`
- Create: `/workspace/css/style.css`
- Create: `/workspace/index.html` (骨架)

- [ ] **Step 1: 创建项目目录结构**

Run:
```bash
mkdir -p /workspace/css /workspace/js
```

- [ ] **Step 2: 实现科学记数法工具函数**

Create `/workspace/js/utils.js`:
```javascript
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
        const exp = Math.floor(Math.log10(Math.abs(n)));
        const mantissa = n / Math.pow(10, exp);
        return mantissa.toFixed(2) + 'e' + exp;
    },
    parseSci(str) {
        if (typeof str === 'number') return str;
        const match = str.match(/^([\d.]+)e([+-]?\d+)$/);
        if (match) {
            return parseFloat(match[1]) * Math.pow(10, parseInt(match[2]));
        }
        return parseFloat(str) || 0;
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
```

- [ ] **Step 3: 创建基础CSS样式文件**

Create `/workspace/css/style.css`:
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Microsoft YaHei', sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #eee;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.game-container {
    width: 480px;
    height: 800px;
    background: #0f0f1a;
    border: 2px solid #ffd700;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}
```

- [ ] **Step 4: 创建HTML骨架**

Create `/workspace/index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>雷霆传奇</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="game-container">
        <div class="top-bar" id="topBar"></div>
        <div class="tab-bar" id="tabBar"></div>
        <div class="tab-content" id="tabContent"></div>
        <div class="battle-area" id="battleArea"></div>
        <div class="bottom-bar" id="bottomBar"></div>
    </div>
    <div class="modal-overlay" id="modalOverlay" style="display: none;">
        <div class="modal" id="modal"></div>
    </div>
    <script src="js/utils.js"></script>
    <script src="js/data.js"></script>
    <script src="js/battle.js"></script>
    <script src="js/game.js"></script>
</body>
</html>
```

- [ ] **Step 5: 验证文件创建成功**

Run: `ls -la /workspace/ /workspace/css/ /workspace/js/`
Expected: 三个文件都已创建

- [ ] **Step 6: Commit**

```bash
cd /workspace && git init && git add -A && git commit -m "feat: project init with utils functions and base structure"
```

---

## Task 2: 游戏配置数据

**Files:**
- Create: `/workspace/js/data.js`

- [ ] **Step 1: 实现游戏配置数据**

Create `/workspace/js/data.js`:
```javascript
const GameData = {
    player: {
        initLevel: 1,
        initHp: 100,
        initAtk: 10,
        initDef: 5,
        perLevelHp: 50,
        perLevelAtk: 5,
        perLevelDef: 2
    },
    equip: {
        baseHp: 100,
        baseAtk: 10,
        baseDef: 5,
        quality: '永恒',
        qualityColor: '#ff8c00',
        maxEnhance: 1e10,
        maxStar: 1e10,
        enhanceCostGoldBase: 10,
        enhanceCostGoldGrowth: 1.1,
        starCostYuanbaoBase: 5,
        starCostYuanbaoGrowth: 1.2
    },
    monsters: [
        { level: 1, name: '小鸡', hp: 50, atk: 5, def: 2, goldDrop: 10, isBoss: false },
        { level: 5, name: '鹿', hp: 200, atk: 15, def: 8, goldDrop: 50, isBoss: false },
        { level: 10, name: '稻草人', hp: 800, atk: 40, def: 20, goldDrop: 200, isBoss: false },
        { level: 20, name: '骷髅', hp: 3000, atk: 100, def: 50, goldDrop: 800, isBoss: false },
        { level: 50, name: '沃玛战士', hp: 20000, atk: 500, def: 200, goldDrop: 5000, isBoss: false },
        { level: 100, name: '祖玛卫士', hp: 100000, atk: 2000, def: 800, goldDrop: 20000, isBoss: false }
    ],
    bosses: [
        { level: 10, name: '鸡王', hp: 2000, atk: 80, def: 30, yuanbaoDrop: 5, isBoss: true, killReq: 20 },
        { level: 50, name: '骷髅精灵', hp: 50000, atk: 800, def: 300, yuanbaoDrop: 50, isBoss: true, killReq: 50 },
        { level: 100, name: '沃玛教主', hp: 500000, atk: 3000, def: 1200, yuanbaoDrop: 200, isBoss: true, killReq: 100 }
    ],
    shop: [
        { id: 'gift_pack', name: '万能礼包', icon: '🎁', price: 100, desc: '使用后获得1e4万能材料' }
    ],
    welfare: {
        signInRewards: [
            { day: 1, gold: 100, yuanbao: 0, material: 0, giftPack: 0 },
            { day: 2, gold: 200, yuanbao: 5, material: 0, giftPack: 0 },
            { day: 3, gold: 500, yuanbao: 10, material: 100, giftPack: 1 },
            { day: 7, gold: 2000, yuanbao: 50, material: 500, giftPack: 5 }
        ],
        permanentCard: { price: 1000, goldDaily: 1000, yuanbaoDaily: 20, materialDaily: 100 },
        supremeCard: { price: 5000, goldDaily: 5000, yuanbaoDaily: 100, materialDaily: 500, giftPackDaily: 1 },
        giftCodes: {
            'VIP666': { gold: 1000, yuanbao: 100, huangjin: 500, giftPack: 5 },
            'VIP888': { gold: 5000, yuanbao: 500, huangjin: 2000, giftPack: 20 },
            'LEITING': { gold: 10000, yuanbao: 1000, huangjin: 5000, giftPack: 50 }
        }
    },
    battle: {
        attackInterval: 1000
    }
};
```

- [ ] **Step 2: 验证数据文件正确**

Run: `node -e "console.log('monsters:', GameData.monsters.length)" （在浏览器中后续验证）`

- [ ] **Step 3: Commit**

```bash
cd /workspace && git add js/data.js && git commit -m "feat: add game configuration data"
```

---

## Task 3: 游戏状态初始化

**Files:**
- Modify: `/workspace/js/game.js` (Create)

- [ ] **Step 1: 创建游戏状态和初始化逻辑**

Create `/workspace/js/game.js`:
```javascript
let Game = {
    state: null,
    currentTab: 'welfare',
    currentModal: null,
    battleTimer: null,
    currentMonster: null,
    killCount: 0,

    init() {
        this.loadState();
        this.selectMonster();
        this.renderAll();
        this.startBattle();
        this.startAutoSave();
    },

    getInitialState() {
        return {
            level: GameData.player.initLevel,
            exp: 0,
            hp: GameData.player.initHp,
            maxHp: GameData.player.initHp,
            atk: GameData.player.initAtk,
            def: GameData.player.initDef,
            gold: 0,
            yuanbao: 0,
            huangjin: 0,
            material: 0,
            giftPack: 1,
            equipEnhance: 1,
            equipStar: 1,
            signInLastDate: null,
            signInDays: 0,
            hasPermanentCard: false,
            hasSupremeCard: false,
            usedGiftCodes: [],
            lastCardClaimDate: null,
            battleLog: []
        };
    },

    loadState() {
        const saved = Utils.loadGame();
        if (saved) {
            this.state = { ...this.getInitialState(), ...saved };
        } else {
            this.state = this.getInitialState();
        }
        this.recalcStats();
    },

    saveState() {
        Utils.saveGame(this.state);
    },

    recalcStats() {
        const s = this.state;
        const e = GameData.equip;
        
        const levelHp = s.level * GameData.player.perLevelHp;
        const levelAtk = s.level * GameData.player.perLevelAtk;
        const levelDef = s.level * GameData.player.perLevelDef;
        
        const equipHp = e.baseHp * s.equipEnhance * s.equipStar;
        const equipAtk = e.baseAtk * s.equipEnhance * s.equipStar;
        const equipDef = e.baseDef * s.equipEnhance * s.equipStar;
        
        s.maxHp = levelHp + equipHp;
        s.atk = levelAtk + equipAtk;
        s.def = levelDef + equipDef;
        s.power = s.maxHp + s.atk * 10 + s.def * 5;
        
        if (s.hp > s.maxHp) s.hp = s.maxHp;
    },

    addLog(msg) {
        this.state.battleLog.unshift(msg);
        if (this.state.battleLog.length > 5) {
            this.state.battleLog.pop();
        }
    },

    startAutoSave() {
        setInterval(() => this.saveState(), 10000);
    },

    renderAll() {
        this.renderTopBar();
        this.renderTabBar();
        this.renderTabContent();
        this.renderBattleArea();
        this.renderBottomBar();
    }
};

window.addEventListener('load', () => Game.init());
```

- [ ] **Step 2: Commit**

```bash
cd /workspace && git add js/game.js && git commit -m "feat: add game state and initialization logic"
```

---

## Task 4: 顶部状态栏UI

**Files:**
- Modify: `/workspace/js/game.js`
- Modify: `/workspace/css/style.css`

- [ ] **Step 1: 添加renderTopBar方法到Game对象**

在Game对象中添加renderTopBar方法（在renderAll之前插入）：

```javascript
    renderTopBar() {
        const s = this.state;
        const topBar = document.getElementById('topBar');
        topBar.className = 'top-bar';
        topBar.innerHTML = `
            <div class="stat-item"><span class="stat-icon">⚔️</span> ${Utils.numFormat(s.power)}</div>
            <div class="stat-item"><span class="stat-icon">💰</span> ${Utils.numFormat(s.gold)}</div>
            <div class="stat-item"><span class="stat-icon">💎</span> ${Utils.numFormat(s.yuanbao)}</div>
            <div class="stat-item"><span class="stat-icon">🏆</span> ${Utils.numFormat(s.huangjin)}</div>
        `;
    },
```

- [ ] **Step 2: 添加顶部状态栏CSS样式**

在style.css末尾追加：

```css
.top-bar {
    height: 60px;
    background: linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%);
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-bottom: 1px solid #ffd700;
    padding: 0 10px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: bold;
}

.stat-icon {
    font-size: 16px;
}
```

- [ ] **Step 3: Commit**

```bash
cd /workspace && git add js/game.js css/style.css && git commit -m "feat: implement top status bar UI"
```

---

## Task 5: 标签栏与标签内容区域

**Files:**
- Modify: `/workspace/js/game.js`
- Modify: `/workspace/css/style.css`

- [ ] **Step 1: 添加标签栏渲染和切换逻辑**

在game.js中添加renderTabBar、switchTab、renderTabContent方法：

```javascript
    renderTabBar() {
        const tabBar = document.getElementById('tabBar');
        tabBar.className = 'tab-bar';
        tabBar.innerHTML = `
            <button class="tab-btn ${this.currentTab === 'welfare' ? 'active' : ''}" onclick="Game.switchTab('welfare')">福利</button>
            <button class="tab-btn ${this.currentTab === 'shop' ? 'active' : ''}" onclick="Game.switchTab('shop')">商城</button>
        `;
    },

    switchTab(tab) {
        this.currentTab = tab;
        this.renderTabBar();
        this.renderTabContent();
    },

    renderTabContent() {
        const content = document.getElementById('tabContent');
        content.className = 'tab-content';
        if (this.currentTab === 'welfare') {
            this.renderWelfareTab(content);
        } else {
            this.renderShopTab(content);
        }
    },

    renderWelfareTab(container) {
        container.innerHTML = '<div style="padding:10px;text-align:center;color:#888;">福利系统开发中...</div>';
    },

    renderShopTab(container) {
        container.innerHTML = '<div style="padding:10px;text-align:center;color:#888;">商城系统开发中...</div>';
    },
```

- [ ] **Step 2: 添加标签栏CSS**

在style.css末尾追加：

```css
.tab-bar {
    height: 40px;
    background: #1a1a2e;
    display: flex;
    border-bottom: 1px solid #444;
}

.tab-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: #aaa;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
}

.tab-btn.active {
    color: #ffd700;
    border-bottom-color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
}

.tab-content {
    height: 180px;
    background: #16162a;
    overflow-y: auto;
    padding: 10px;
}
```

- [ ] **Step 3: Commit**

```bash
cd /workspace && git add js/game.js css/style.css && git commit -m "feat: implement tab bar and tab content area"
```

---

## Task 6: 底部状态栏

**Files:**
- Modify: `/workspace/js/game.js`
- Modify: `/workspace/css/style.css`

- [ ] **Step 1: 添加底部栏和人物/背包面板逻辑**

在game.js中添加：

```javascript
    renderBottomBar() {
        const bar = document.getElementById('bottomBar');
        bar.className = 'bottom-bar';
        bar.innerHTML = `
            <button class="bottom-btn" onclick="Game.openModal('player')">👤 人物</button>
            <button class="bottom-btn" onclick="Game.openModal('bag')">🎒 背包</button>
        `;
    },

    openModal(type) {
        this.currentModal = type;
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modal');
        overlay.style.display = 'flex';
        
        if (type === 'player') {
            this.renderPlayerModal(modal);
        } else if (type === 'bag') {
            this.renderBagModal(modal);
        }
    },

    closeModal() {
        this.currentModal = null;
        document.getElementById('modalOverlay').style.display = 'none';
    },

    renderPlayerModal(modal) {
        const s = this.state;
        const e = GameData.equip;
        const enhanceCostGold = Math.floor(e.enhanceCostGoldBase * Math.pow(e.enhanceCostGoldGrowth, s.equipEnhance - 1));
        const starCostYuanbao = Math.floor(e.starCostYuanbaoBase * Math.pow(e.starCostYuanbaoGrowth, s.equipStar - 1));
        
        modal.innerHTML = `
            <div class="modal-header">
                <span>人物信息</span>
                <button class="close-btn" onclick="Game.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="font-size:18px;color:#ffd700;">Lv.${Utils.numFormat(s.level)}</div>
                    <div style="margin-top:5px;">经验: ${Utils.numFormat(s.exp)}</div>
                </div>
                <div style="margin-bottom:15px;">
                    <div style="color:#ff8c00;font-weight:bold;margin-bottom:8px;">⚔️ ${e.quality}套装</div>
                    <div style="font-size:13px;color:#ccc;">强化: +${Utils.numFormat(s.equipEnhance)} | 升星: ★${Utils.numFormat(s.equipStar)}</div>
                </div>
                <div style="margin-bottom:15px;">
                    <div>❤️ 生命: ${Utils.numFormat(s.maxHp)}</div>
                    <div>⚔️ 攻击: ${Utils.numFormat(s.atk)}</div>
                    <div>🛡️ 防御: ${Utils.numFormat(s.def)}</div>
                    <div style="color:#ffd700;margin-top:5px;">🔥 战力: ${Utils.numFormat(s.power)}</div>
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="action-btn" onclick="Game.doEnhance()" style="flex:1;">
                        强化<br><span style="font-size:11px;">💰${Utils.numFormat(enhanceCostGold)} + ⚙️1</span>
                    </button>
                    <button class="action-btn" onclick="Game.doStar()" style="flex:1;">
                        升星<br><span style="font-size:11px;">💎${Utils.numFormat(starCostYuanbao)} + ⚙️1</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderBagModal(modal) {
        const s = this.state;
        modal.innerHTML = `
            <div class="modal-header">
                <span>背包</span>
                <button class="close-btn" onclick="Game.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:10px;">⚙️ 万能材料: ${Utils.numFormat(s.material)}</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:15px;">
                    <div class="bag-item" onclick="Game.useGiftPack()">
                        <div style="font-size:32px;">🎁</div>
                        <div style="font-size:12px;">万能礼包</div>
                        <div style="color:#ffd700;font-size:12px;">x${Utils.numFormat(s.giftPack)}</div>
                        <button class="use-btn">使用</button>
                    </div>
                </div>
            </div>
        `;
    },

    doEnhance() {
        const s = this.state;
        const e = GameData.equip;
        if (s.equipEnhance >= e.maxEnhance) {
            this.addLog('强化已达上限！');
            return;
        }
        const costGold = Math.floor(e.enhanceCostGoldBase * Math.pow(e.enhanceCostGoldGrowth, s.equipEnhance - 1));
        if (s.gold < costGold) {
            this.addLog('金币不足！');
            return;
        }
        if (s.material < 1) {
            this.addLog('万能材料不足！');
            return;
        }
        s.gold -= costGold;
        s.material -= 1;
        s.equipEnhance += 1;
        this.recalcStats();
        this.addLog(`强化成功！当前+${Utils.numFormat(s.equipEnhance)}`);
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'player') this.openModal('player');
    },

    doStar() {
        const s = this.state;
        const e = GameData.equip;
        if (s.equipStar >= e.maxStar) {
            this.addLog('升星已达上限！');
            return;
        }
        const costYuanbao = Math.floor(e.starCostYuanbaoBase * Math.pow(e.starCostYuanbaoGrowth, s.equipStar - 1));
        if (s.yuanbao < costYuanbao) {
            this.addLog('元宝不足！');
            return;
        }
        if (s.material < 1) {
            this.addLog('万能材料不足！');
            return;
        }
        s.yuanbao -= costYuanbao;
        s.material -= 1;
        s.equipStar += 1;
        this.recalcStats();
        this.addLog(`升星成功！当前★${Utils.numFormat(s.equipStar)}`);
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'player') this.openModal('player');
    },

    useGiftPack() {
        const s = this.state;
        if (s.giftPack < 1) {
            this.addLog('没有万能礼包！');
            return;
        }
        s.giftPack -= 1;
        s.material += 10000;
        this.addLog('使用万能礼包，获得1e4万能材料！');
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'bag') this.openModal('bag');
    },
```

- [ ] **Step 2: 添加底部栏和弹窗CSS**

在style.css末尾追加：

```css
.bottom-bar {
    height: 60px;
    background: linear-gradient(0deg, #2a2a4a 0%, #1a1a2e 100%);
    display: flex;
    border-top: 1px solid #ffd700;
}

.bottom-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: #eee;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.bottom-btn:hover {
    background: rgba(255, 215, 0, 0.1);
    color: #ffd700;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    width: 400px;
    background: #1a1a2e;
    border: 2px solid #ffd700;
    border-radius: 8px;
    max-height: 500px;
    overflow-y: auto;
}

.modal-header {
    height: 45px;
    background: linear-gradient(180deg, #3a3a5a 0%, #2a2a4a 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    font-weight: bold;
    color: #ffd700;
    border-bottom: 1px solid #ffd700;
}

.close-btn {
    width: 30px;
    height: 30px;
    background: transparent;
    border: none;
    color: #aaa;
    font-size: 18px;
    cursor: pointer;
}

.close-btn:hover {
    color: #ff4444;
}

.modal-body {
    padding: 15px;
}

.action-btn {
    background: linear-gradient(180deg, #ff8c00 0%, #cc6600 100%);
    border: 1px solid #ffaa00;
    border-radius: 4px;
    color: white;
    padding: 10px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
}

.action-btn:hover {
    background: linear-gradient(180deg, #ffaa00 0%, #ff8c00 100%);
}

.bag-item {
    background: #252540;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 10px;
    text-align: center;
    cursor: pointer;
}

.bag-item:hover {
    border-color: #ffd700;
}

.use-btn {
    margin-top: 5px;
    background: #4CAF50;
    border: none;
    color: white;
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 11px;
    cursor: pointer;
}
```

- [ ] **Step 3: 为modal-overlay添加点击关闭**

在index.html的body末尾添加（script标签之前）：
```html
    <script>
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) Game.closeModal();
        });
    </script>
```
（注：可直接在game.js init中绑定，简化方案：在Game.init末尾添加）

在Game.init()开头第一行添加：
```javascript
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') this.closeModal();
        });
```

- [ ] **Step 4: Commit**

```bash
cd /workspace && git add js/game.js css/style.css && git commit -m "feat: implement bottom bar, player panel, and bag panel"
```

---

## Task 7: 战斗系统核心逻辑

**Files:**
- Create: `/workspace/js/battle.js`
- Modify: `/workspace/js/game.js`

- [ ] **Step 1: 实现战斗系统模块**

Create `/workspace/js/battle.js`:
```javascript
const Battle = {
    selectMonster(game) {
        const s = game.state;
        let availableMonsters = GameData.monsters.filter(m => m.level <= s.level + 5);
        if (availableMonsters.length === 0) {
            availableMonsters = [GameData.monsters[0]];
        }
        
        if (game.killCount > 0 && game.killCount % 20 === 0) {
            const bosses = GameData.bosses.filter(b => b.level <= s.level + 10);
            if (bosses.length > 0) {
                const boss = bosses[bosses.length - 1];
                game.currentMonster = {
                    ...boss,
                    currentHp: boss.hp
                };
                game.addLog(`⚠️ ${boss.name}出现了！`);
                return;
            }
        }
        
        const monster = availableMonsters[availableMonsters.length - 1];
        game.currentMonster = {
            ...monster,
            currentHp: monster.hp
        };
    },

    doAttack(game) {
        const s = game.state;
        const m = game.currentMonster;
        if (!m) return;

        const playerDmg = Math.max(1, Math.floor(s.atk - m.def * 0.5));
        m.currentHp -= playerDmg;
        game.addLog(`你对${m.name}造成 ${Utils.numFormat(playerDmg)} 伤害`);

        if (m.currentHp <= 0) {
            this.onMonsterDeath(game);
            return;
        }

        const monsterDmg = Math.max(1, Math.floor(m.atk - s.def * 0.5));
        s.hp -= monsterDmg;
        game.addLog(`${m.name}对你造成 ${Utils.numFormat(monsterDmg)} 伤害`);

        if (s.hp <= 0) {
            s.hp = s.maxHp;
            game.addLog('你被击败了，满血复活！');
            this.selectMonster(game);
        }
    },

    onMonsterDeath(game) {
        const s = game.state;
        const m = game.currentMonster;
        
        s.exp += m.level;
        const expNeeded = s.level * 10;
        if (s.exp >= expNeeded) {
            s.level += 1;
            s.exp -= expNeeded;
            game.recalcStats();
            s.hp = s.maxHp;
            game.addLog(`🎉 升级！当前等级 ${Utils.numFormat(s.level)}`);
        }

        if (m.isBoss) {
            s.yuanbao += m.yuanbaoDrop;
            game.addLog(`💎 击败${m.name}，获得 ${Utils.numFormat(m.yuanbaoDrop)} 元宝！`);
        } else {
            s.gold += m.goldDrop;
            game.addLog(`💰 击败${m.name}，获得 ${Utils.numFormat(m.goldDrop)} 金币！`);
        }

        game.killCount++;
        game.saveState();
        this.selectMonster(game);
    }
};
```

- [ ] **Step 2: 将战斗逻辑接入Game**

修改game.js中的selectMonster、startBattle方法（替换原有空方法）：

```javascript
    selectMonster() {
        Battle.selectMonster(this);
    },

    startBattle() {
        if (this.battleTimer) clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => {
            Battle.doAttack(this);
            this.renderAll();
        }, GameData.battle.attackInterval);
    },
```

- [ ] **Step 3: Commit**

```bash
cd /workspace && git add js/battle.js js/game.js && git commit -m "feat: implement core battle system"
```

---

## Task 8: 战斗区域UI

**Files:**
- Modify: `/workspace/js/game.js`
- Modify: `/workspace/css/style.css`

- [ ] **Step 1: 添加renderBattleArea方法**

在Game对象中添加：

```javascript
    renderBattleArea() {
        const s = this.state;
        const m = this.currentMonster;
        const area = document.getElementById('battleArea');
        area.className = 'battle-area';
        
        const playerHpPercent = (s.hp / s.maxHp) * 100;
        const monsterHpPercent = m ? (m.currentHp / m.hp) * 100 : 100;
        const mName = m ? m.name : '寻找怪物中...';
        const mIsBoss = m && m.isBoss;

        area.innerHTML = `
            <div class="battle-stage">
                <div class="combatant player">
                    <div class="char-icon">🧙</div>
                    <div class="char-name">Lv.${Utils.numFormat(s.level)}</div>
                    <div class="hp-bar">
                        <div class="hp-fill" style="width:${playerHpPercent}%"></div>
                        <div class="hp-text">${Utils.numFormat(Math.floor(s.hp))}/${Utils.numFormat(s.maxHp)}</div>
                    </div>
                </div>
                <div class="vs-text">VS</div>
                <div class="combatant monster ${mIsBoss ? 'boss' : ''}">
                    <div class="char-icon">${mIsBoss ? '👹' : '👾'}</div>
                    <div class="char-name" style="${mIsBoss ? 'color:#ff4444;' : ''}">${mName}${mIsBoss ? ' [BOSS]' : ''}</div>
                    <div class="hp-bar">
                        <div class="hp-fill ${mIsBoss ? 'boss-hp' : ''}" style="width:${monsterHpPercent}%"></div>
                        <div class="hp-text">${m ? Utils.numFormat(Math.floor(m.currentHp)) : '0'}/${m ? Utils.numFormat(m.hp) : '0'}</div>
                    </div>
                </div>
            </div>
            <div class="battle-log">
                ${this.state.battleLog.map(log => `<div class="log-line">${log}</div>`).join('')}
            </div>
        `;
    },
```

- [ ] **Step 2: 添加战斗区域CSS**

在style.css末尾追加：

```css
.battle-area {
    flex: 1;
    background: linear-gradient(180deg, #0a0a15 0%, #1a1a2e 100%);
    display: flex;
    flex-direction: column;
    padding: 15px;
}

.battle-stage {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 20px 0;
    flex: 1;
}

.combatant {
    text-align: center;
    width: 140px;
}

.char-icon {
    font-size: 60px;
    margin-bottom: 8px;
}

.monster.boss .char-icon {
    font-size: 70px;
    animation: bossPulse 1s infinite alternate;
}

@keyframes bossPulse {
    from { transform: scale(1); filter: drop-shadow(0 0 5px #ff0000); }
    to { transform: scale(1.1); filter: drop-shadow(0 0 15px #ff0000); }
}

.char-name {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 8px;
}

.vs-text {
    font-size: 24px;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 0 10px #ffd700;
}

.hp-bar {
    width: 100%;
    height: 20px;
    background: #333;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    border: 1px solid #555;
}

.hp-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.3s;
}

.hp-fill.boss-hp {
    background: linear-gradient(90deg, #f44336, #ff5722);
}

.hp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 11px;
    font-weight: bold;
    text-shadow: 1px 1px 2px #000;
}

.battle-log {
    height: 120px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    padding: 8px;
    overflow-y: auto;
    font-size: 12px;
}

.log-line {
    padding: 2px 0;
    color: #ccc;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}

.log-line:first-child {
    color: #ffd700;
}
```

- [ ] **Step 3: Commit**

```bash
cd /workspace && git add js/game.js css/style.css && git commit -m "feat: implement battle area UI with HP bars and logs"
```

---

## Task 9: 福利系统完整实现

**Files:**
- Modify: `/workspace/js/game.js`

- [ ] **Step 1: 替换福利标签页渲染，添加福利相关方法**

替换game.js中的renderWelfareTab方法，添加福利方法：

```javascript
    renderWelfareTab(container) {
        const s = this.state;
        const today = Utils.todayStr();
        const canSignIn = s.signInLastDate !== today;
        const canClaimCard = (s.hasPermanentCard || s.hasSupremeCard) && s.lastCardClaimDate !== today;
        const signDay = (s.signInDays % 7) + 1;

        container.innerHTML = `
            <div style="margin-bottom:15px;">
                <div style="font-weight:bold;color:#ffd700;margin-bottom:10px;">📅 每日签到</div>
                <button class="welfare-btn ${canSignIn ? '' : 'disabled'}" onclick="Game.doSignIn()" ${canSignIn ? '' : 'disabled'}>
                    ${canSignIn ? `第${signDay}天签到` : '今日已签到'}
                </button>
            </div>
            <div style="margin-bottom:15px;">
                <div style="font-weight:bold;color:#ffd700;margin-bottom:10px;">💳 永久卡</div>
                ${s.hasPermanentCard ? 
                    `<button class="welfare-btn ${canClaimCard ? '' : 'disabled'}" onclick="Game.claimCard()" ${canClaimCard ? '' : 'disabled'}>
                        ${canClaimCard ? '领取每日奖励' : '今日已领取'}
                    </button>` :
                    `<button class="welfare-btn buy" onclick="Game.buyPermanentCard()">
                        激活 (🏆${Utils.numFormat(GameData.welfare.permanentCard.price)})
                    </button>`
                }
            </div>
            <div style="margin-bottom:15px;">
                <div style="font-weight:bold;color:#ffd700;margin-bottom:10px;">👑 至尊永久卡</div>
                ${s.hasSupremeCard ? 
                    `<div style="color:#ff8c00;font-size:13px;">已激活（每日可多领一份奖励）</div>` :
                    `<button class="welfare-btn buy" onclick="Game.buySupremeCard()">
                        激活 (🏆${Utils.numFormat(GameData.welfare.supremeCard.price)})
                    </button>`
                }
            </div>
            <div>
                <div style="font-weight:bold;color:#ffd700;margin-bottom:10px;">🎁 礼包码</div>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="giftCodeInput" placeholder="输入礼包码" 
                        style="flex:1;padding:8px;background:#252540;border:1px solid #444;color:#eee;border-radius:4px;">
                    <button class="welfare-btn" style="width:80px;" onclick="Game.redeemCode()">兑换</button>
                </div>
            </div>
        `;
    },

    doSignIn() {
        const s = this.state;
        const today = Utils.todayStr();
        if (s.signInLastDate === today) return;
        
        s.signInLastDate = today;
        s.signInDays = (s.signInDays || 0) + 1;
        const dayIdx = Math.min(((s.signInDays - 1) % 7), 6);
        const reward = GameData.welfare.signInRewards.find(r => r.day === Math.min(dayIdx + 1, 7)) || GameData.welfare.signInRewards[0];
        
        s.gold += reward.gold;
        s.yuanbao += reward.yuanbao;
        s.material += reward.material;
        s.giftPack += reward.giftPack;
        
        this.addLog(`签到成功！获得奖励`);
        this.saveState();
        this.renderAll();
    },

    buyPermanentCard() {
        const s = this.state;
        const price = GameData.welfare.permanentCard.price;
        if (s.huangjin < price) {
            this.addLog('黄金不足！');
            return;
        }
        s.huangjin -= price;
        s.hasPermanentCard = true;
        this.addLog('永久卡激活成功！');
        this.saveState();
        this.renderAll();
    },

    buySupremeCard() {
        const s = this.state;
        const price = GameData.welfare.supremeCard.price;
        if (s.huangjin < price) {
            this.addLog('黄金不足！');
            return;
        }
        s.huangjin -= price;
        s.hasSupremeCard = true;
        this.addLog('至尊永久卡激活成功！');
        this.saveState();
        this.renderAll();
    },

    claimCard() {
        const s = this.state;
        const today = Utils.todayStr();
        if (s.lastCardClaimDate === today) return;
        
        s.lastCardClaimDate = today;
        if (s.hasPermanentCard) {
            const p = GameData.welfare.permanentCard;
            s.gold += p.goldDaily;
            s.yuanbao += p.yuanbaoDaily;
            s.material += p.materialDaily;
        }
        if (s.hasSupremeCard) {
            const sp = GameData.welfare.supremeCard;
            s.gold += sp.goldDaily;
            s.yuanbao += sp.yuanbaoDaily;
            s.material += sp.materialDaily;
            s.giftPack += sp.giftPackDaily;
        }
        
        this.addLog('领取每日卡奖励成功！');
        this.saveState();
        this.renderAll();
    },

    redeemCode() {
        const input = document.getElementById('giftCodeInput');
        const code = input.value.trim().toUpperCase();
        if (!code) return;
        
        const s = this.state;
        if (s.usedGiftCodes.includes(code)) {
            this.addLog('该礼包码已使用！');
            return;
        }
        
        const reward = GameData.welfare.giftCodes[code];
        if (!reward) {
            this.addLog('无效的礼包码！');
            return;
        }
        
        s.usedGiftCodes.push(code);
        s.gold += reward.gold || 0;
        s.yuanbao += reward.yuanbao || 0;
        s.huangjin += reward.huangjin || 0;
        s.giftPack += reward.giftPack || 0;
        
        this.addLog(`兑换成功：${code}`);
        input.value = '';
        this.saveState();
        this.renderAll();
    },
```

- [ ] **Step 2: 添加福利按钮CSS**

在style.css末尾追加：

```css
.welfare-btn {
    width: 100%;
    padding: 10px;
    background: linear-gradient(180deg, #4CAF50 0%, #388E3C 100%);
    border: 1px solid #66BB6A;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
}

.welfare-btn:hover:not(.disabled):not(:disabled) {
    background: linear-gradient(180deg, #66BB6A 0%, #4CAF50 100%);
}

.welfare-btn.disabled, .welfare-btn:disabled {
    background: #444;
    border-color: #555;
    color: #888;
    cursor: not-allowed;
}

.welfare-btn.buy {
    background: linear-gradient(180deg, #9C27B0 0%, #7B1FA2 100%);
    border-color: #BA68C8;
}

.welfare-btn.buy:hover {
    background: linear-gradient(180deg, #BA68C8 0%, #9C27B0 100%);
}
```

- [ ] **Step 3: Commit**

```bash
cd /workspace && git add js/game.js css/style.css && git commit -m "feat: implement complete welfare system (sign-in, cards, gift codes)"
```

---

## Task 10: 商城系统完整实现

**Files:**
- Modify: `/workspace/js/game.js`

- [ ] **Step 1: 替换商城标签页渲染，添加购买方法**

替换game.js中的renderShopTab方法，添加buyItem方法：

```javascript
    renderShopTab(container) {
        const s = this.state;
        container.innerHTML = `
            <div style="margin-bottom:10px;color:#aaa;">🏆 当前黄金: ${Utils.numFormat(s.huangjin)}</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${GameData.shop.map(item => `
                    <div class="shop-item">
                        <div style="font-size:28px;">${item.icon}</div>
                        <div style="flex:1;margin-left:10px;">
                            <div style="font-weight:bold;">${item.name}</div>
                            <div style="font-size:12px;color:#aaa;">${item.desc}</div>
                        </div>
                        <button class="shop-buy-btn" onclick="Game.buyItem('${item.id}')">
                            🏆${Utils.numFormat(item.price)}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    buyItem(itemId) {
        const s = this.state;
        const item = GameData.shop.find(i => i.id === itemId);
        if (!item) return;
        
        if (s.huangjin < item.price) {
            this.addLog('黄金不足！');
            return;
        }
        
        s.huangjin -= item.price;
        if (itemId === 'gift_pack') {
            s.giftPack += 1;
            this.addLog(`购买成功：${item.name}`);
        }
        
        this.saveState();
        this.renderAll();
    },
```

- [ ] **Step 2: 添加商城CSS**

在style.css末尾追加：

```css
.shop-item {
    display: flex;
    align-items: center;
    background: #252540;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 10px;
}

.shop-buy-btn {
    background: linear-gradient(180deg, #FF9800 0%, #F57C00 100%);
    border: 1px solid #FFB74D;
    border-radius: 4px;
    color: white;
    padding: 8px 15px;
    font-weight: bold;
    cursor: pointer;
}

.shop-buy-btn:hover {
    background: linear-gradient(180deg, #FFB74D 0%, #FF9800 100%);
}
```

- [ ] **Step 3: 添加重置存档功能（测试用）**

在game.js的init方法中添加键盘快捷键（方便测试）：
在init中this.startAutoSave()之后添加：
```javascript
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
                if (confirm('确定要重置存档吗？')) {
                    Utils.clearSave();
                    location.reload();
                }
            }
        });
```

- [ ] **Step 4: Commit**

```bash
cd /workspace && git add js/game.js css/style.css && git commit -m "feat: implement complete shop system"
```

---

## Task 11: 测试与验证

**Files:**
- 所有文件

- [ ] **Step 1: 启动本地HTTP服务器**

在/workspace目录启动服务器：
```bash
cd /workspace && python3 -m http.server 8000
```

- [ ] **Step 2: 验证页面加载**

打开浏览器访问 `http://localhost:8000`，检查：
- 页面正常加载，无JS错误
- 顶部状态栏显示战力、金币、元宝、黄金
- 标签页可切换（福利/商城）
- 战斗区域显示玩家和怪物
- 底部人物和背包按钮可点击
- 自动战斗正常运行，血条变化，日志滚动

- [ ] **Step 3: 验证核心玩法**

测试以下操作：
- 等待击杀怪物，获得金币和经验
- 点击底部"人物"按钮，打开人物面板
- 有足够金币和材料时点击强化，装备强化+1
- 点击底部"背包"按钮，使用新手赠送的万能礼包
- 切换到福利标签页，点击签到
- 切换到商城标签页，尝试购买万能礼包（黄金不足提示）

- [ ] **Step 4: 测试礼包码**

1. 打开福利标签页
2. 输入 `VIP666` 点击兑换
3. 验证黄金增加
4. 尝试再次输入相同code，提示"已使用"
5. 输入 `LEITING` 兑换更多资源

- [ ] **Step 5: 验证存档**

1. F5刷新页面
2. 验证数据保留（等级、资源、装备等级等）

- [ ] **Step 6: 停止服务器**

按Ctrl+C停止HTTP服务器

- [ ] **Step 7: 最终Commit**

```bash
cd /workspace && git add -A && git commit -m "feat: complete leiting legend game with all features"
```

---

## Plan Self-Review Checklist

1. **Spec coverage:** 所有设计文档中的功能都已覆盖：
   - ✅ 科学记数法工具函数
   - ✅ 角色系统（等级、属性）
   - ✅ 装备系统（强化、升星、永恒套装）
   - ✅ 怪物系统（小怪+Boss）
   - ✅ 自动战斗系统
   - ✅ 福利系统（签到、永久卡、至尊卡、礼包码）
   - ✅ 商城系统（黄金购买）
   - ✅ 背包系统（万能礼包使用）
   - ✅ LocalStorage存档
   - ✅ 界面布局（顶部、标签页、战斗区、底部）

2. **Placeholder scan:** 无TBD/TODO占位符，所有步骤都有完整代码

3. **Type consistency:** 方法名、属性名保持一致（Game.state、Utils.numFormat等）
