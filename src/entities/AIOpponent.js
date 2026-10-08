import * as THREE from 'three';

export class AIOpponent {
    constructor(game, position, difficulty = 'normal') {
        this.game = game;
        this.difficulty = difficulty;
        this.health = 100;
        this.aggression = this.getAggressionLevel();
        this.attackRange = 3;
        this.attackCooldown = 0;
        this.attackCooldownTime = 2;
        this.targetPlayer = null;
        this.isAttacking = false;
        
        // Create opponent vehicle
        this.createVehicle();
        this.vehicle.position.copy(position);
        this.game.scene.add(this.vehicle);
        
        // AI behavior parameters
        this.updateInterval = 0.1; // Update AI every 100ms
        this.lastUpdate = 0;
        this.targetPosition = new THREE.Vector3();
        this.avoidanceRadius = 5;
    }
    
    getAggressionLevel() {
        switch(this.difficulty) {
            case 'easy': return 0.3;
            case 'normal': return 0.6;
            case 'hard': return 0.9;
            default: return 0.6;
        }
    }
    
    createVehicle() {
        this.vehicle = new THREE.Group();
        
        // Create a more aggressive-looking vehicle
        const bodyGeometry = new THREE.BoxGeometry(1.8, 0.8, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        body.castShadow = true;
        this.vehicle.add(body);
        
        // Add spikes and aggressive details
        this.addSpikes(body);
        this.addWeapons(body);
        
        // Add wheels
        this.addWheels(body);
    }
    
    addSpikes(body) {
        const spikeGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
        const spikeMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.9,
            roughness: 0.1
        });
        
        // Add spikes along the sides
        for (let i = -1.5; i <= 1.5; i += 0.5) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(0.9, 0.4, i);
            spike.rotation.z = Math.PI / 2;
            body.add(spike);
            
            const spike2 = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike2.position.set(-0.9, 0.4, i);
            spike2.rotation.z = -Math.PI / 2;
            body.add(spike2);
        }
    }
    
    addWeapons(body) {
        // Add chains or other weapons
        const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const chainMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        chain.position.set(0, 0.6, -1.5);
        chain.rotation.x = Math.PI / 2;
        body.add(chain);
    }
    
    addWheels(body) {
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.7
        });
        
        const wheelPositions = [
            { x: -0.9, y: 0.4, z: 1.3 },
            { x: 0.9, y: 0.4, z: 1.3 },
            { x: -0.9, y: 0.4, z: -1.3 },
            { x: 0.9, y: 0.4, z: -1.3 }
        ];
        
        this.wheels = [];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            body.add(wheel);
            this.wheels.push(wheel);
        });
    }
    
    update(deltaTime) {
        // Update AI behavior at intervals
        this.lastUpdate += deltaTime;
        if (this.lastUpdate >= this.updateInterval) {
            this.updateAI();
            this.lastUpdate = 0;
        }
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Update vehicle position and rotation
        this.updateMovement(deltaTime);
    }
    
    updateAI() {
        // Find nearest player
        const players = this.game.getPlayers();
        let nearestPlayer = null;
        let minDistance = Infinity;
        
        players.forEach(player => {
            const distance = this.vehicle.position.distanceTo(player.carGroup.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = player;
            }
        });
        
        this.targetPlayer = nearestPlayer;
        
        // Decide whether to attack
        if (this.targetPlayer && minDistance < this.attackRange && this.attackCooldown <= 0) {
            if (Math.random() < this.aggression) {
                this.attack(this.targetPlayer);
            }
        }
        
        // Update target position for movement
        if (this.targetPlayer) {
            this.targetPosition.copy(this.targetPlayer.carGroup.position);
        }
    }
    
    updateMovement(deltaTime) {
        if (this.targetPlayer) {
            // Calculate direction to target
            const direction = new THREE.Vector3()
                .subVectors(this.targetPosition, this.vehicle.position)
                .normalize();
            
            // Move towards target
            const speed = 20 * deltaTime;
            this.vehicle.position.add(direction.multiplyScalar(speed));
            
            // Rotate towards target
            const targetRotation = Math.atan2(direction.x, direction.z);
            this.vehicle.rotation.y = targetRotation;
            
            // Update wheel rotation
            this.wheels.forEach(wheel => {
                wheel.rotation.x += speed * 2;
            });
        }
    }
    
    attack(target) {
        if (this.attackCooldown <= 0) {
            this.isAttacking = true;
            this.attackCooldown = this.attackCooldownTime;
            
            // Deal damage to target
            target.takeDamage(20);
            
            // Show attack effect
            this.showAttackEffect(target.carGroup.position);
            
            // Reset attack state
            setTimeout(() => {
                this.isAttacking = false;
            }, 300);
        }
    }
    
    showAttackEffect(position) {
        const effectGeometry = new THREE.CircleGeometry(1, 32);
        const effectMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const effect = new THREE.Mesh(effectGeometry, effectMaterial);
        effect.position.copy(position);
        effect.position.y = 0.5;
        this.game.scene.add(effect);
        
        // Animate and remove effect
        const duration = 0.3;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed < duration) {
                effect.scale.set(1 + elapsed * 2, 1 + elapsed * 2, 1);
                effect.material.opacity = 0.6 * (1 - elapsed / duration);
                requestAnimationFrame(animate);
            } else {
                this.game.scene.remove(effect);
            }
        };
        
        animate();
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        // Trigger death animation
        this.vehicle.rotation.x = Math.PI / 2;
        
        // Remove from scene after animation
        setTimeout(() => {
            this.game.scene.remove(this.vehicle);
            this.game.removeOpponent(this);
        }, 1000);
    }
} 