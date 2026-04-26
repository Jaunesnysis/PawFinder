// Modules/Achievements/Infrastructure/achievementRepository.js

const { UserAchievement } = require('../Domain/UserAchievement');
const { Achievement } = require("../Domain/Achievement");
const db = require("../../../Infrastructure/db");

/**
 * Gauna visus pasiekimus
 */
const getAllAchievements = async () => {
    try {
        const query = 'SELECT achievement_id, title, description, points_threshold, icon_url FROM achievements';
        const result = await db.query(query);

        return result.rows.map(row => new Achievement(
            row.achievement_id,
            row.title,
            row.description,
            row.points_threshold,
            row.icon_url
        ));
    } catch (error) {
        // Pridedame kontekstą ir metame klaidą toliau
        throw new Error(`[AchievementRepository.getAllAchievements] ${error.message}`);
    }
};

/**
 * Gauna tik uždirbtų pasiekimų ID sąrašą
 */
const getEarnedBadgeIds = async (userId) => {
    try {
        const query = 'SELECT achievement_id FROM user_achievements WHERE user_id = $1';
        const result = await db.query(query, [userId]);

        return result.rows.map(row => row.achievement_id);
    } catch (error) {
        throw new Error(`[AchievementRepository.getEarnedBadgeIds] ${error.message}`);
    }
};

/**
 * Įrašo naujus uždirbtus pasiekimus
 */
const saveEarnedBadges = async (userId, newBadgeIds) => {
    try {
        if (!newBadgeIds || newBadgeIds.length === 0) return true;

        for (const badgeId of newBadgeIds) {
            const record = new UserAchievement(badgeId, userId);
            const query = 'INSERT INTO user_achievements (achievement_id, user_id, earned_at) VALUES ($1, $2, $3)';
            await db.query(query, [record.achievement_id, record.user_id, record.earned_at]);
        }
        return true;
    } catch (error) {
        throw new Error(`[AchievementRepository.saveEarnedBadges] ${error.message}`);
    }
};

module.exports = {
    getAllAchievements,
    getEarnedBadgeIds,
    saveEarnedBadges
};