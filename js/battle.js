const Battle = {
    selectMonster(game) {
        const s = game.state;
        let availableMonsters = GameData.monsters.filter(m => m.level <= Math.max(1, Math.floor(s.level * 1.2) + 3));
        if (availableMonsters.length === 0) {
            availableMonsters = [GameData.monsters[0]];
        }
        const monster = availableMonsters[availableMonsters.length - 1];
        game.currentMonster = {
            ...monster,
            currentHp: monster.hp,
            isBoss: false
        };
    },

    doAttack(game) {
        if (game.inBossBattle) return;
        
        const s = game.state;
        const m = game.currentMonster;
        if (!m) {
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
        s.gold += m.goldDrop;
        
        const expNeeded = s.level * 10 + Math.floor(s.level * s.level * 0.5);
        if (s.exp >= expNeeded) {
            s.exp -= expNeeded;
            s.level += 1;
            game.recalcStats();
            s.hp = s.maxHp;
            game.addLog(`🎉 升级！Lv.${Utils.numFormat(s.level)}`);
        }

        game.addLog(`击败${m.name} +💰${Utils.numFormat(m.goldDrop)} +⭐${Utils.numFormat(expGain)}`);
        game.killCount++;
        game.saveState();
        this.selectMonster(game);
    },

    startBossBattle(game, bossIndex) {
        if (game.inBossBattle) return;
        if (game.bossBattleCooldown && Date.now() < game.bossBattleCooldown) {
            const left = Math.ceil((game.bossBattleCooldown - Date.now()) / 1000);
            game.addLog(`Boss挑战冷却中，剩余${left}秒`);
            return;
        }
        
        const bossConfig = GameData.bosses[bossIndex];
        if (!bossConfig) return;
        
        if (bossConfig.level > game.state.level + 50) {
            game.addLog(`等级不足，无法挑战该Boss！`);
            return;
        }

        game.inBossBattle = true;
        game.currentBoss = {
            ...bossConfig,
            currentHp: bossConfig.hp
        };
        game.addLog(`⚠️ 开始挑战Boss：${bossConfig.name}！`);
        
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
        
        s.material += 10;
        s.yuanbao += 10 * b.level;
        s.exp += 100 * b.level;
        
        const expNeeded = s.level * 10 + Math.floor(s.level * s.level * 0.5);
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
        
        game.addLog(`🏆 击败${b.name}！+⚙️10材料 +💎${Utils.numFormat(10*b.level)}元宝 +⭐${Utils.numFormat(100*b.level)}经验`);
        game.bossBattleCooldown = Date.now() + 10000;
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
