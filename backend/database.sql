-- =========================
-- PawFinder PostgreSQL Schema
-- =========================

-- Optional: clean old objects if recreating database manually
-- DROP TABLE IF EXISTS favourites CASCADE;
-- DROP TABLE IF EXISTS pet_statistics CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS user_achievements CASCADE;
-- DROP TABLE IF EXISTS achievements CASCADE;
-- DROP TABLE IF EXISTS questionnaire_responses CASCADE;
-- DROP TABLE IF EXISTS reservations CASCADE;
-- DROP TABLE IF EXISTS pet_images CASCADE;
-- DROP TABLE IF EXISTS pets CASCADE;
-- DROP TABLE IF EXISTS shelters CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- DROP TYPE IF EXISTS user_role CASCADE;
-- DROP TYPE IF EXISTS pet_size CASCADE;
-- DROP TYPE IF EXISTS pet_activity_level CASCADE;
-- DROP TYPE IF EXISTS pet_status CASCADE;
-- DROP TYPE IF EXISTS reservation_status CASCADE;
-- DROP TYPE IF EXISTS notification_status CASCADE;

-- =========================
-- ENUM TYPES
-- =========================

CREATE TYPE user_role AS ENUM ('volunteer', 'shelter', 'user');
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE pet_activity_level AS ENUM ('low', 'moderate', 'high');
CREATE TYPE pet_status AS ENUM ('available', 'reserved', 'adopted');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE notification_status AS ENUM ('unread', 'read');

-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    birth_date DATE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    city VARCHAR(100),
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    last_earned_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consent_given_at TIMESTAMP
);

-- =========================
-- SHELTERS
-- =========================

CREATE TABLE shelters (
    shelter_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    donation_account VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PETS
-- =========================

CREATE TABLE pets (
    pet_id BIGSERIAL PRIMARY KEY,
    shelter_id BIGINT NOT NULL REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    age INTEGER CHECK (age >= 0),
    size pet_size,
    weight NUMERIC(6,2) CHECK (weight >= 0),
    activity_level pet_activity_level,
    health_info TEXT,
    status pet_status NOT NULL DEFAULT 'available',
    city VARCHAR(100),
    shelter_description TEXT,
    ai_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PET IMAGES
-- =========================

CREATE TABLE pet_images (
    image_id BIGSERIAL PRIMARY KEY,
    pet_id BIGINT NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- RESERVATIONS
-- =========================

CREATE TABLE reservations (
    reservation_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pet_id BIGINT NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reservation_start TIME NOT NULL,
    reservation_end TIME NOT NULL,
    status reservation_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    CONSTRAINT reservation_time_check CHECK (reservation_end > reservation_start)
);

-- =========================
-- QUESTIONNAIRE RESPONSES
-- =========================

CREATE TABLE questionnaire_responses (
    response_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    answer_value JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ACHIEVEMENTS
-- =========================

CREATE TABLE achievements (
    achievement_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    points_threshold INTEGER NOT NULL CHECK (points_threshold >= 0),
    icon_url TEXT
);

-- =========================
-- USER ACHIEVEMENTS
-- =========================

CREATE TABLE user_achievements (
    achievement_id BIGINT NOT NULL REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (achievement_id, user_id)
);

-- =========================
-- NOTIFICATIONS
-- =========================

CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    shelter_id BIGINT NOT NULL REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    reservation_id BIGINT NOT NULL REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status notification_status NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- =========================
-- PET STATISTICS
-- =========================

CREATE TABLE pet_statistics (
    stat_id BIGSERIAL PRIMARY KEY,
    pet_id BIGINT NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    reservation_clicks_count INTEGER NOT NULL DEFAULT 0 CHECK (reservation_clicks_count >= 0),
    UNIQUE (pet_id, date)
);

-- =========================
-- FAVOURITES
-- =========================

CREATE TABLE favourites (
    pet_id BIGINT NOT NULL REFERENCES pets(pet_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pet_id, user_id)
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_shelters_city ON shelters(city);

CREATE INDEX idx_pets_shelter_id ON pets(shelter_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_city ON pets(city);

CREATE INDEX idx_pet_images_pet_id ON pet_images(pet_id);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_pet_id ON reservations(pet_id);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);

CREATE INDEX idx_questionnaire_user_id ON questionnaire_responses(user_id);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

CREATE INDEX idx_notifications_shelter_id ON notifications(shelter_id);
CREATE INDEX idx_notifications_reservation_id ON notifications(reservation_id);
CREATE INDEX idx_notifications_status ON notifications(status);

CREATE INDEX idx_pet_statistics_pet_id ON pet_statistics(pet_id);
CREATE INDEX idx_pet_statistics_date ON pet_statistics(date);

CREATE INDEX idx_favourites_user_id ON favourites(user_id);
CREATE INDEX idx_favourites_pet_id ON favourites(pet_id);