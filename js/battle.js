const Battle = {
    generateMonster(level) {
        const m = GameData.monster;
        return {
            name: m.name,
            level: level,
            hp: Math.floor(m.hpBase * Math.pow(m.hpGrowth, Math.max(0, level - 1))),
            atk: Math.floor(m.atkBase * Math.pow(m.atkGrowth, Math.max(0, level - 1))),
            def: Math.floor(m.defBase * Math.pow(m.defGrowth, Math.max(0, level - 1))),
            goldDrop: Math.floor(m.goldBase * Math.pow(m.goldGrowth, Math.max(0, level - 1))),
            currentHp: 0,
            isBoss: false
        };
    },

    generateBoss(level, difficulty) {
        const b = GameData.boss;
        const mult = Math.pow(b.rewardMult, difficulty - 1);
        const baseMonster = this.generateMonster(level);
        return {
            name: `${b.name}·${difficulty}阶`,
            level: level,
            difficulty: difficulty,
            hp: Math.floor(baseMonster.hp * b.hpMult * mult),
            atk: Math.floor(baseMonster.atk * b.atkMult * mult),
            def: Math.floor(baseMonster.def * b.defMult * mult),
            materialReward: Math.floor(b.materialBase * mult),
            yuanbaoReward: Math.floor(b.yuanbaoBasePerLevel * level * mult),
            expReward: Math.floor(b.expBasePerLevel * level * mult),
            currentHp: 0,
            isBoss: true
        };
    },

    getExpNeeded(level) {
        return level * 10;
    },

    selectMonster(game) {
        const s = game.state;
        const monster = this.generateMonster(s.level);
        monster.currentHp = monster.hp;
        game.currentMonster = monster;
    },

    doAttack(game) {
        if (game.inBossBattle) return;
        
        const s = game.state;
        const m = game.currentMonster;
        if (!m || m.level !== s.level) {
            this.selectMonster(game);
            return;
        }

        const playerDmg = Math.max(1, Math.floor(s.atk - m.def * 0.3));
        m.currentHp -= playerDmg;

        if (m.currentHp <= 0) {
            this.onMonsterDeath(game);
            return;
        }

        const monsterDmg = Math.max(1, Math.floor(m.atk - s.def * 0.5));
        s.hp -= monsterDmg;

        if (s.hp <= 0) {
            s.hp = s.maxHp;
            game.addLog(`你被击败了，满血复活继续战斗！`);
        }
    },

    onMonsterDeath(game) {
        const s = game.state;
        const m = game.currentMonster;
        
        const expGain = m.level;
        s.exp += expGain;
        s.gold = Utils.numAdd(s.gold, m.goldDrop);
        
        const expNeeded = this.getExpNeeded(s.level);
        while (s.exp >= expNeeded) {
            s.exp -= expNeeded;
            s.level += 1;
            game.recalcStats();
            s.hp = s.maxHp;
            game.addLog(`🎉 升级！Lv.${Utils.numFormat(s.level)}`);
        }

        game.addLog(`击败怪物 +💰${Utils.numFormat(m.goldDrop)} +⭐${Utils.numFormat(expGain)}`);
        game.killCount++;
        game.saveState();
        this.selectMonster(game);
    },

    startBossBattle(game, difficulty) {
        if (game.inBossBattle) return;
        if (difficulty < 1 || difficulty > GameData.boss.maxDifficulty) return;
        if (game.bossBattleCooldown && Date.now() < game.bossBattleCooldown) {
            const left = Math.ceil((game.bossBattleCooldown - Date.now()) / 1000);
            game.addLog(`Boss挑战冷却中，剩余${left}秒`);
            return;
        }

        game.inBossBattle = true;
        const boss = this.generateBoss(game.state.level, difficulty);
        boss.currentHp = boss.hp;
        game.currentBoss = boss;
        game.addLog(`⚠️ 开始挑战${difficulty}阶Boss：${boss.name}！`);
        
        if (game.bossTimer) clearInterval(game.bossTimer);
        game.bossTimer = setInterval(() => {
            this.doBossAttack(game);
            game.renderAll();
        }, GameData.battle.bossAttackInterval);
    },

    doBossAttack(game) {
        if (!game.inBossBattle || !game.currentBoss) return;
        
        const s = game.state;
        const b = game.currentBoss;

        const playerDmg = Math.max(1, Math.floor(s.atk - b.def * 0.2));
        b.currentHp -= playerDmg;

        if (b.currentHp <= 0) {
            this.onBossDeath(game);
            return;
        }

        const bossDmg = Math.max(1, Math.floor(b.atk - s.def * 0.4));
        s.hp -= bossDmg;

        if (s.hp <= 0) {
            this.onBossDefeat(game);
        }
    },

    onBossDeath(game) {
        const s = game.state;
        const b = game.currentBoss;
        
        s.material = Utils.numAdd(s.material, b.materialReward);
        s.yuanbao = Utils.numAdd(s.yuanbao, b.yuanbaoReward);
        s.exp += b.expReward;
        
        const expNeeded = this.getExpNeeded(s.level);
        let leveledUp = false;
        while (s.exp >= expNeeded) {
            s.exp -= expNeeded;
            s.level += 1;
            leveledUp = true;
        }
        if (leveledUp) {
            game.recalcStats();
            s.hp = s.maxHp;
            game.addLog(`🎉 击败Boss升级！Lv.${Utils.numFormat(s.level)}`);
        }
        
        game.addLog(`🏆 击败${b.name}！+⚙️${Utils.numFormat(b.materialReward)} +💎${Utils.numFormat(b.yuanbaoReward)} +⭐${Utils.numFormat(b.expReward)}`);
        game.bossBattleCooldown = Date.now() + GameData.battle.bossCooldown;
        this.endBossBattle(game);
        game.saveState();
    },

    onBossDefeat(game) {
        const b = game.currentBoss;
        game.addLog(`💀 被${b.name}击败了...`);
        game.state.hp = game.state.maxHp;
        this.endBossBattle(game);
    },

    endBossBattle(game) {
        game.inBossBattle = false;
        game.currentBoss = null;
        if (game.bossTimer) {
            clearInterval(game.bossTimer);
            game.bossTimer = null;
        }
        game.selectMonster();
    }
};
