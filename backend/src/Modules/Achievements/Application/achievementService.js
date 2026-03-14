const achievementRepository = require('../Infrastructure/achievementRepository');
const userService = require('../../Users/Application/userService');

/**
 * Prideda taškus vartotojui ir patikrina, ar jis uždirbo naujų pasiekimų (AC2, AC3)
 */
const addPoints = async (userId, pointsToAdd) =>{
    //Prasome userService prideti taskus ir grazinti mums kaip atrodo updated User
    const updatedUser = await userService.addPointsToUser(userId, pointsToAdd)

    //Gauname visus pasiekimus sistemoje
    const allAchievements = await achievementRepository.getAllAchievements();
    const earnedBadgeIds = await achievementRepository.getEarnedBadgeIds(userId);

    //Tikriname, kurie pasiekimai turi buti suteikiami vartotojui
    const newEarned = allAchievements.filter(ach =>
        updatedUser.points >= ach.points_threshold &&
        !earnedBadgeIds.includes(ach.achievement_id)
    );

    //Jei radome naujų, pranešame Repository, kad įrašytų TIK pasiekimo faktą
    if (newEarned.length > 0) {
        const newBadgeIds = newEarned.map(a => a.achievement_id);
        await achievementRepository.saveEarnedBadges(userId, newBadgeIds);
    }


    return {
        current_points: updatedUser.points,
        newly_earned: newEarned
    };
}

/**
 * Gauna informaciją apie progresą iki artimiausio pasiekimo (AC4)
 */
const getAchievementProgress = async (userId) => {
    const currentPoints = await userService.getUserPoints(userId);

    const allAchievements = await achievementRepository.getAllAchievements();
    const earnedBadgeIds = await achievementRepository.getEarnedBadgeIds(userId);

    // Surandame pasiekimus, kurių vartotojas dar neturi
    const lockedAchievements = allAchievements
        .filter(ach => !earnedBadgeIds.includes(ach.achievement_id))
        .sort((a, b) => a.points_threshold - b.points_threshold); // Rikiuojame pagal taškų ribą

    // Jei vartotojas jau turi visus pasiekimus
    if (lockedAchievements.length === 0) {
        return {
            total_points: currentPoints,
            next_achievement: null,
            message: "Visi pasiekimai jau pasiekti!"
        };
    }

    const nextBadge = lockedAchievements[0];
    const pointsMissing = nextBadge.points_threshold - currentPoints;

    return {
        total_points: currentPoints,
        next_achievement: {
            title: nextBadge.title,
            points_threshold: nextBadge.points_threshold,
            points_missing: pointsMissing > 0 ? pointsMissing : 0
        }
    };
}

module.exports = {
    addPoints,
    getAchievementProgress
};