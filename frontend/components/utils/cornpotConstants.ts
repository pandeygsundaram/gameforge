export const CORNPOT_CONFIG = {
    CANVAS_WIDTH: 1400,
    CANVAS_HEIGHT: 800,
    MAX_ROUNDS: 10,
    SACK_SIZE: 15,
    POT_WIDTH: 180,
    POT_HEIGHT: 180
};

export const CORNPOT_COLORS = {
    SKY: '#87ceeb',
    GROUND: '#8b4513',
    PLATFORM: '#8b4513',
    POT: '#8b4513',
    POT_RIM: '#654321',
    SACK: '#f5deb3',
    SACK_TIE: '#8b4513',
    TRAJECTORY: '#ffff00',
    UI_BG: 'rgba(0, 0, 0, 0.8)',
    POWER_BG: '#323232',
    POWER_BAR: '#00ff00'
};

export const CORNPOT_PHYSICS = {
    GRAVITY: 400,
    MIN_POWER: 0.2,
    MAX_POWER: 0.8,
    VELOCITY_MULTIPLIER: 800,
    TRAIL_INTERVAL: 0.08,
    TRAIL_LIFE: 0.6
};


export const ANIMATION_ELEMENTS = {
    BIRDS: {
        COUNT: 3,
        SPAWN_INTERVAL: 8000, // 8 seconds
        SPEED: { min: 50, max: 100 },
        HEIGHT: { min: 100, max: 250 },
        SIZE: 8
    },
    CLOUDS: {
        COUNT: 4,
        SPEED: { min: 10, max: 25 },
        HEIGHT: { min: 50, max: 200 },
        SIZE: { min: 40, max: 80 }
    },
    GRASS: {
        COUNT: 20,
        SWAY_SPEED: 2,
        SWAY_AMOUNT: 3
    },
    BASKET: {
        WEAVE_LINES: 6,
        RIM_THICKNESS: 8,
        HANDLE_WIDTH: 12
    }
};