import * as THREE from 'three';

export class MiniMap {
    constructor(game) {
        this.game = game;
        this.size = 220; // Larger minimap for clarity
        this.margin = 20;
        this.scale = 0.9 * (this.size / 300); // World units to minimap scale (tuned for your map)
        this.roadInner = 75;
        this.roadOuter = 112.5;
        this.pondRadius = 30;
        this.init();
    }

    init() {
        // Container
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = `${this.margin}px`;
        this.container.style.right = `${this.margin}px`;
        this.container.style.width = `${this.size}px`;
        this.container.style.height = `${this.size}px`;
        this.container.style.background = 'rgba(0,0,0,0.85)';
        this.container.style.borderRadius = '50%';
        this.container.style.border = '4px solid #FFD700';
        this.container.style.boxShadow = '0 0 30px #FFD70088';
        this.container.style.overflow = 'hidden';
        this.container.style.zIndex = '100';
        document.body.appendChild(this.container);

        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Compass
        this.addCompass();
    }

    addCompass() {
        const compass = document.createElement('div');
        compass.style.position = 'absolute';
        compass.style.top = '10px';
        compass.style.left = '50%';
        compass.style.transform = 'translateX(-50%)';
        compass.style.color = '#FFD700';
        compass.style.fontSize = '16px';
        compass.style.fontWeight = 'bold';
        compass.style.textShadow = '0 0 5px #000';
        compass.innerHTML = 'N';
        this.container.appendChild(compass);
    }

    worldToMini(x, z, playerPos) {
        // Center player in minimap, north-up
        const dx = x - playerPos.x;
        const dz = z - playerPos.z;
        return {
            x: this.size/2 + dx * this.scale,
            y: this.size/2 + dz * this.scale
        };
    }

    update() {
        if (!this.game.isGameStarted) return;
        this.ctx.clearRect(0, 0, this.size, this.size);
        // Draw background
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.size/2, this.size/2, this.size/2, 0, Math.PI*2);
        this.ctx.closePath();
        this.ctx.clip();
        this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
        this.ctx.fillRect(0,0,this.size,this.size);
        this.ctx.restore();

        // Get player position
        const playerPos = this.game.activeVehicle ? this.game.activeVehicle.carGroup.position : this.game.character.characterGroup.position;
        const playerRot = this.game.activeVehicle ? this.game.activeVehicle.carGroup.rotation.y : this.game.character.characterGroup.rotation.y;

        // Draw pond
        this.drawCircleWorld(0, 0, this.pondRadius, '#4fc3f7', 0.7);
        // Draw main road (as thick ring)
        this.drawRoadRing(0, 0, this.roadInner, this.roadOuter, '#444', '#fff');
        // Draw demo side paths
        this.drawSidePaths();
        // Draw coins
        this.drawCoins(playerPos);
        // Draw mission marker
        if (this.game.missionManager && this.game.missionManager.marker) {
            this.drawMarker(this.game.missionManager.marker.position, playerPos);
        }
        // Draw player (arrow, always north-up)
        this.drawPlayer(playerRot);
    }

    drawCircleWorld(x, z, radius, color, alpha=1) {
        // Draw a circle in world coords
        const playerPos = this.game.activeVehicle ? this.game.activeVehicle.carGroup.position : this.game.character.characterGroup.position;
        const center = this.worldToMini(x, z, playerPos);
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius * this.scale, 0, Math.PI*2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.restore();
    }

    drawRoadRing(x, z, inner, outer, roadColor, lineColor) {
        // Draw thick road ring
        const playerPos = this.game.activeVehicle ? this.game.activeVehicle.carGroup.position : this.game.character.characterGroup.position;
        const center = this.worldToMini(x, z, playerPos);
        this.ctx.save();
        // Outer
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, outer * this.scale, 0, Math.PI*2);
        this.ctx.fillStyle = roadColor;
        this.ctx.globalAlpha = 0.95;
        this.ctx.fill();
        // Inner (cut out)
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, inner * this.scale, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        // Center line
        this.ctx.setLineDash([8, 8]);
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, ((inner+outer)/2) * this.scale, 0, Math.PI*2);
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    drawSidePaths() {
        // Demo: 4 dirt paths from pond to road
        const playerPos = this.game.activeVehicle ? this.game.activeVehicle.carGroup.position : this.game.character.characterGroup.position;
        const center = this.worldToMini(0, 0, playerPos);
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const r1 = this.pondRadius * this.scale;
            const r2 = this.roadInner * this.scale;
            const x1 = center.x + Math.cos(angle) * r1;
            const y1 = center.y + Math.sin(angle) * r1;
            const x2 = center.x + Math.cos(angle) * r2;
            const y2 = center.y + Math.sin(angle) * r2;
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = '#b97a56';
            this.ctx.lineWidth = 7;
            this.ctx.globalAlpha = 0.7;
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    drawCoins(playerPos) {
        if (!this.game.gameState) return;
        this.game.gameState.coins.forEach(coin => {
            if (!coin.collected) {
                const pos = this.worldToMini(coin.position.x, coin.position.z, playerPos);
                // Glow
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 10, 0, Math.PI*2);
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
                this.ctx.fill();
                // Coin
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 6, 0, Math.PI*2);
                this.ctx.fillStyle = '#FFD700';
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 8;
                this.ctx.fill();
                this.ctx.restore();
            }
        });
    }

    drawMarker(markerPos, playerPos) {
        const pos = this.worldToMini(markerPos.x, markerPos.z, playerPos);
        // Red flag
        this.ctx.save();
        // Flag pole
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x, pos.y - 18);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        // Flag
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y - 18);
        this.ctx.lineTo(pos.x + 10, pos.y - 13);
        this.ctx.lineTo(pos.x, pos.y - 8);
        this.ctx.closePath();
        this.ctx.fillStyle = '#FF2222';
        this.ctx.shadowColor = '#FF2222';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        // Glow
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y - 13, 14, 0, Math.PI*2);
        this.ctx.fillStyle = 'rgba(255,0,0,0.15)';
        this.ctx.shadowBlur = 0;
        this.ctx.fill();
        this.ctx.restore();
    }

    drawPlayer(playerRot) {
        // Draw player as a green arrow, always north-up
        const center = {x: this.size/2, y: this.size/2};
        this.ctx.save();
        // Arrow body
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(0); // North-up, do not rotate with player
        this.ctx.beginPath();
        this.ctx.moveTo(0, -14);
        this.ctx.lineTo(-7, 8);
        this.ctx.lineTo(0, 4);
        this.ctx.lineTo(7, 8);
        this.ctx.closePath();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.shadowColor = '#00FF00';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        // Outline
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#fff';
        this.ctx.shadowBlur = 0;
        this.ctx.stroke();
        this.ctx.restore();
    }

    show() {
        this.container.style.display = 'block';
    }
    hide() {
        this.container.style.display = 'none';
    }
} 