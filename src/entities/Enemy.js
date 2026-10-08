import * as THREE from 'three';

export class Enemy {
    constructor(scene, position, color, size, speed, health, damage, score) {
        this.scene = scene;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.speed = speed;
        this.score = score;
        this.attackRange = 1.5;
        this.attackCooldown = 1; // seconds
        this.attackTimer = 0;
        this.isAttacking = false;

        this.setupModel(position, color, size);
    }

    setupModel(position, color, size) {
        // Create enemy model
        const geometry = new THREE.BoxGeometry(size, size * 2, size);
        const material = new THREE.MeshStandardMaterial({ color });
        this.model = new THREE.Mesh(geometry, material);
        this.model.position.copy(position);
        this.model.castShadow = true;
        this.scene.add(this.model);

        // Create health bar
        this.healthBar = this.createHealthBar();
        this.model.add(this.healthBar);
    }

    createHealthBar() {
        const geometry = new THREE.PlaneGeometry(1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const healthBar = new THREE.Mesh(geometry, material);
        healthBar.position.y = 2.2;
        healthBar.rotation.x = -Math.PI / 2;
        return healthBar;
    }

    update(deltaTime) {
        // Update attack timer
        if (this.attackTimer > 0) {
            this.attackTimer -= deltaTime;
        }

        // Update health bar
        this.updateHealthBar();
    }

    moveTowards(targetPosition) {
        const direction = new THREE.Vector3()
            .subVectors(targetPosition, this.model.position)
            .normalize();

        // Move towards target
        this.model.position.add(direction.multiplyScalar(this.speed * 0.016));

        // Rotate to face target
        const targetRotation = Math.atan2(direction.x, direction.z);
        this.model.rotation.y = targetRotation;
    }

    attack(target) {
        if (this.attackTimer <= 0) {
            this.isAttacking = true;
            this.attackTimer = this.attackCooldown;
            
            // Deal damage to target
            target.takeDamage(this.damage);
            
            // Reset attack state
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Visual feedback for damage
        this.model.material.color.setHex(0xffffff);
        setTimeout(() => {
            this.model.material.color.setHex(this.model.material.color.getHex());
        }, 100);
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.scale.x = healthPercent;
        this.healthBar.position.x = (1 - healthPercent) * -0.5;
    }

    isInRange(targetPosition) {
        return this.model.position.distanceTo(targetPosition) <= this.attackRange;
    }
} 