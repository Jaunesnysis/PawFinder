class UserAchievement {
    constructor(achievement_id, user_id, earned_at) {
        this.achievement_id = achievement_id;
        this.user_id = user_id;
        this.earned_at = earned_at || new Date(); // Jei data nepateikta, naudojame šiandienos
    }
}

module.exports = { UserAchievement };