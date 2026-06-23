let Game = {
    state: null,
    currentTab: 'welfare',
    currentModal: null,
    battleTimer: null,
    bossTimer: null,
    currentMonster: null,
    currentBoss: null,
    inBossBattle: false,
    killCount: 0,
    bossBattleCooldown: 0,

    init() {
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') this.closeModal();
        });
        
        this.loadState();
        this.selectMonster();
        this.renderAll();
        this.startBattle();
        this.startAutoSave();
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
                if (confirm('确定要重置存档吗？')) {
                    Utils.clearSave();
                    location.reload();
                }
            }
        });
    },

    getInitialState() {
        return {
            level: GameData.player.initLevel,
            exp: 0,
            hp: GameData.player.initHp,
            maxHp: GameData.player.initHp,
            atk: GameData.player.initAtk,
            def: GameData.player.initDef,
            power: 0,
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
        this.addLog('欢迎来到雷霆传奇！自动挂机中...');
        if (this.state.giftPack > 0) {
            this.addLog('🎁 新手礼包已放入背包，点击底部"背包"使用');
        }
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
        if (this.state.battleLog.length > 6) {
            this.state.battleLog.pop();
        }
    },

    selectMonster() {
        Battle.selectMonster(this);
    },

    startBattle() {
        if (this.battleTimer) clearInterval(this.battleTimer);
        this.battleTimer = setInterval(() => {
            Battle.doAttack(this);
            this.renderBattleArea();
            this.renderTopBar();
        }, GameData.battle.attackInterval);
    },

    startAutoSave() {
        setInterval(() => this.saveState(), 5000);
    },

    renderAll() {
        this.renderTopBar();
        this.renderTabBar();
        this.renderTabContent();
        this.renderBattleArea();
        this.renderBottomBar();
    },

    renderTopBar() {
        const s = this.state;
        const topBar = document.getElementById('topBar');
        topBar.innerHTML = `
            <div class="stat-item"><span class="stat-icon">⚔️</span><span>${Utils.numFormat(s.power)}</span></div>
            <div class="stat-item"><span class="stat-icon">💰</span><span>${Utils.numFormat(s.gold)}</span></div>
            <div class="stat-item"><span class="stat-icon">💎</span><span>${Utils.numFormat(s.yuanbao)}</span></div>
            <div class="stat-item"><span class="stat-icon">🏆</span><span>${Utils.numFormat(s.huangjin)}</span></div>
        `;
    },

    renderTabBar() {
        const tabBar = document.getElementById('tabBar');
        tabBar.innerHTML = `
            <button class="tab-btn ${this.currentTab === 'welfare' ? 'active' : ''}" onclick="Game.switchTab('welfare')">福利</button>
            <button class="tab-btn ${this.currentTab === 'shop' ? 'active' : ''}" onclick="Game.switchTab('shop')">商城</button>
            <button class="tab-btn ${this.currentTab === 'boss' ? 'active' : ''}" onclick="Game.switchTab('boss')">Boss</button>
        `;
    },

    switchTab(tab) {
        this.currentTab = tab;
        this.renderTabBar();
        this.renderTabContent();
    },

    renderTabContent() {
        const content = document.getElementById('tabContent');
        if (this.currentTab === 'welfare') {
            this.renderWelfareTab(content);
        } else if (this.currentTab === 'shop') {
            this.renderShopTab(content);
        } else if (this.currentTab === 'boss') {
            this.renderBossTab(content);
        }
    },

    renderWelfareTab(container) {
        const s = this.state;
        const today = Utils.todayStr();
        const canSignIn = s.signInLastDate !== today;
        const canClaimCard = (s.hasPermanentCard || s.hasSupremeCard) && s.lastCardClaimDate !== today;
        const signDay = Math.min((s.signInDays % 7) + 1, 7);

        container.innerHTML = `
            <div class="welfare-section">
                <div class="section-title">📅 每日签到</div>
                <button class="welfare-btn ${canSignIn ? '' : 'disabled'}" onclick="Game.doSignIn()" ${canSignIn ? '' : 'disabled'}>
                    ${canSignIn ? `第${signDay}天签到` : '✓ 今日已签到'}
                </button>
            </div>
            <div class="welfare-section">
                <div class="section-title">💳 永久卡 ${s.hasPermanentCard ? '✓已激活' : ''}</div>
                ${s.hasPermanentCard ? 
                    `<button class="welfare-btn ${canClaimCard ? '' : 'disabled'}" onclick="Game.claimCard()" ${canClaimCard ? '' : 'disabled'}>
                        ${canClaimCard ? '领取每日奖励' : '✓ 今日已领取'}
                    </button>` :
                    `<button class="welfare-btn buy" onclick="Game.buyPermanentCard()">
                        激活永久卡 (🏆${Utils.numFormat(GameData.welfare.permanentCard.price)})
                    </button>`
                }
            </div>
            <div class="welfare-section">
                <div class="section-title">👑 至尊永久卡 ${s.hasSupremeCard ? '✓已激活' : ''}</div>
                ${s.hasSupremeCard ? 
                    `<div style="color:#ff8c00;font-size:13px;margin-bottom:8px;">已激活，每日自动额外领取</div>` :
                    `<button class="welfare-btn buy" onclick="Game.buySupremeCard()">
                        激活至尊卡 (🏆${Utils.numFormat(GameData.welfare.supremeCard.price)})
                    </button>`
                }
            </div>
            <div class="welfare-section">
                <div class="section-title">🎁 礼包码</div>
                <div style="display:flex;gap:8px;">
                    <input type="text" id="giftCodeInput" class="code-input" placeholder="输入礼包码（如VIP666）">
                    <button class="welfare-btn" style="width:80px;padding:8px;" onclick="Game.redeemCode()">兑换</button>
                </div>
            </div>
        `;
    },

    renderShopTab(container) {
        const s = this.state;
        container.innerHTML = `
            <div style="margin-bottom:12px;color:#ccc;font-size:13px;">🏆 当前黄金: ${Utils.numFormat(s.huangjin)}</div>
            <div>
                ${GameData.shop.map(item => `
                    <div class="shop-item">
                        <div style="font-size:32px;">${item.icon}</div>
                        <div style="flex:1;margin-left:12px;">
                            <div style="font-weight:bold;">${item.name}</div>
                            <div style="font-size:12px;color:#999;">${item.desc}</div>
                        </div>
                        <button class="shop-buy-btn" onclick="Game.buyItem('${item.id}')" ${s.huangjin < item.price ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                            🏆${Utils.numFormat(item.price)}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderBossTab(container) {
        const s = this.state;
        const b = GameData.boss;
        const cooldownLeft = this.bossBattleCooldown > Date.now() ? Math.ceil((this.bossBattleCooldown - Date.now()) / 1000) : 0;
        
        let html = `<div style="margin-bottom:10px;font-size:13px;color:#ccc;">`;
        if (this.inBossBattle) {
            html += `⚔️ 正在挑战Boss中...`;
        } else if (cooldownLeft > 0) {
            html += `⏱️ 冷却中: ${cooldownLeft}秒`;
        } else {
            html += `当前等级 Lv.${Utils.numFormat(s.level)}，选择难度挑战`;
        }
        html += `</div>`;
        
        html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">`;
        for (let d = 1; d <= b.maxDifficulty; d++) {
            const mult = Math.pow(b.rewardMult, d - 1);
            const materialR = Math.floor(b.materialBase * mult);
            const yuanbaoR = Math.floor(b.yuanbaoBasePerLevel * s.level * mult);
            const expR = Math.floor(b.expBasePerLevel * s.level * mult);
            const canChallenge = !this.inBossBattle && cooldownLeft === 0;
            html += `
                <div class="boss-item" style="flex-direction:column;text-align:center;padding:10px;">
                    <div style="font-size:24px;">👹</div>
                    <div style="font-weight:bold;color:#ff6b6b;font-size:13px;">${d}阶</div>
                    <div class="boss-reward" style="font-size:10px;margin-top:3px;">
                        ⚙️${Utils.numFormat(materialR)}<br>
                        💎${Utils.numFormat(yuanbaoR)}<br>
                        ⭐${Utils.numFormat(expR)}
                    </div>
                    <button class="welfare-btn boss-btn" style="width:100%;padding:5px;font-size:12px;margin-top:6px;" 
                        onclick="Game.challengeBoss(${d})" ${canChallenge ? '' : 'disabled'}>
                        挑战
                    </button>
                </div>
            `;
        }
        html += `</div>`;
        
        container.innerHTML = html;
    },

    challengeBoss(difficulty) {
        Battle.startBossBattle(this, difficulty);
        this.renderAll();
    },

    renderBattleArea() {
        const s = this.state;
        let displayMonster = this.inBossBattle ? this.currentBoss : this.currentMonster;
        
        const area = document.getElementById('battleArea');
        
        const playerHpPercent = Math.max(0, (s.hp / s.maxHp) * 100);
        const monsterHpPercent = displayMonster ? Math.max(0, (displayMonster.currentHp / displayMonster.hp) * 100) : 100;
        const mName = displayMonster ? displayMonster.name : '寻找目标...';
        const mIsBoss = this.inBossBattle;
        const expNeeded = Battle.getExpNeeded(s.level);
        const expPercent = Math.min(100, (s.exp / expNeeded) * 100);

        area.innerHTML = `
            <div style="text-align:center;font-size:12px;color:#aaa;margin-bottom:5px;">
                Lv.${Utils.numFormat(s.level)} | 经验: ${Utils.numFormat(s.exp)}/${Utils.numFormat(expNeeded)}
                <div class="exp-bar"><div class="exp-fill" style="width:${expPercent}%"></div></div>
            </div>
            <div class="battle-stage">
                <div class="combatant player">
                    <div class="char-icon" style="color:#4CAF50;">🧙</div>
                    <div class="char-name">玩家</div>
                    <div class="hp-bar">
                        <div class="hp-fill" style="width:${playerHpPercent}%"></div>
                        <div class="hp-text">${Utils.numFormat(Math.floor(Math.max(0,s.hp)))}/${Utils.numFormat(s.maxHp)}</div>
                    </div>
                </div>
                <div class="vs-text">VS</div>
                <div class="combatant monster ${mIsBoss ? 'boss' : ''}">
                    <div class="char-icon">${mIsBoss ? '👹' : '👾'}</div>
                    <div class="char-name" style="${mIsBoss ? 'color:#ff4444;' : ''}">${mName}${mIsBoss ? ' [BOSS]' : ''}</div>
                    <div class="hp-bar">
                        <div class="hp-fill ${mIsBoss ? 'boss-hp' : ''}" style="width:${monsterHpPercent}%"></div>
                        <div class="hp-text">${displayMonster ? Utils.numFormat(Math.floor(Math.max(0,displayMonster.currentHp))) : '0'}/${displayMonster ? Utils.numFormat(displayMonster.hp) : '0'}</div>
                    </div>
                </div>
            </div>
            <div class="battle-log">
                ${this.state.battleLog.map(log => `<div class="log-line">${log}</div>`).join('')}
            </div>
        `;
    },

    renderBottomBar() {
        const bar = document.getElementById('bottomBar');
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
        const canEnhance = s.gold >= enhanceCostGold && s.material >= 1 && s.equipEnhance < e.maxEnhance;
        const canStar = s.yuanbao >= starCostYuanbao && s.material >= 1 && s.equipStar < e.maxStar;
        const expNeeded = Battle.getExpNeeded(s.level);
        
        modal.innerHTML = `
            <div class="modal-header">
                <span>👤 人物信息</span>
                <button class="close-btn" onclick="Game.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="font-size:22px;color:#ffd700;font-weight:bold;">Lv.${Utils.numFormat(s.level)}</div>
                    <div style="margin-top:5px;font-size:12px;color:#aaa;">
                        经验: ${Utils.numFormat(s.exp)}/${Utils.numFormat(expNeeded)}
                    </div>
                    <div class="exp-bar" style="margin-top:5px;"><div class="exp-fill" style="width:${Math.min(100,(s.exp/expNeeded)*100)}%"></div></div>
                </div>
                
                <div class="section-title">⚔️ ${e.quality}套装</div>
                <div style="background:#1e1e35;border:1px solid ${e.qualityColor};border-radius:6px;padding:12px;margin-bottom:15px;text-align:center;">
                    <div style="font-size:36px;">🛡️</div>
                    <div style="color:${e.qualityColor};font-weight:bold;font-size:16px;">${e.quality}套装</div>
                    <div style="margin-top:8px;font-size:14px;">
                        强化: <span style="color:#4CAF50;">+${Utils.numFormat(s.equipEnhance)}</span> | 
                        升星: <span style="color:#9C27B0;">★${Utils.numFormat(s.equipStar)}</span>
                    </div>
                </div>
                
                <div class="section-title">📊 属性</div>
                <div class="attr-row"><span class="attr-label">❤️ 生命值</span><span class="attr-value">${Utils.numFormat(s.maxHp)}</span></div>
                <div class="attr-row"><span class="attr-label">⚔️ 攻击力</span><span class="attr-value">${Utils.numFormat(s.atk)}</span></div>
                <div class="attr-row"><span class="attr-label">🛡️ 防御力</span><span class="attr-value">${Utils.numFormat(s.def)}</span></div>
                <div class="attr-row"><span class="attr-label">🔥 战力</span><span class="attr-value" style="color:#ffd700;">${Utils.numFormat(s.power)}</span></div>
                <div class="attr-row"><span class="attr-label">⚙️ 万能材料</span><span class="attr-value">${Utils.numFormat(s.material)}</span></div>
                
                <div style="display:flex;gap:10px;margin-top:15px;">
                    <button class="action-btn" onclick="Game.doEnhance()" style="flex:1;" ${canEnhance ? '' : 'disabled'}>
                        强化<br>
                        <span style="font-size:10px;font-weight:normal;">💰${Utils.numFormat(enhanceCostGold)} + ⚙️1</span>
                    </button>
                    <button class="action-btn" onclick="Game.doStar()" style="flex:1;background:linear-gradient(180deg,#9C27B0,#7B1FA2);border-color:#BA68C8;" ${canStar ? '' : 'disabled'}>
                        升星<br>
                        <span style="font-size:10px;font-weight:normal;">💎${Utils.numFormat(starCostYuanbao)} + ⚙️1</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderBagModal(modal) {
        const s = this.state;
        modal.innerHTML = `
            <div class="modal-header">
                <span>🎒 背包</span>
                <button class="close-btn" onclick="Game.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div class="attr-row"><span class="attr-label">💰 金币</span><span class="attr-value">${Utils.numFormat(s.gold)}</span></div>
                <div class="attr-row"><span class="attr-label">💎 元宝</span><span class="attr-value">${Utils.numFormat(s.yuanbao)}</span></div>
                <div class="attr-row"><span class="attr-label">🏆 黄金</span><span class="attr-value">${Utils.numFormat(s.huangjin)}</span></div>
                <div class="attr-row"><span class="attr-label">⚙️ 万能材料</span><span class="attr-value">${Utils.numFormat(s.material)}</span></div>
                
                <div class="section-title">📦 物品</div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;">
                    <div class="bag-item" onclick="Game.useGiftPack()" style="${s.giftPack < 1 ? 'opacity:0.5;' : ''}">
                        <div style="font-size:36px;">🎁</div>
                        <div style="font-size:12px;margin-top:4px;">万能礼包</div>
                        <div style="color:#ffd700;font-size:12px;font-weight:bold;">x${Utils.numFormat(s.giftPack)}</div>
                        <button class="use-btn" ${s.giftPack < 1 ? 'disabled style="opacity:0.5;"' : ''}>使用</button>
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
        this.addLog(`✨ 强化成功！+${Utils.numFormat(s.equipEnhance)}`);
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
        this.addLog(`⭐ 升星成功！★${Utils.numFormat(s.equipStar)}`);
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
        this.addLog('🎁 使用万能礼包！+1.00e4万能材料');
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'bag') this.openModal('bag');
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
        
        this.addLog(`📅 签到成功！第${dayIdx+1}天`);
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
        this.addLog('💳 永久卡激活成功！');
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
        this.addLog('👑 至尊永久卡激活成功！');
        this.saveState();
        this.renderAll();
    },

    claimCard() {
        const s = this.state;
        const today = Utils.todayStr();
        if (s.lastCardClaimDate === today) return;
        
        s.lastCardClaimDate = today;
        let totalGold = 0, totalYuanbao = 0, totalMaterial = 0, totalGiftPack = 0;
        
        if (s.hasPermanentCard) {
            const p = GameData.welfare.permanentCard;
            totalGold += p.goldDaily;
            totalYuanbao += p.yuanbaoDaily;
            totalMaterial += p.materialDaily;
        }
        if (s.hasSupremeCard) {
            const sp = GameData.welfare.supremeCard;
            totalGold += sp.goldDaily;
            totalYuanbao += sp.yuanbaoDaily;
            totalMaterial += sp.materialDaily;
            totalGiftPack += sp.giftPackDaily;
        }
        
        s.gold += totalGold;
        s.yuanbao += totalYuanbao;
        s.material += totalMaterial;
        s.giftPack += totalGiftPack;
        
        this.addLog('💳 领取每日卡奖励！');
        this.saveState();
        this.renderAll();
    },

    redeemCode() {
        const input = document.getElementById('giftCodeInput');
        const code = input.value.trim().toUpperCase();
        if (!code) return;
        
        const s = this.state;
        if (s.usedGiftCodes.includes(code)) {
            this.addLog('该礼包码已使用过！');
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
        
        this.addLog(`🎁 兑换成功：${code}`);
        input.value = '';
        this.saveState();
        this.renderAll();
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
            this.addLog(`🛒 购买成功：${item.name}`);
        }
        
        this.saveState();
        this.renderAll();
    }
};

window.addEventListener('load', () => Game.init());
