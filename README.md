# Flappy Spaceship

A space-themed Flappy Bird clone built with React Three Fiber, featuring a Saturn V rocket navigating through asteroid obstacles.

## Features

- 3D space environment with moving starfield background
- Saturn V rocket with realistic design
- Asteroid obstacles with physics-based collisions
- Score tracking system
- Game over and restart functionality

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flappy-spaceship.git
cd flappy-spaceship
```

2. Install dependencies:
```bash
npm install
```

## Running the Game

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

## How to Play

- Press the **Space** bar to make the rocket jump
- Navigate through the gaps between asteroids
- Each successful passage through an asteroid gap increases your score
- If you hit an asteroid, the game ends
- Press **Space** to restart after game over

## Controls

- **Space**: Jump/Restart game
- The rocket automatically falls due to gravity
- Stay within the top and bottom boundaries

## Technologies Used

- React
- Three.js
- React Three Fiber
- React Three Drei
- Vite

## Project Structure

```
flappy-spaceship/
├── src/
│   ├── App.jsx        # Main game component
│   ├── main.jsx       # Application entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── package.json       # Project dependencies
└── vite.config.js     # Vite configuration
```

## Development

To modify the game, you can adjust various parameters in `App.jsx`:

- `GRAVITY`: Controls how fast the rocket falls
- `JUMP_FORCE`: Controls how high the rocket jumps
- `OBSTACLE_SPEED`: Controls how fast the asteroids move
- `OBSTACLE_GAP`: Controls the size of the gap between asteroids
- `OBSTACLE_SPAWN_INTERVAL`: Controls how frequently new obstacles appear

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Flappy Bird
- Built with React Three Fiber
- Saturn V rocket design based on NASA's iconic spacecraft
