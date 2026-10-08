# CubeGo: Open-World Racing & Adventure

A 3D open-world game inspired by GTA, built with Three.js. Drive, walk, collect coins, complete missions, and explore a vibrant world with a dynamic minimap and modular gameplay systems.

## 🎮 Features

### 🚗 Vehicle & Character System
- **Drive and Walk**: Seamlessly switch between car and on-foot character.
- **Character Abilities**: Walk, sprint, jump, enter/exit vehicles with smooth animations.
- **Car Physics**: Acceleration, deceleration, car-like turning, and nitro boost.
- **Camera**: Third-person camera follows both car and character, with smooth transitions.

### 🗺️ World & Navigation
- **Circular Road & Side Paths**: Main road, pond, and demo side paths for exploration.
- **Dynamic Environment**: Trees, bushes, rocks, and a central pond with animated props.
- **Minimap**: GTA-style, always north-up, shows roads, pond, side paths, coins, player, and mission markers. Navigate using only the minimap!

### 🪙 Missions & Collectibles
- **GTA-Style Missions**: MissionManager cycles through objectives (drive to marker, collect coins, chase AI car, etc.)
- **Coin Collection**: Collect coins as car or character; tracked for mission progress.
- **Mission UI**: Animated overlays, mission complete transitions, and clear progress feedback.

### 🖥️ User Interface
- **Speedometer & Nitro Meter**: Live updates, digital style, and visual effects.
- **Mission Text**: Stylish overlays, only visible during gameplay.
- **Menu**: Start, customize, and color selection for vehicles.

## 🛠️ Technical Overview

- **Three.js**: 3D rendering, scene, camera, and physics.
- **Modular Classes**: Car, Character, Game, GameState, MissionManager, MiniMap, etc.
- **Modern JavaScript (ES6+)**: Clean, modular codebase.
- **HTML5/CSS3**: Responsive, animated UI overlays.

## 🚀 Installation & Running

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CubeGO
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npm start
   ```
4. **Open the game**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Controls

### Car Controls
- **W / Up Arrow**: Accelerate
- **S / Down Arrow**: Brake/Reverse
- **A / Left Arrow**: Steer Left
- **D / Right Arrow**: Steer Right
- **Shift**: Nitro Boost
- **Space**: Handbrake
- **E**: Enter/Exit Vehicle

### Character Controls
- **WASD**: Move (relative to camera)
- **Shift**: Sprint
- **Space**: Jump
- **E**: Enter/Exit Vehicle

## 🏆 Gameplay Tips
- Use the **minimap** to navigate: roads, pond, coins, and mission markers are all visible.
- Complete missions for progression; new missions start automatically.
- Collect coins as either the car or the character.
- Use nitro for speed boosts (watch the nitro meter!).

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 