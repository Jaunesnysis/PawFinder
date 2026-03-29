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

    // 1. Surandame TIK tuos pasiekimus, kuriuos vartotojas JAU uždirbo
    const earnedBadges = allAchievements.filter(ach =>
        earnedBadgeIds.includes(ach.achievement_id)
    );

    // 2. Surandame artimiausią dar neuždirbtą pasiekimą
    const locked = allAchievements
        .filter(ach => !earnedBadgeIds.includes(ach.achievement_id))
        .sort((a, b) => a.points_threshold - b.points_threshold);

    const nextBadge = locked.length > 0 ? locked[0] : null;

    // Paruošiame atsakymo objektą
    const response = {
        total_points: currentPoints,
        earned_badges: earnedBadges,
        next_achievement: nextBadge ? {
            title: nextBadge.title,
            points_threshold: nextBadge.points_threshold,
            points_missing: Math.max(0, nextBadge.points_threshold - currentPoints)
        } : null
    };

    // AC4: Jei visi gauti, pridedame žinutę (kad testas būtų PASS)
    if (!nextBadge) {
        response.message = "Visi pasiekimai jau pasiekti!";
    }

    return response;
};


module.exports = {
    addPoints,
    getAchievementProgress
};