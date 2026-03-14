class Achievement {
    constructor(id, title, description, pointsThreshold, iconUrl) {
        this.achievement_id = id;
        this.title = title;
        this.description = description;
        this.points_threshold = pointsThreshold;
        this.icon_url = iconUrl;
    }
}
module.exports = { Achievement };