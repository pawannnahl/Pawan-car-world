export class WaveManager {
    constructor(enemyManager) {
        this.enemyManager = enemyManager;
        this.currentWave = 0;
        this.isWaveInProgress = false;
        this.waveStartDelay = 5; // seconds
        this.waveTimer = 0;
        this.player = null;
    }

    setPlayer(player) {
        this.player = player;
    }

    async startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.isWaveInProgress = true;
        this.waveTimer = 0;

        // Update wave indicator
        const waveIndicator = document.getElementById('wave-indicator');
        waveIndicator.textContent = `Wave: ${waveNumber}`;

        // Spawn enemies for this wave
        this.enemyManager.spawnWave(waveNumber, this.player.model.position);
    }

    update(deltaTime) {
        if (!this.isWaveInProgress) return;

        this.waveTimer += deltaTime;

        // Check if all enemies are defeated
        if (this.enemyManager.enemies.size === 0) {
            this.isWaveInProgress = false;
            
            // Start next wave after delay
            setTimeout(() => {
                this.startWave(this.currentWave + 1);
            }, this.waveStartDelay * 1000);
        }
    }

    getWaveDifficulty() {
        return {
            enemyCount: Math.min(5 + this.currentWave * 2, 20),
            enemyHealthMultiplier: 1 + (this.currentWave - 1) * 0.1,
            enemySpeedMultiplier: 1 + (this.currentWave - 1) * 0.05,
            enemyDamageMultiplier: 1 + (this.currentWave - 1) * 0.1
        };
    }

    isBossWave() {
        return this.currentWave % 5 === 0;
    }
} 