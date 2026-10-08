export class GameState {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.coins = [];
        this.coinsCollected = 0;
        this.totalCoins = 20;
        this.isGameStarted = false;
        this.setupCoins();
        this.gameOver = false;
        this.coinValue = 100;
        this.lastCoinCollectionTime = 0; // Add cooldown tracking
    }

    startGame() {
        console.log('GameState: Starting game...');
        this.isGameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.coinsCollected = 0;
        // Reset coins
        this.coins.forEach(coin => coin.collected = false);
        console.log('GameState: Game started successfully');
    }

    setupCoins() {
        // Create a serpentine pattern of coins
        const numCoins = 20;
        const trackRadius = 55;
        const width = 10; // Width of the serpentine pattern
        
        for (let i = 0; i < numCoins; i++) {
            const progress = i / numCoins;
            const angle = progress * Math.PI * 4; // Two full rotations for serpentine
            const radius = trackRadius + Math.sin(angle * 2) * (width / 2);
            
            this.coins.push({
                position: {
                    x: Math.cos(angle) * radius,
                    z: Math.sin(angle) * radius
                },
                collected: false
            });
        }
        this.totalCoins = this.coins.length;
    }

    update(deltaTime, carPosition, characterPosition) {
        if (this.gameOver) return;

        // Check for coin collection using either car or character position
        const position = carPosition || characterPosition;
        if (position) {
            this.checkCoinCollection(position);
        }
    }

    checkCoinCollection(position) {
        const currentTime = Date.now();
        const COOLDOWN = 500; // 500ms cooldown between coin collections

        this.coins.forEach(coin => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(position.x - coin.position.x, 2) +
                    Math.pow(position.z - coin.position.z, 2)
                );

                if (distance < 3 && (currentTime - this.lastCoinCollectionTime) > COOLDOWN) { // Collection radius with cooldown
                    console.log('Coin collected! Distance:', distance);
                    coin.collected = true;
                    this.coinsCollected++;
                    this.score += this.coinValue;
                    this.lastCoinCollectionTime = currentTime;
                    // Notify MissionManager about coin collection
                    if (this.game && this.game.missionManager) {
                        console.log('Notifying mission manager of coin collection');
                        this.game.missionManager.incrementCoinMission();
                    }
                }
            }
        });

        // Check if all coins are collected
        if (this.coinsCollected === this.totalCoins) {
            this.gameOver = true;
        }
    }

    getScore() {
        return this.score;
    }

    getProgress() {
        return (this.coinsCollected / this.totalCoins) * 100;
    }

    isGameOver() {
        return this.gameOver;
    }
} 