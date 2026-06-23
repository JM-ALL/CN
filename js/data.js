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
        enhanceCostGoldGrowth: 1.15,
        starCostYuanbaoBase: 5,
        starCostYuanbaoGrowth: 1.2
    },
    monsters: [
        { level: 1, name: '小鸡', hp: 50, atk: 5, def: 2, goldDrop: 10 },
        { level: 5, name: '鹿', hp: 200, atk: 15, def: 8, goldDrop: 50 },
        { level: 10, name: '稻草人', hp: 800, atk: 40, def: 20, goldDrop: 200 },
        { level: 20, name: '骷髅', hp: 3000, atk: 100, def: 50, goldDrop: 800 },
        { level: 50, name: '沃玛战士', hp: 20000, atk: 500, def: 200, goldDrop: 5000 },
        { level: 100, name: '祖玛卫士', hp: 100000, atk: 2000, def: 800, goldDrop: 20000 },
        { level: 200, name: '赤月恶魔', hp: 500000, atk: 8000, def: 3000, goldDrop: 100000 },
        { level: 500, name: '魔龙教主', hp: 3000000, atk: 30000, def: 10000, goldDrop: 500000 }
    ],
    bosses: [
        { level: 10, name: '鸡王', hp: 2000, atk: 80, def: 30 },
        { level: 30, name: '骷髅精灵', hp: 15000, atk: 400, def: 150 },
        { level: 60, name: '沃玛教主', hp: 80000, atk: 1500, def: 600 },
        { level: 120, name: '祖玛教主', hp: 500000, atk: 6000, def: 2500 },
        { level: 250, name: '赤月恶魔', hp: 3000000, atk: 25000, def: 10000 },
        { level: 500, name: '魔龙教主', hp: 20000000, atk: 100000, def: 40000 }
    ],
    shop: [
        { id: 'gift_pack', name: '万能礼包', icon: '🎁', price: 100, desc: '使用后获得1e4万能材料' }
    ],
    welfare: {
        signInRewards: [
            { day: 1, gold: 100, yuanbao: 0, material: 0, giftPack: 0 },
            { day: 2, gold: 200, yuanbao: 5, material: 0, giftPack: 0 },
            { day: 3, gold: 500, yuanbao: 10, material: 100, giftPack: 1 },
            { day: 4, gold: 800, yuanbao: 20, material: 200, giftPack: 1 },
            { day: 5, gold: 1200, yuanbao: 30, material: 300, giftPack: 2 },
            { day: 6, gold: 1800, yuanbao: 50, material: 500, giftPack: 3 },
            { day: 7, gold: 3000, yuanbao: 100, material: 1000, giftPack: 5 }
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
        attackInterval: 800,
        bossAttackInterval: 600
    }
};
