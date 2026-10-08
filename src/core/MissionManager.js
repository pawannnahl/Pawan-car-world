import * as THREE from 'three';

export class MissionManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.marker = null;
        this.markerRadius = 3;
        this.missionUI = null;
        this.completionOverlay = null;
        this.missionIndex = 0;
        this.missions = [
            { type: 'driveToMarker', description: 'Drive to the marker!' },
            { type: 'collectCoins', description: 'Collect 5 coins!' },
            { type: 'driveToMarker', description: 'Drive to the next marker!' },
            { type: 'chaseAICar', description: 'Chase the AI car!' },
            { type: 'driveToMarker', description: 'Final marker: Drive to win!' }
        ];
        this.coinsCollected = 0;
        this.coinsTarget = 5;
        this.initMarker();
        this.initUI();
        this.initCompletionOverlay();
        this.setMission(0);
    }

    setMission(index) {
        this.missionIndex = index;
        this.active = true;
        this.coinsCollected = 0;
        if (this.missions[index].type === 'driveToMarker') {
            this.marker.visible = true;
            this.marker.position.copy(this.getRandomMarkerPosition());
        } else {
            this.marker.visible = false;
        }
        this.updateMissionText();
        
        // Only show mission UI if game is started
        if (this.game.isGameStarted) {
            this.missionUI.style.display = 'block';
        }
    }

    updateMissionText() {
        const mission = this.missions[this.missionIndex];
        let displayText = '';
        
        switch(mission.type) {
            case 'driveToMarker':
                displayText = `🚗 MISSION: ${mission.description}`;
                break;
            case 'collectCoins':
                displayText = `💰 MISSION: ${mission.description} (${this.coinsCollected}/${this.coinsTarget})`;
                break;
            case 'chaseAICar':
                displayText = `🏎️ MISSION: ${mission.description}`;
                break;
            default:
                displayText = `🎯 MISSION: ${mission.description}`;
        }

        this.missionUI.textContent = displayText;
        this.missionUI.style.animation = 'none';
        this.missionUI.offsetHeight; // Trigger reflow
        this.missionUI.style.animation = 'missionPulse 2s infinite';
    }

    initMarker() {
        // Create a glowing sphere as the marker
        const geometry = new THREE.SphereGeometry(1, 24, 24);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffff00,
            emissiveIntensity: 1.5,
            metalness: 0.3,
            roughness: 0.2
        });
        this.marker = new THREE.Mesh(geometry, material);
        this.marker.castShadow = true;
        this.marker.position.copy(this.getRandomMarkerPosition());
        this.game.scene.add(this.marker);
    }

    getRandomMarkerPosition() {
        // Place marker somewhere on the road (not in pond)
        const minRadius = 40;
        const maxRadius = 120;
        let pos;
        do {
            const angle = Math.random() * Math.PI * 2;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            pos = new THREE.Vector3(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius
            );
        } while (pos.length() < 35); // Avoid pond
        return pos;
    }

    initUI() {
        this.missionUI = document.createElement('div');
        this.missionUI.style.position = 'absolute';
        this.missionUI.style.top = '60px';
        this.missionUI.style.left = '50%';
        this.missionUI.style.transform = 'translateX(-50%)';
        this.missionUI.style.fontSize = '32px';
        this.missionUI.style.fontWeight = 'bold';
        this.missionUI.style.color = '#FFD700';
        this.missionUI.style.textShadow = '2px 2px 8px #000';
        this.missionUI.style.zIndex = '100';
        this.missionUI.style.pointerEvents = 'none';
        this.missionUI.style.padding = '15px 30px';
        this.missionUI.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.missionUI.style.borderRadius = '10px';
        this.missionUI.style.border = '2px solid #FFD700';
        this.missionUI.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
        this.missionUI.style.fontFamily = 'Arial, sans-serif';
        this.missionUI.style.letterSpacing = '1px';
        this.missionUI.style.transition = 'all 0.3s ease';
        this.missionUI.style.backdropFilter = 'blur(5px)';
        this.missionUI.style.animation = 'missionPulse 2s infinite';
        this.missionUI.style.display = 'none'; // Initially hidden

        // Add the animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes missionPulse {
                0% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
                100% { transform: translateX(-50%) scale(1); }
            }
            @keyframes missionGlow {
                0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
                50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
                100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(this.missionUI);
    }

    initCompletionOverlay() {
        this.completionOverlay = document.createElement('div');
        this.completionOverlay.style.position = 'fixed';
        this.completionOverlay.style.top = '50%';
        this.completionOverlay.style.left = '50%';
        this.completionOverlay.style.transform = 'translate(-50%, -50%)';
        this.completionOverlay.style.fontSize = '64px';
        this.completionOverlay.style.fontWeight = 'bold';
        this.completionOverlay.style.color = '#00ff88';
        this.completionOverlay.style.textShadow = '4px 4px 16px #000, 0 0 32px #00ff88';
        this.completionOverlay.style.background = 'rgba(0,0,0,0.7)';
        this.completionOverlay.style.padding = '40px 80px';
        this.completionOverlay.style.borderRadius = '20px';
        this.completionOverlay.style.opacity = '0';
        this.completionOverlay.style.transition = 'opacity 0.5s';
        this.completionOverlay.style.zIndex = '200';
        this.completionOverlay.style.pointerEvents = 'none';
        this.completionOverlay.innerText = 'MISSION COMPLETE!';
        document.body.appendChild(this.completionOverlay);
    }

    showCompletionOverlay() {
        this.completionOverlay.style.opacity = '1';
        this.completionOverlay.style.pointerEvents = 'auto';
        this.completionOverlay.style.animation = 'missionGlow 1s infinite';
        
        setTimeout(() => {
            this.completionOverlay.style.opacity = '0';
            this.completionOverlay.style.pointerEvents = 'none';
            this.completionOverlay.style.animation = 'none';
        }, 1500);
    }

    update() {
        if (!this.active || !this.game.car) return;
        const mission = this.missions[this.missionIndex];
        if (mission.type === 'driveToMarker') {
            const carPos = this.game.car.carGroup.position;
            const markerPos = this.marker.position;
            const dist = carPos.distanceTo(markerPos);
            if (dist < this.markerRadius) {
                this.completeMission();
            }
        } else if (mission.type === 'collectCoins') {
            // For now, just simulate coin collection for demo
            // In a real game, hook into coin collection logic
            if (this.coinsCollected < this.coinsTarget) {
                this.missionUI.textContent = `Mission: Collect ${this.coinsTarget} coins (${this.coinsCollected}/${this.coinsTarget})`;
            } else {
                this.completeMission();
            }
        } else if (mission.type === 'chaseAICar') {
            // Stub: Show as complete after 5 seconds for demo
            if (!this.chaseTimer) this.chaseTimer = Date.now();
            if (Date.now() - this.chaseTimer > 5000) {
                this.completeMission();
                this.chaseTimer = null;
            }
        }
    }

    completeMission() {
        this.active = false;
        this.marker.visible = false;
        this.showCompletionOverlay();
        setTimeout(() => {
            // Advance to next mission or loop
            this.missionIndex = (this.missionIndex + 1) % this.missions.length;
            this.setMission(this.missionIndex);
        }, 1800);
    }

    incrementCoinMission() {
        if (this.missions[this.missionIndex].type === 'collectCoins') {
            console.log('MissionManager: Incrementing coin count from', this.coinsCollected, 'to', this.coinsCollected + 1);
            this.coinsCollected++;
            // Update mission text immediately
            this.missionUI.textContent = `Mission: Collect ${this.coinsTarget} coins (${this.coinsCollected}/${this.coinsTarget})`;
        }
    }

    // Add method to handle game start
    onGameStart() {
        if (this.active) {
            this.missionUI.style.display = 'block';
        }
    }

    // Add method to handle game end/pause
    onGameEnd() {
        this.missionUI.style.display = 'none';
    }
} 