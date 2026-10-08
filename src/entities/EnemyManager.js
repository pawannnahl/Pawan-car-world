import * as THREE from 'three';
import { Enemy } from './Enemy';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = new Set();
        this.enemyTypes = {
            fast: {
                color: 0xff0000,
                size: 0.8,
                speed: 3,
                health: 30,
                damage: 10,
                score: 100
            },
            standard: {
                color: 0xff8800,
                size: 1,
                speed: 2,
                health: 50,
                damage: 15,
                score: 200
            },
            tank: {
                color: 0x880000,
                size: 1.5,
                speed: 1,
                health: 100,
                damage: 25,
                score: 300
            }
        };
    }

    spawnEnemy(type, position) {
        const enemyConfig = this.enemyTypes[type];
        if (!enemyConfig) return null;

        const enemy = new Enemy(
            this.scene,
            position,
            enemyConfig.color,
            enemyConfig.size,
            enemyConfig.speed,
            enemyConfig.health,
            enemyConfig.damage,
            enemyConfig.score
        );

        this.enemies.add(enemy);
        return enemy;
    }

    spawnWave(waveNumber, playerPosition) {
        const numEnemies = Math.min(5 + waveNumber * 2, 20);
        const spawnRadius = 30;
        
        for (let i = 0; i < numEnemies; i++) {
            // Calculate spawn position
            const angle = (i / numEnemies) * Math.PI * 2;
            const x = playerPosition.x + Math.cos(angle) * spawnRadius;
            const z = playerPosition.z + Math.sin(angle) * spawnRadius;
            
            // Determine enemy type based on wave number
            let type;
            if (waveNumber % 5 === 0) {
                // Boss wave
                type = 'tank';
            } else {
                const rand = Math.random();
                if (rand < 0.4) type = 'fast';
                else if (rand < 0.8) type = 'standard';
                else type = 'tank';
            }
            
            this.spawnEnemy(type, new THREE.Vector3(x, 1, z));
        }
    }

    update(deltaTime) {
        for (const enemy of this.enemies) {
            enemy.update(deltaTime);
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.scene.remove(enemy.model);
                this.enemies.delete(enemy);
            }
        }
    }

    getEnemiesInRange(position, range) {
        return Array.from(this.enemies).filter(enemy => 
            enemy.model.position.distanceTo(position) <= range
        );
    }

    clearEnemies() {
        for (const enemy of this.enemies) {
            this.scene.remove(enemy.model);
        }
        this.enemies.clear();
    }
} 