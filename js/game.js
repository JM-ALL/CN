let Game = {
    state: null,
    currentModal: null,
    battleTimer: null,
    bossTimer: null,
    currentMonster: null,
    currentBoss: null,
    inBossBattle: false,
    killCount: 0,
    bossBattleCooldown: 0,

    init() {
        this.loadState();
        this.selectMonster();
        this.startBattle();
        this.renderAll();
        
        setInterval(() => {
            if (this.bossBattleCooldown > 0 && Date.now() > this.bossBattleCooldown) {
                this.bossBattleCooldown = 0;
            }
            this.renderAll();
            this.saveState();
        }, 1000);
    },

    getInitialState() {
        const p = GameData.player;
        return {
            level: p.initLevel,
            exp: Utils.bn(0),
            hp: Utils.bn(p.initHp),
            maxHp: Utils.bn(p.initHp),
            atk: Utils.bn(p.initAtk),
            def: Utils.bn(p.initDef),
            power: Utils.bn(0),
            gold: Utils.bn(0),
            yuanbao: Utils.bn(0),
            huangjin: Utils.bn(0),
            material: Utils.bn(0),
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
            const init = this.getInitialState();
            this.state = Object.assign({}, init, saved);
            ['gold','yuanbao','huangjin','material','hp','maxHp','atk','def','power','exp'].forEach(k => {
                if (this.state[k] === null || this.state[k] === undefined) {
                    this.state[k] = Utils.bn(0);
                } else if (!(this.state[k] instanceof BigNum)) {
                    this.state[k] = Utils.bn(this.state[k]);
                }
            });
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
        const p = GameData.player;
        
        const baseHp = p.initHp + (s.level - 1) * p.perLevelHp;
        const baseAtk = p.initAtk + (s.level - 1) * p.perLevelAtk;
        const baseDef = p.initDef + (s.level - 1) * p.perLevelDef;
        
        const equipHp = e.baseHp * s.equipEnhance * s.equipStar;
        const equipAtk = e.baseAtk * s.equipEnhance * s.equipStar;
        const equipDef = e.baseDef * s.equipEnhance * s.equipStar;
        
        let mult = 1;
        if (s.hasPermanentCard) mult *= 1e5;
        if (s.hasSupremeCard) mult *= 1e10;
        
        s.maxHp = Utils.bn(Math.floor((baseHp + equipHp) * mult));
        s.atk = Utils.bn(Math.floor((baseAtk + equipAtk) * mult));
        s.def = Utils.bn(Math.floor((baseDef + equipDef) * mult));
        s.power = s.maxHp.add(s.atk.mul(10)).add(s.def.mul(5));
        
        if (s.hp.gt(s.maxHp)) s.hp = s.maxHp.clone();
        if (s.hp.lte(0)) s.hp = s.maxHp.clone();
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
            if (!this.inBossBattle) {
                Battle.doAttack(this);
                this.renderAll();
            }
        }, GameData.battle.attackInterval);
    },

    renderAll() {
        this.renderTopBar();
        this.renderBattleArea();
        this.renderBottomBar();
    },

    renderTopBar() {
        const s = this.state;
        const bar = document.getElementById('topBar');
        bar.innerHTML = `
            <div class="stat-item">
                <span class="stat-icon">⚔️</span>
                <span>${Utils.numFormat(s.power)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">💰</span>
                <span>${Utils.numFormat(s.gold)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">💎</span>
                <span>${Utils.numFormat(s.yuanbao)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">🏆</span>
                <span>${Utils.numFormat(s.huangjin)}</span>
            </div>
        `;
    },

    renderBottomBar() {
        const bar = document.getElementById('bottomBar');
        bar.innerHTML = `
            <button class="bottom-btn" onclick="Game.openModal('player')">👤<br>人物</button>
            <button class="bottom-btn" onclick="Game.openModal('bag')">🎒<br>背包</button>
            <button class="bottom-btn" onclick="Game.openModal('welfare')">🎁<br>福利</button>
            <button class="bottom-btn" onclick="Game.openModal('shop')">🛒<br>商城</button>
            <button class="bottom-btn" onclick="Game.openModal('boss')">👹<br>Boss</button>
        `;
    },

    openModal(type) {
        if (type !== 'boss' && this.inBossBattle) {
            this.addLog('Boss战斗中，请稍后...');
            return;
        }
        this.currentModal = type;
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modal');
        overlay.style.display = 'flex';
        
        if (type === 'player') {
            this.renderPlayerModal(modal);
        } else if (type === 'bag') {
            this.renderBagModal(modal);
        } else if (type === 'welfare') {
            this.renderWelfareModal(modal);
        } else if (type === 'shop') {
            this.renderShopModal(modal);
        } else if (type === 'boss') {
            this.renderBossModal(modal);
        }
    },

    closeModal() {
        this.currentModal = null;
        document.getElementById('modalOverlay').style.display = 'none';
    },

    renderPlayerModal(modal) {
        const s = this.state;
        const e = GameData.equip;
        const enhanceCostGold = s.equipEnhance;
        const starCostYuanbao = s.equipStar;
        const canEnhance = s.gold.gte(Utils.bn(enhanceCostGold)) && s.material.gte(Utils.bn(1)) && s.equipEnhance < e.maxEnhance;
        const canStar = s.yuanbao.gte(Utils.bn(starCostYuanbao)) && s.material.gte(Utils.bn(1)) && s.equipStar < e.maxStar;
        const expNeeded = Battle.getExpNeeded(s.level);
        const expRatio = s.exp.div(Utils.bn(expNeeded));
        const expPercent = Math.max(0, Math.min(100, expRatio.m * Math.pow(10, expRatio.e) * 100));
        
        let cardInfo = '';
        if (s.hasPermanentCard && s.hasSupremeCard) {
            cardInfo = '永久卡×1e5 · 至尊卡×1e10 = 总×1e15';
        } else if (s.hasPermanentCard) {
            cardInfo = '永久卡×1e5';
        } else if (s.hasSupremeCard) {
            cardInfo = '至尊卡×1e10';
        }
        
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
                    <div class="exp-bar" style="margin-top:5px;"><div class="exp-fill" style="width:${expPercent}%"></div></div>
                    ${cardInfo ? `<div style="margin-top:8px;font-size:11px;color:#ff8c00;">加成: ${cardInfo}</div>` : ''}
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
                <div class="section-title">📦 道具</div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                    <div class="bag-item">
                        <div style="font-size:28px;">🎁</div>
                        <div style="font-weight:bold;font-size:13px;margin-top:4px;">万能礼包</div>
                        <div style="font-size:11px;color:#999;margin-top:2px;">×${Utils.numFormat(s.giftPack)}</div>
                        <button class="use-btn" onclick="Game.useGiftPack()" ${s.giftPack < 1 ? 'disabled' : ''}>使用</button>
                    </div>
                </div>
                
                <div class="section-title" style="margin-top:15px;">💰 资源</div>
                <div class="attr-row"><span class="attr-label">💰 金币</span><span class="attr-value">${Utils.numFormat(s.gold)}</span></div>
                <div class="attr-row"><span class="attr-label">💎 元宝</span><span class="attr-value">${Utils.numFormat(s.yuanbao)}</span></div>
                <div class="attr-row"><span class="attr-label">🏆 黄金</span><span class="attr-value">${Utils.numFormat(s.huangjin)}</span></div>
                <div class="attr-row"><span class="attr-label">⚙️ 万能材料</span><span class="attr-value">${Utils.numFormat(s.material)}</span></div>
            </div>
        `;
    },

    renderWelfareModal(modal) {
        const s = this.state;
        const today = Utils.todayStr();
        const canSignIn = s.signInLastDate !== today;
        const canClaimCard = (s.hasPermanentCard || s.hasSupremeCard) && s.lastCardClaimDate !== today;
        const signDay = Math.min((s.signInDays % 7) + 1, 7);

        modal.innerHTML = `
            <div class="modal-header">
                <span>🎁 福利中心</span>
                <button class="close-btn" onclick="Game.closeModal()">✕</button>
            </div>
            <div class="modal-body">
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
            </div>
        `;
    },

    renderShopModal(modal) {
        const s = this.state;
        modal.innerHTML = `
            <div class="modal-header">
                <span>🛒 商城</span>
                <button class="close-btn" onclick="Game.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:12px;color:#ccc;font-size:13px;">🏆 当前黄金: ${Utils.numFormat(s.huangjin)}</div>
                <div>
                    ${GameData.shop.map(item => `
                        <div class="shop-item">
                            <div style="font-size:32px;">${item.icon}</div>
                            <div style="flex:1;margin-left:12px;">
                                <div style="font-weight:bold;">${item.name}</div>
                                <div style="font-size:12px;color:#999;">${item.desc}</div>
                            </div>
                            <button class="shop-buy-btn" onclick="Game.buyItem('${item.id}')" ${s.huangjin.gte(Utils.bn(item.price)) ? '' : 'disabled'}>
                                🏆${Utils.numFormat(item.price)}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderBossModal(modal) {
        const s = this.state;
        const b = GameData.boss;
        const cooldownLeft = this.bossBattleCooldown > Date.now() ? Math.ceil((this.bossBattleCooldown - Date.now()) / 1000) : 0;
        
        let headerHtml = '';
        if (this.inBossBattle) {
            headerHtml = `⚔️ 正在挑战Boss中...`;
        } else if (cooldownLeft > 0) {
            headerHtml = `⏱️ 冷却中: ${cooldownLeft}秒`;
        } else {
            headerHtml = `当前等级 Lv.${Utils.numFormat(s.level)}，选择难度挑战`;
        }

        let bossGrid = '';
        for (let d = 1; d <= b.maxDifficulty; d++) {
            const mult = Math.pow(b.rewardMult, d - 1);
            const materialR = Math.floor(b.materialBase * mult);
            const yuanbaoR = Math.floor(b.yuanbaoBasePerLevel * s.level * mult);
            const expR = Math.floor(b.expBasePerLevel * s.level * mult);
            const canChallenge = !this.inBossBattle && cooldownLeft === 0;
            bossGrid += `
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

        modal.innerHTML = `
            <div class="modal-header">
                <span>👹 Boss挑战</span>
                <button class="close-btn" onclick="Game.closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:10px;font-size:13px;color:#ccc;text-align:center;">${headerHtml}</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                    ${bossGrid}
                </div>
            </div>
        `;
    },

    challengeBoss(difficulty) {
        Battle.startBossBattle(this, difficulty);
        this.closeModal();
        this.renderAll();
    },

    renderBattleArea() {
        const s = this.state;
        let displayMonster = this.inBossBattle ? this.currentBoss : this.currentMonster;
        
        const area = document.getElementById('battleArea');
        
        const playerHpPercent = (() => {
            if (s.maxHp.isZero()) return 100;
            if (s.hp.e >= 300 || s.maxHp.e >= 300) return 100;
            const ratio = s.hp.div(s.maxHp);
            const pct = ratio.m * Math.pow(10, ratio.e) * 100;
            return Math.max(0, Math.min(100, pct));
        })();
        
        let monsterHpPercent = 100;
        let mName = '寻找目标...';
        let mIsBoss = this.inBossBattle;
        let mHpDisplay = '0';
        let mMaxHpDisplay = '0';
        
        if (displayMonster) {
            const maxHp = displayMonster.hp;
            const curHp = Math.max(0, displayMonster.currentHp);
            monsterHpPercent = Math.max(0, (curHp / maxHp) * 100);
            mName = displayMonster.name;
            mHpDisplay = Utils.numFormat(Math.floor(curHp));
            mMaxHpDisplay = Utils.numFormat(maxHp);
        }
        
        const expNeeded = Battle.getExpNeeded(s.level);
        const expRatio = s.exp.div(Utils.bn(expNeeded));
        const expPercent = Math.max(0, Math.min(100, expRatio.m * Math.pow(10, expRatio.e) * 100));

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
                        <div class="hp-text">${Utils.numFormat(s.hp.floor())}/${Utils.numFormat(s.maxHp)}</div>
                    </div>
                </div>
                <div class="vs-text">VS</div>
                <div class="combatant monster ${mIsBoss ? 'boss' : ''}">
                    <div class="char-icon">${mIsBoss ? '👹' : '👾'}</div>
                    <div class="char-name" style="${mIsBoss ? 'color:#ff4444;' : ''}">${mName}${mIsBoss ? ' [BOSS]' : ''}</div>
                    <div class="hp-bar">
                        <div class="hp-fill ${mIsBoss ? 'boss-hp' : ''}" style="width:${monsterHpPercent}%"></div>
                        <div class="hp-text">${mHpDisplay}/${mMaxHpDisplay}</div>
                    </div>
                </div>
            </div>
            <div class="battle-log">
                ${this.state.battleLog.map(log => `<div class="log-line">${log}</div>`).join('')}
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
        const costGold = s.equipEnhance;
        if (!Utils.canAfford(s.gold, costGold)) {
            this.addLog('金币不足！');
            return;
        }
        if (!Utils.canAfford(s.material, 1)) {
            this.addLog('万能材料不足！');
            return;
        }
        s.gold = s.gold.sub(Utils.bn(costGold));
        s.material = s.material.sub(Utils.bn(1));
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
        const costYuanbao = s.equipStar;
        if (!Utils.canAfford(s.yuanbao, costYuanbao)) {
            this.addLog('元宝不足！');
            return;
        }
        if (!Utils.canAfford(s.material, 1)) {
            this.addLog('万能材料不足！');
            return;
        }
        s.yuanbao = s.yuanbao.sub(Utils.bn(costYuanbao));
        s.material = s.material.sub(Utils.bn(1));
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
        s.material = s.material.add(Utils.bn(10000));
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
        
        s.gold = s.gold.add(Utils.bn(reward.gold));
        s.yuanbao = s.yuanbao.add(Utils.bn(reward.yuanbao));
        s.material = s.material.add(Utils.bn(reward.material));
        s.giftPack += reward.giftPack;
        
        this.addLog(`📅 签到成功！第${dayIdx+1}天`);
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'welfare') this.openModal('welfare');
    },

    buyPermanentCard() {
        const s = this.state;
        const price = GameData.welfare.permanentCard.price;
        if (!Utils.canAfford(s.huangjin, price)) {
            this.addLog('黄金不足！');
            return;
        }
        s.huangjin = s.huangjin.sub(Utils.bn(price));
        s.hasPermanentCard = true;
        this.recalcStats();
        this.addLog('💳 永久卡激活成功！');
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'welfare') this.openModal('welfare');
    },

    buySupremeCard() {
        const s = this.state;
        const price = GameData.welfare.supremeCard.price;
        if (!Utils.canAfford(s.huangjin, price)) {
            this.addLog('黄金不足！');
            return;
        }
        s.huangjin = s.huangjin.sub(Utils.bn(price));
        s.hasSupremeCard = true;
        this.recalcStats();
        this.addLog('👑 至尊永久卡激活成功！');
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'welfare') this.openModal('welfare');
    },

    claimCard() {
        const s = this.state;
        const today = Utils.todayStr();
        if (s.lastCardClaimDate === today) return;
        
        s.lastCardClaimDate = today;
        let totalGold = Utils.bn(0), totalYuanbao = Utils.bn(0), totalMaterial = Utils.bn(0);
        let totalGiftPack = 0;
        
        if (s.hasPermanentCard) {
            const p = GameData.welfare.permanentCard;
            totalGold = totalGold.add(Utils.bn(p.goldDaily));
            totalYuanbao = totalYuanbao.add(Utils.bn(p.yuanbaoDaily));
            totalMaterial = totalMaterial.add(Utils.bn(p.materialDaily));
        }
        if (s.hasSupremeCard) {
            const sp = GameData.welfare.supremeCard;
            totalGold = totalGold.add(Utils.bn(sp.goldDaily));
            totalYuanbao = totalYuanbao.add(Utils.bn(sp.yuanbaoDaily));
            totalMaterial = totalMaterial.add(Utils.bn(sp.materialDaily));
            totalGiftPack += sp.giftPackDaily;
        }
        
        s.gold = s.gold.add(totalGold);
        s.yuanbao = s.yuanbao.add(totalYuanbao);
        s.material = s.material.add(totalMaterial);
        s.giftPack += totalGiftPack;
        
        this.addLog('💳 领取每日卡奖励！');
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'welfare') this.openModal('welfare');
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
        
        const addRes = (key, val) => {
            if (val === '__INF__' || val === 'INF') {
                s[key] = new BigNum(1, 9999);
            } else if (val !== undefined && val !== null) {
                s[key] = s[key].add(Utils.bn(val));
            }
        };
        
        addRes('gold', reward.gold);
        addRes('yuanbao', reward.yuanbao);
        addRes('huangjin', reward.huangjin);
        addRes('material', reward.material);
        s.giftPack += (reward.giftPack || 0);
        
        this.addLog(`🎁 兑换成功：${code}`);
        input.value = '';
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'welfare') this.openModal('welfare');
    },

    buyItem(itemId) {
        const s = this.state;
        const item = GameData.shop.find(i => i.id === itemId);
        if (!item) return;
        
        if (!Utils.canAfford(s.huangjin, item.price)) {
            this.addLog('黄金不足！');
            return;
        }
        
        s.huangjin = s.huangjin.sub(Utils.bn(item.price));
        if (itemId === 'gift_pack') {
            s.giftPack += 1;
            this.addLog(`🛒 购买成功：${item.name}`);
        }
        
        this.saveState();
        this.renderAll();
        if (this.currentModal === 'shop') this.openModal('shop');
    }
};

window.addEventListener('load', () => Game.init());
