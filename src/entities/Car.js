import * as THREE from 'three';
import { InputHandler } from '../core/InputHandler';

export class Car {
    constructor(game, camera) {
        this.game = game; // Store reference to game instance
        this.camera = camera;
        this.speed = 0;
        this.maxSpeed = 30;
        this.baseSpeed = 12;
        this.acceleration = 0.3;
        this.deceleration = 0.2;
        this.steeringAngle = 0;
        this.maxSteeringAngle = Math.PI / 6;
        this.steeringSpeed = 0.015;
        this.steeringReturnSpeed = 0.02;
        this.wheelRotation = 0;
        this.boundaryRadius = 135;
        this.lastSteeringAngle = 0; // Track previous steering angle for smoothing
        this.steeringSmoothingFactor = 0.08; // Controls how quickly steering changes
        this.collisionRadius = 2; // Car's collision radius
        this.carGroup = new THREE.Group();
        this.carBodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000, // Default red color
            metalness: 0.6,
            roughness: 0.4
        });
        this.isBoosting = false;
        this.boostTime = 0;
        this.boostCooldown = 0;
        this.boostMultiplier = 1.25;
        this.boostDuration = 3;
        this.boostCooldownTime = 5;
        this.handling = 0.8;
        this.isDrifting = false;
        this.driftAngle = 0;
        this.driftSmokeGroup = new THREE.Group();
        this.carGroup.add(this.driftSmokeGroup);
        
        // Sensitivity settings
        this.sensitivitySettings = {
            steering: 1.0,      // Base steering sensitivity
            acceleration: 1.0,   // Acceleration sensitivity
            braking: 1.0,       // Braking sensitivity
            drift: 1.0,         // Drift sensitivity
            camera: 1.0         // Camera follow sensitivity
        };
        
        this.setupCarModel();
        this.setupCamera();
        this.inputHandler = new InputHandler();
        this.setupFlameEffect();
        this.setupDriftSmoke();
        
        // Set initial position on the track
        this.setInitialPosition();

        // Add combat-related properties
        this.health = 100;
        this.maxHealth = 100;
        this.attackPower = 20;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackDuration = 0.3;
        this.attackCooldownTime = 1.0;
        this.knockbackForce = 15;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1.0;
        
        // Add weapon properties
        this.hasWeapon = false;
        this.weaponType = null;
        this.weaponDamage = 0;
        this.weaponRange = 0;
        
        // Add combat effects
        this.setupCombatEffects();

        this.isDrowning = false;
        this.drownTimer = 0;
        this.drownDepth = -3;
    }

    setInitialPosition() {
        // Position the car on the track (between inner and outer radius)
        const trackRadius = 62.5; // Middle of the road (between 50 and 75)
        this.carGroup.position.set(trackRadius, 0.4, 0); // Added y position to lift car above ground
        this.carGroup.rotation.y = Math.PI / 2; // Face the car along the track
    }

    setupCarModel() {
        // Create car group to hold all parts
        this.carGroup = new THREE.Group();
        this.game.scene.add(this.carGroup);

        // Create car body
        this.createBody();
        this.createWheels();
        this.createWindows();
        this.createLights();
        this.createDetails();
    }

    createBody() {
        // Main body - more streamlined shape
        const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 4.2);
        const bodyMaterial = this.carBodyMaterial;
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.4;
        this.body.castShadow = true;
        this.carGroup.add(this.body);

        // Hood - more aerodynamic shape
        const hoodGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.4);
        const hoodMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.1
        });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 0.5, 1.3);
        hood.rotation.x = Math.PI / 12;
        this.body.add(hood);

        // Roof - more sporty shape
        const roofGeometry = new THREE.BoxGeometry(1.4, 0.5, 1.6);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.1
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 0.8, 0);
        this.body.add(roof);

        // Trunk - more streamlined
        const trunkGeometry = new THREE.BoxGeometry(1.6, 0.3, 0.8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 0.5, -1.3);
        trunk.rotation.x = -Math.PI / 12;
        this.body.add(trunk);
    }

    createWheels() {
        // Wheel geometry with more detail
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.7
        });
        
        // Wheel rims
        const rimGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.31, 16);
        const rimMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            metalness: 0.9,
            roughness: 0.1
        });
        
        this.wheels = [];
        const wheelPositions = [
            { x: -0.9, y: 0.4, z: 1.3 },
            { x: 0.9, y: 0.4, z: 1.3 },
            { x: -0.9, y: 0.4, z: -1.3 },
            { x: 0.9, y: 0.4, z: -1.3 }
        ];

        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            wheelGroup.add(wheel);

            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);
            
            this.body.add(wheelGroup);
            this.wheels.push(wheelGroup);
        });
    }

    createWindows() {
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.3, 0.6, 0.1);
        const glassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            metalness: 0.9,
            roughness: 0.1
        });
        const windshield = new THREE.Mesh(windshieldGeometry, glassMaterial);
        windshield.position.set(0, 0.9, 0.8);
        windshield.rotation.x = -Math.PI / 6;
        this.body.add(windshield);

        // Rear window
        const rearWindow = new THREE.Mesh(windshieldGeometry, glassMaterial);
        rearWindow.position.set(0, 0.9, -0.8);
        rearWindow.rotation.x = Math.PI / 6;
        this.body.add(rearWindow);

        // Side windows
        const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.5, 1.4);
        const leftWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        leftWindow.position.set(-0.7, 0.9, 0);
        this.body.add(leftWindow);

        const rightWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        rightWindow.position.set(0.7, 0.9, 0);
        this.body.add(rightWindow);
    }

    createLights() {
        // Headlights
        const headlightGeometry = new THREE.CircleGeometry(0.15, 32);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });

        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.5, 0.5, 2);
        leftHeadlight.rotation.y = 0;
        this.body.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.5, 0.5, 2);
        rightHeadlight.rotation.y = 0;
        this.body.add(rightHeadlight);

        // Taillights
        const taillightGeometry = new THREE.CircleGeometry(0.12, 32);
        const taillightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });

        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-0.5, 0.5, -2);
        this.body.add(leftTaillight);

        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(0.5, 0.5, -2);
        this.body.add(rightTaillight);
    }

    createDetails() {
        // Grille
        const grilleGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.1);
        const grilleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        const grille = new THREE.Mesh(grilleGeometry, grilleMaterial);
        grille.position.set(0, 0.6, 2);
        this.body.add(grille);

        // Bumpers
        const bumperGeometry = new THREE.BoxGeometry(2.2, 0.2, 0.3);
        const bumperMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.2
        });

        const frontBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
        frontBumper.position.set(0, 0.2, 2);
        this.body.add(frontBumper);

        const rearBumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
        rearBumper.position.set(0, 0.2, -2);
        this.body.add(rearBumper);
    }

    setupCamera() {
        // Position camera behind and above car
        this.cameraOffset = new THREE.Vector3(0, 3, 6);
        this.camera.position.copy(this.carGroup.position).add(this.cameraOffset);
        this.camera.lookAt(this.carGroup.position);
    }

    setupFlameEffect() {
        // Create flame group
        this.flameGroup = new THREE.Group();
        this.carGroup.add(this.flameGroup);

        // Create multiple flame particles with different sizes
        const flameCount = 20;
        const flameSizes = [0.15, 0.2, 0.25];
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        this.flames = [];
        for (let i = 0; i < flameCount; i++) {
            const size = flameSizes[Math.floor(Math.random() * flameSizes.length)];
            const flameGeometry = new THREE.ConeGeometry(size, size * 2, 8);
            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            
            // Position flames behind the car in a more natural pattern
            const angle = (i / flameCount) * Math.PI * 2;
            const radius = 0.3 + Math.random() * 0.2;
            flame.position.set(
                Math.cos(angle) * radius,
                0.2 + Math.random() * 0.2,
                2.2 + Math.random() * 0.3
            );
            
            // Random rotation for natural look
            flame.rotation.x = Math.PI + (Math.random() - 0.5) * 0.2;
            flame.rotation.z = (Math.random() - 0.5) * 0.2;
            
            this.flameGroup.add(flame);
            this.flames.push(flame);
        }

        // Create speed trail effect
        this.trailGroup = new THREE.Group();
        this.carGroup.add(this.trailGroup);
        
        const trailGeometry = new THREE.PlaneGeometry(0.5, 2);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.trails = [];
        for (let i = 0; i < 5; i++) {
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.set(0, 0.1, 2 + i * 0.5);
            trail.rotation.x = Math.PI / 2;
            this.trailGroup.add(trail);
            this.trails.push(trail);
        }

        // Initially hide the effects
        this.flameGroup.visible = false;
        this.trailGroup.visible = false;
    }

    setupDriftSmoke() {
        // Create smoke particles
        const smokeCount = 50; // Increased particle count for more fluid-like effect
        const smokeGeometry = new THREE.CircleGeometry(0.1, 8);
        const smokeMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        this.smokeParticles = [];
        for (let i = 0; i < smokeCount; i++) {
            const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
            smoke.visible = false;
            this.driftSmokeGroup.add(smoke);
            this.smokeParticles.push({
                mesh: smoke,
                life: 0,
                maxLife: 1.5 + Math.random() * 0.5, // Longer life for more fluid-like trails
                speed: 0.3 + Math.random() * 0.3,
                scale: 0.4 + Math.random() * 0.3,
                velocity: new THREE.Vector3(0, 0, 0),
                offset: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    0.1,
                    (Math.random() - 0.5) * 0.5
                )
            });
        }

        // Store last car position and rotation for velocity calculation
        this.lastCarPosition = new THREE.Vector3();
        this.lastCarRotation = new THREE.Euler();
        this.carVelocity = new THREE.Vector3();
        this.carAngularVelocity = new THREE.Euler();
    }

    updateFlameEffect(deltaTime) {
        const input = this.inputHandler.getInput();
        const isBoosting = input.shift && (input.forward || input.backward);
        const isMoving = Math.abs(this.speed) > 0.1;

        // Show/hide effects based on state
        this.flameGroup.visible = isBoosting;
        this.trailGroup.visible = isMoving;

        if (isBoosting) {
            // Animate flames
            this.flames.forEach((flame, index) => {
                // Subtle movement
                flame.position.x += (Math.random() - 0.5) * 0.05;
                flame.position.y += (Math.random() - 0.5) * 0.05;
                
                // Natural scale variation
                const scale = 0.8 + Math.random() * 0.3;
                flame.scale.set(scale, scale, scale);
                
                // More natural color variation
                const material = flame.material;
                const hue = 0.05 + Math.random() * 0.02; // Subtle orange to red
                const saturation = 0.9 + Math.random() * 0.1;
                const lightness = 0.5 + Math.random() * 0.1;
                material.color.setHSL(hue, saturation, lightness);
                material.opacity = 0.6 + Math.random() * 0.2;

                // Subtle rotation
                flame.rotation.z += (Math.random() - 0.5) * 0.1;
            });
        }

        if (isMoving) {
            // Animate speed trails
            this.trails.forEach((trail, index) => {
                const speed = Math.abs(this.speed) / this.maxSpeed;
                trail.material.opacity = 0.3 * speed;
                trail.material.color.setHSL(0.5 + speed * 0.1, 1, 0.5);
                trail.scale.y = 1 + speed;
            });
        }
    }

    updateDriftSmoke(deltaTime) {
        // Calculate car's linear and angular velocity
        this.carVelocity.subVectors(this.carGroup.position, this.lastCarPosition).divideScalar(deltaTime);
        this.carAngularVelocity.x = (this.carGroup.rotation.x - this.lastCarRotation.x) / deltaTime;
        this.carAngularVelocity.y = (this.carGroup.rotation.y - this.lastCarRotation.y) / deltaTime;
        this.carAngularVelocity.z = (this.carGroup.rotation.z - this.lastCarRotation.z) / deltaTime;

        // Store current position and rotation for next frame
        this.lastCarPosition.copy(this.carGroup.position);
        this.lastCarRotation.copy(this.carGroup.rotation);

        if (this.isDrifting) {
            // Calculate drift direction and intensity
            const driftDirection = new THREE.Vector3(0, 0, 1);
            driftDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.carGroup.rotation.y);
            
            // Calculate drift intensity based on speed and steering
            const driftIntensity = Math.abs(this.speed) * Math.abs(this.steeringAngle) / (this.maxSpeed * this.maxSteeringAngle);
            
            // Emit new smoke particles
            this.smokeParticles.forEach(particle => {
                if (particle.life <= 0) {
                    // Reset particle
                    particle.mesh.visible = true;
                    particle.life = particle.maxLife;
                    
                    // Position smoke behind the car based on drift direction
                    const offset = particle.offset.clone();
                    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.carGroup.rotation.y);
                    particle.mesh.position.copy(offset);
                    
                    // Initialize particle velocity based on car's movement
                    particle.velocity.copy(this.carVelocity);
                    particle.velocity.multiplyScalar(0.5); // Reduce initial velocity
                    
                    // Add drift velocity
                    const driftVelocity = driftDirection.clone().multiplyScalar(driftIntensity * 2);
                    particle.velocity.add(driftVelocity);
                    
                    // Add some randomness to the initial velocity
                    particle.velocity.x += (Math.random() - 0.5) * 0.5;
                    particle.velocity.z += (Math.random() - 0.5) * 0.5;
                    
                    particle.mesh.scale.set(0.1, 0.1, 0.1);
                }
            });
        }

        // Update all particles
        this.smokeParticles.forEach(particle => {
            if (particle.life > 0) {
                particle.life -= deltaTime;
                if (particle.life <= 0) {
                    particle.mesh.visible = false;
                } else {
                    // Update particle properties
                    const lifeRatio = particle.life / particle.maxLife;
                    
                    // Apply physics to particle
                    // Add car's angular velocity effect
                    const angularEffect = new THREE.Vector3(
                        this.carAngularVelocity.y * particle.mesh.position.z,
                        0,
                        -this.carAngularVelocity.y * particle.mesh.position.x
                    );
                    particle.velocity.add(angularEffect.multiplyScalar(deltaTime));
                    
                    // Add upward movement and drag
                    particle.velocity.y += particle.speed * deltaTime;
                    particle.velocity.multiplyScalar(0.98); // Air resistance
                    
                    // Update position based on velocity
                    particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
                    
                    // Add some turbulence
                    particle.velocity.x += (Math.random() - 0.5) * 0.1;
                    particle.velocity.z += (Math.random() - 0.5) * 0.1;
                    
                    // Scale and fade out
                    const scale = particle.scale * (1 - lifeRatio);
                    particle.mesh.scale.set(scale, scale, scale);
                    particle.mesh.material.opacity = 0.6 * lifeRatio;
                    
                    // Rotate particles based on velocity
                    const rotationSpeed = particle.velocity.length() * 2;
                    particle.mesh.rotation.z += rotationSpeed * deltaTime;
                }
            }
        });
    }

    update(deltaTime) {
        // Drown check
        if (this.checkDrowning()) {
            this.handleDrowning(deltaTime);
            return;
        }
        this.handleMovement(deltaTime);
        this.handleSteering(deltaTime);
        this.updateWheels(deltaTime);
        this.updateFlameEffect(deltaTime);
        this.updateDriftSmoke(deltaTime);
        
        // Check for collisions before updating position
        if (!this.checkCollisions()) {
        this.updateCamera();
        }
        
        this.checkBoundaries();

        // Add combat update
        this.handleCombat(deltaTime);
        
        // Update impact particles
        this.impactParticles.forEach(particle => {
            if (particle.life > 0) {
                particle.life -= deltaTime;
                if (particle.life <= 0) {
                    particle.mesh.visible = false;
                } else {
                    particle.mesh.position.add(
                        particle.velocity.clone().multiplyScalar(deltaTime)
                    );
                    particle.mesh.material.opacity = 0.8 * (particle.life / particle.maxLife);
                }
            }
        });
    }

    handleMovement(deltaTime) {
        const input = this.inputHandler.getInput();
        
        // Handle boost
        if (input.shift && this.boostCooldown <= 0 && !this.isBoosting && this.boostTime < this.boostDuration) {
            this.isBoosting = true;
            this.boostTime = 0;
            this.boostCooldown = this.boostCooldownTime;
        }

        // Nitro usage
        if (this.isBoosting) {
            this.boostTime += deltaTime;
            if (this.boostTime >= this.boostDuration) {
                this.isBoosting = false;
            }
        } else {
            // Always recharge nitro when not boosting
            if (this.boostTime > 0) {
                this.boostTime = Math.max(0, this.boostTime - deltaTime);
            }
        }

        if (this.boostCooldown > 0) {
            this.boostCooldown -= deltaTime;
        }
        
        // Set target speed based on input with sensitivity
        let targetSpeed = 0;
        if (input.forward) {
            const boostFactor = this.isBoosting ? this.boostMultiplier : 1;
            targetSpeed = this.baseSpeed * boostFactor * this.sensitivitySettings.acceleration;
        } else if (input.backward) {
            const boostFactor = this.isBoosting ? this.boostMultiplier : 1;
            targetSpeed = -this.baseSpeed * boostFactor * this.sensitivitySettings.acceleration;
        }

        // Smoother acceleration and deceleration with sensitivity
        if (targetSpeed !== 0) {
            const speedDiff = targetSpeed - this.speed;
            const accelerationFactor = this.isBoosting ? this.acceleration * 0.7 : this.acceleration;
            this.speed += speedDiff * accelerationFactor * this.sensitivitySettings.acceleration;
        } else {
            // Natural deceleration when no input
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.deceleration * this.sensitivitySettings.braking);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.deceleration * this.sensitivitySettings.braking);
            }
        }

        // Apply braking with sensitivity
        if (input.brake) {
            this.speed *= 0.95 * this.sensitivitySettings.braking;
        }

        // Apply movement
        const moveDistance = this.speed * deltaTime;
        const moveDirection = new THREE.Vector3(0, 0, -1);
        moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.carGroup.rotation.y);
        this.carGroup.position.add(moveDirection.multiplyScalar(moveDistance));
    }

    handleSteering(deltaTime) {
        const input = this.inputHandler.getInput();
        
        // Calculate target steering angle based on input with sensitivity
        let targetSteeringAngle = this.steeringAngle;
        if (input.left) {
            targetSteeringAngle = -this.maxSteeringAngle * this.sensitivitySettings.steering;
        } else if (input.right) {
            targetSteeringAngle = this.maxSteeringAngle * this.sensitivitySettings.steering;
        } else {
            targetSteeringAngle = 0;
        }

        // Calculate speed factor (0 to 1)
        const speedFactor = Math.abs(this.speed) / this.maxSpeed;
        
        // Check for drift conditions with sensitivity
        const isDrifting = input.brake && Math.abs(this.speed) > this.baseSpeed * 0.5 && 
                          (input.left || input.right);
        
        if (isDrifting && !this.isDrifting) {
            this.isDrifting = true;
            this.driftAngle = this.carGroup.rotation.y;
        } else if (!isDrifting && this.isDrifting) {
            this.isDrifting = false;
        }

        // Adjust steering sensitivity based on speed, handling, and drift state
        const boostFactor = this.isBoosting ? 0.7 : 1;
        const driftFactor = this.isDrifting ? 1.5 * this.sensitivitySettings.drift : 1;
        const speedDependentSteeringSpeed = this.steeringSpeed * this.handling * 
                                          (1 - speedFactor * 0.8) * boostFactor * driftFactor;
        
        // Smoothly interpolate current steering angle towards target
        if (targetSteeringAngle !== this.steeringAngle) {
            const steeringDiff = targetSteeringAngle - this.steeringAngle;
            this.steeringAngle += steeringDiff * speedDependentSteeringSpeed;
        } else {
            // Return steering to center with speed-dependent return speed
            const returnSpeed = this.steeringReturnSpeed * (1 + speedFactor);
            if (this.steeringAngle > 0) {
                this.steeringAngle = Math.max(0, this.steeringAngle - returnSpeed);
            } else if (this.steeringAngle < 0) {
                this.steeringAngle = Math.min(0, this.steeringAngle + returnSpeed);
            }
        }

        // Apply steering to car rotation with improved speed-dependent handling
        const steeringFactor = Math.abs(this.speed) / this.maxSpeed;
        const steeringDirection = this.speed >= 0 ? -1 : 1;
        
        const minSteeringFactor = 0.25;
        const maxSteeringFactor = 0.7;
        const adjustedSteeringFactor = Math.min(
            maxSteeringFactor,
            Math.max(minSteeringFactor, steeringFactor)
        );

        // Apply steering with sensitivity
        const boostSteeringFactor = this.isBoosting ? 0.8 : 1;
        const driftSteeringFactor = this.isDrifting ? 1.2 * this.sensitivitySettings.drift : 1;
        const targetRotation = this.steeringAngle * adjustedSteeringFactor * 
                             steeringDirection * this.handling * 
                             boostSteeringFactor * driftSteeringFactor;
        
        this.carGroup.rotation.y += targetRotation * (1 - speedFactor * 0.6);

        // Apply drift angle with sensitivity
        if (this.isDrifting) {
            this.carGroup.rotation.y = this.driftAngle + 
                                     (this.steeringAngle * 0.5 * steeringDirection * this.sensitivitySettings.drift);
        }
    }

    updateWheels(deltaTime) {
        // Rotate wheels based on speed
        this.wheelRotation += this.speed * deltaTime;
        this.wheels.forEach(wheelGroup => {
            wheelGroup.rotation.x = this.wheelRotation;
        });

        // Apply steering angle to front wheels
        const wheelSteeringAngle = this.speed >= 0 ? -this.steeringAngle : this.steeringAngle;
        this.wheels[0].rotation.y = wheelSteeringAngle;
        this.wheels[1].rotation.y = wheelSteeringAngle;
    }

    updateCamera() {
        // Update camera position to follow car with sensitivity
        const idealOffset = this.cameraOffset.clone();
        idealOffset.applyQuaternion(this.carGroup.quaternion);
        const idealPosition = this.carGroup.position.clone().add(idealOffset);
        
        // Apply camera sensitivity
        const lerpFactor = 0.1 * this.sensitivitySettings.camera;
        this.camera.position.lerp(idealPosition, lerpFactor);
        this.camera.lookAt(this.carGroup.position);
    }

    checkBoundaries() {
        // Calculate distance from center
        const distanceFromCenter = Math.sqrt(
            this.carGroup.position.x * this.carGroup.position.x +
            this.carGroup.position.z * this.carGroup.position.z
        );

        // If car is outside boundaries, push it back
        if (distanceFromCenter > this.boundaryRadius) {
            const angle = Math.atan2(this.carGroup.position.z, this.carGroup.position.x);
            this.carGroup.position.x = Math.cos(angle) * this.boundaryRadius;
            this.carGroup.position.z = Math.sin(angle) * this.boundaryRadius;
            
            // Reduce speed when hitting boundary
            this.speed *= 0.5;
        }
    }

    checkCollisions() {
        const carPosition = this.carGroup.position;
        const collisionObjects = this.game.getCollisionObjects(); // Use game instance instead of scene
        
        for (const obj of collisionObjects) {
            const distance = carPosition.distanceTo(obj.position);
            const minDistance = this.collisionRadius + obj.radius;
            
            if (distance < minDistance) {
                // Collision detected
                this.handleCollision(obj);
                return true;
            }
        }
        return false;
    }

    handleCollision(obj) {
        // Calculate collision response
        const collisionVector = new THREE.Vector3()
            .subVectors(this.carGroup.position, obj.position)
            .normalize();
        
        // Push car away from collision
        const pushDistance = (this.collisionRadius + obj.radius) - 
            this.carGroup.position.distanceTo(obj.position);
        this.carGroup.position.add(collisionVector.multiplyScalar(pushDistance));
        
        // Reduce speed based on collision
        this.speed *= 0.5;
        
        // Add some rotation based on collision angle
        const collisionAngle = Math.atan2(collisionVector.z, collisionVector.x);
        this.carGroup.rotation.y = collisionAngle;

        // Add visual feedback for collision
        this.showImpactEffect(this.carGroup.position.clone());
    }

    updateColor(color) {
        // Update the main car body color
        this.carBodyMaterial.color.set(color);
        
        // Update other car parts that should match the main color
        this.carGroup.children.forEach(part => {
            if (part.material && part.material !== this.carBodyMaterial) {
                // Only update parts that aren't windows, lights, or other special parts
                if (!part.material.emissive && !part.material.transparent) {
                    part.material.color.set(color);
                }
            }
        });
    }

    updateVehicle(newVehicle) {
        // Store current position and rotation
        const currentPosition = this.carGroup.position.clone();
        const currentRotation = this.carGroup.rotation.clone();

        // Remove old vehicle from scene
        this.game.scene.remove(this.carGroup);

        // Create new vehicle group
        this.carGroup = newVehicle;
        this.game.scene.add(this.carGroup);

        // Restore position and rotation
        this.carGroup.position.copy(currentPosition);
        this.carGroup.rotation.copy(currentRotation);

        // Update car body material reference
        let foundMaterial = false;
        this.carGroup.traverse((child) => {
            if (!foundMaterial && child.isMesh && child.material) {
                if (!child.material.emissive && !child.material.transparent) {
                    this.carBodyMaterial = child.material;
                    foundMaterial = true;
                }
            }
        });

        // Update wheels array
        this.wheels = [];
        this.carGroup.traverse((child) => {
            if (child.isMesh && child.geometry.type === 'CylinderGeometry') {
                this.wheels.push(child);
            }
        });

        // Update flame effect position
        if (this.flameGroup) {
            this.carGroup.add(this.flameGroup);
        }
    }

    updateStats(stats) {
        this.maxSpeed = stats.maxSpeed;
        this.baseSpeed = stats.baseSpeed;
        this.acceleration = stats.acceleration;
        this.deceleration = stats.deceleration;
        this.handling = stats.handling;
        this.boostMultiplier = stats.boostMultiplier;
        this.boostDuration = stats.boostDuration;
        this.boostCooldownTime = stats.boostCooldown;
    }

    handleCombat(deltaTime) {
        const input = this.inputHandler.getInput();
        
        // Handle attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Handle invulnerability
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
            }
        }
        
        // Handle attack input
        if (input.attack && this.attackCooldown <= 0) {
            this.isAttacking = true;
            this.attackCooldown = this.attackCooldownTime;
            
            // Create attack hitbox
            const attackDirection = new THREE.Vector3(0, 0, -1);
            attackDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.carGroup.rotation.y);
            
            const attackPosition = this.carGroup.position.clone().add(
                attackDirection.multiplyScalar(2)
            );
            
            // Check for hits
            const nearbyVehicles = this.game.getNearbyVehicles(attackPosition, 3);
            nearbyVehicles.forEach(vehicle => {
                if (vehicle !== this) {
                    this.dealDamage(vehicle);
                }
            });
            
            // Show attack effect
            this.showAttackEffect(attackPosition);
        }
        
        // Update attack state
        if (this.isAttacking) {
            this.attackDuration -= deltaTime;
            if (this.attackDuration <= 0) {
                this.isAttacking = false;
                this.attackDuration = 0.3;
            }
        }
    }

    dealDamage(target) {
        if (!target.isInvulnerable) {
            const damage = this.attackPower + (this.hasWeapon ? this.weaponDamage : 0);
            target.takeDamage(damage);
            
            // Apply knockback
            const knockbackDirection = new THREE.Vector3()
                .subVectors(target.carGroup.position, this.carGroup.position)
                .normalize();
            
            target.carGroup.position.add(
                knockbackDirection.multiplyScalar(this.knockbackForce)
            );
            
            // Show impact effect
            this.showImpactEffect(target.carGroup.position);
        }
    }

    takeDamage(amount) {
        if (!this.isInvulnerable) {
            this.health = Math.max(0, this.health - amount);
            this.isInvulnerable = true;
            this.invulnerabilityTime = this.invulnerabilityDuration;
            
            // Show damage effect
            this.showDamageEffect();
            
            // Check for death
            if (this.health <= 0) {
                this.handleDeath();
            }
        }
    }

    handleDeath() {
        // Trigger death animation
        this.carGroup.rotation.x = Math.PI / 2;
        this.speed = 0;
        
        // Notify game state
        this.game.gameState.handlePlayerDeath();
    }

    showAttackEffect(position) {
        // Create attack visual effect
        const effectGeometry = new THREE.CircleGeometry(1, 32);
        const effectMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
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

    showImpactEffect(position) {
        // Activate impact particles
        this.impactParticles.forEach(particle => {
            if (particle.life <= 0) {
                particle.mesh.visible = true;
                particle.life = particle.maxLife;
                particle.mesh.position.copy(position);
                particle.mesh.position.y = 0.5;
                
                // Random velocity
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 2;
                particle.velocity.set(
                    Math.cos(angle) * speed,
                    1 + Math.random(),
                    Math.sin(angle) * speed
                );
            }
        });
    }

    showDamageEffect() {
        // Flash the car red
        const originalColor = this.carBodyMaterial.color.clone();
        this.carBodyMaterial.color.set(0xff0000);
        
        setTimeout(() => {
            this.carBodyMaterial.color.copy(originalColor);
        }, 200);
    }

    // Add method to update sensitivity settings
    updateSensitivity(settings) {
        this.sensitivitySettings = {
            ...this.sensitivitySettings,
            ...settings
        };
    }

    // Add method to get current sensitivity settings
    getSensitivitySettings() {
        return { ...this.sensitivitySettings };
    }

    setupCombatEffects() {
        // Create impact effect group
        this.impactGroup = new THREE.Group();
        this.carGroup.add(this.impactGroup);
        
        // Create impact particles
        const impactCount = 20;
        const impactGeometry = new THREE.CircleGeometry(0.1, 8);
        const impactMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        this.impactParticles = [];
        for (let i = 0; i < impactCount; i++) {
            const impact = new THREE.Mesh(impactGeometry, impactMaterial);
            impact.visible = false;
            this.impactGroup.add(impact);
            this.impactParticles.push({
                mesh: impact,
                life: 0,
                maxLife: 0.5,
                velocity: new THREE.Vector3(0, 0, 0)
            });
        }
    }

    checkDrowning() {
        // Pond center is (0,0), radius is 30 (from Game.js)
        const pondRadius = 30;
        const x = this.carGroup.position.x;
        const z = this.carGroup.position.z;
        const dist = Math.sqrt(x * x + z * z);
        if (!this.isDrowning && dist < pondRadius) {
            this.isDrowning = true;
            this.drownTimer = 0;
            return true;
        }
        return this.isDrowning;
    }

    handleDrowning(deltaTime) {
        this.drownTimer += deltaTime;
        // Sink the car
        const sinkSpeed = 2.5; // units per second
        const minY = this.drownDepth;
        this.carGroup.position.y = Math.max(minY, this.carGroup.position.y - sinkSpeed * deltaTime);
        // Slow down
        this.speed *= 0.95;
        // Optionally, add bubbles or splash here
        // After 2 seconds, respawn
        if (this.drownTimer > 2) {
            this.respawnOnRoad();
            this.isDrowning = false;
            this.carGroup.position.y = 0.4;
            this.speed = 0;
        }
    }

    respawnOnRoad() {
        // Place car at a random point on the road (radius 90, away from pond)
        const roadRadius = 90;
        const angle = Math.random() * Math.PI * 2;
        this.carGroup.position.set(
            Math.cos(angle) * roadRadius,
            0.4,
            Math.sin(angle) * roadRadius
        );
        this.carGroup.rotation.y = angle + Math.PI / 2;
    }
} 