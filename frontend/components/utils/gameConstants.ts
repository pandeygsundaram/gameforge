export const GAME_CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 700,
    WINNING_SCORE: 5,
    FRUIT_SIZE: 80,
    SWORD_WIDTH: 12,      // Wider blade
    SWORD_HEIGHT: 200,    // Longer sword
    SWORD_HANDLE: 40      // Handle length
  };
  
  export const COLORS = {
    BACKGROUND: '#14243e',
    PLAYER1_SIDE: '#ff6b6b',
    PLAYER2_SIDE: '#4ecdc4',
    CENTER_LINE: '#ffffff',
    SWORD_BLADE: '#e6e6fa',
    SWORD_HILT: '#8b4513'
  };
  
  export const FRUITS = [
    'apple', 'orange', 'banana', 'grapes', 'strawberry',
    'kiwi', 'peach', 'cherries', 'mango', 'pineapple'
  ];
  
  export const PHYSICS = {
    GRAVITY: 0.3,
    BOUNCE_MIN: 15,
    BOUNCE_MAX: 25,
    SPIN_MIN: 2,
    SPIN_MAX: 4
  };