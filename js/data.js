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
    monster: {
        name: '怪物',
        hpBase: 50,
        hpGrowth: 2.0,
        atkBase: 5,
        atkGrowth: 1.8,
        defBase: 2,
        defGrowth: 1.6,
        goldBase: 10,
        goldGrowth: 1.5
    },
    boss: {
        maxDifficulty: 10,
        name: '教主',
        hpMult: 50,
        atkMult: 8,
        defMult: 5,
        materialBase: 10,
        yuanbaoBasePerLevel: 10,
        expBasePerLevel: 100,
        rewardMult: 2
    },
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
        bossAttackInterval: 600,
        bossCooldown: 10000
    }
};
