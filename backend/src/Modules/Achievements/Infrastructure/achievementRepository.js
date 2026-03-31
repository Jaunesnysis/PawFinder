// --- MOCK DUOMENYS (Naudojami dabar, kol nėra DB) ---
const mockAchievements = [
    { achievement_id: 1, title: 'First Steps', description: 'Atlikai pirmą pavedžiojimą!', points_threshold: 10, icon_url: 'icon1.png' },
    { achievement_id: 2, title: 'Animal Friend', description: 'Surinkai 50 taškų!', points_threshold: 50, icon_url: 'icon2.png' },
    { achievement_id: 3, title: 'Hero of the City', description: 'Tikras gyvūnų herojus!', points_threshold: 100, icon_url: 'icon3.png' }
];

const mockUserAchievements = [
    //{ achievement_id: 1, user_id: 1, earned_at: new Date() },
    //{ achievement_id: 2, user_id: 1, earned_at: new Date() }
];

const { UserAchievement } = require('../Domain/UserAchievement');
const {Achievement} = require("../Domain/Achievement");

/**
 * Gauna visus pasiekimus (Lentelė: Achievement)
 */
const getAllAchievements = async () => {
        // 1. Iš mock'ų grąžiname klasių egzempliorius
        return mockAchievements.map(a => new Achievement(
            a.achievement_id,
            a.title,
            a.description,
            a.points_threshold,
            a.icon_url
        ));

        /* ATEITYJE (SQL):
        const query = 'SELECT achievement_id, title, description, points_threshold, icon_url FROM Achievement';
        const result = await db.query(query);

        // SVARBU: SQL grąžintus duomenis "supakuojame" į Achievement klasės objektus
        return result.rows.map(row => new Achievement(
            row.achievement_id,
            row.title,
            row.description,
            row.points_threshold,
            row.icon_url
        ));
        */
};

/**
 * Gauna tik uždirbtų pasiekimų ID sąrašą (Lentelė: UserAchievement)
 */
const getEarnedBadgeIds = async (userId) => {
    return mockUserAchievements
        .filter(ua => ua.user_id === parseInt(userId))
        .map(ua => ua.achievement_id);

    /* ATEITYJE (SQL):
    const query = 'SELECT * FROM UserAchievement WHERE user_id = $1';
    const result = await db.query(query, [userId]);

    // Vietoj to, kad grąžintum plikus DB duomenis, grąžini UserAchievement objektų masyvą
    return result.rows.map(row => new UserAchievement(
    row.achievement_id,
    row.user_id,
    row.earned_at
    ));
    */
};

/**
 * Įrašo naujus uždirbtus pasiekimus (Lentelė: UserAchievement)
 */
const saveEarnedBadges = async (userId, newBadgeIds) => {
    if (!newBadgeIds || newBadgeIds.length === 0) return true;

    newBadgeIds.forEach(id => {
        // Naudojame klasę naujam objektui sukurti
        const newRecord = new UserAchievement(id, parseInt(userId), new Date());
        mockUserAchievements.push(newRecord);
    });

    console.log(`[AchievementRepo] Išsaugoti nauji UserAchievement objektai.`);
    return true;

    /* ATEITYJE (SQL):
    for (const badgeId of newBadgeIds) {
        // 1. Sukuriame klasės egzempliorių
        const record = new UserAchievement(badgeId, userId);

        // 2. SQL užklausoje naudojame duomenis iš objekto
        const query = 'INSERT INTO UserAchievement (achievement_id, user_id, earned_at) VALUES ($1, $2, $3)';
        await db.query(query, [record.achievement_id, record.user_id, record.earned_at]);
    }
    */
};

module.exports = {
    getAllAchievements,
    getEarnedBadgeIds,
    saveEarnedBadges
};