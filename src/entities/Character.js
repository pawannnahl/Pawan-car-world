import * as THREE from 'three';
import { InputHandler } from '../core/InputHandler';

export class Character {
    constructor(game, camera) {
        this.game = game;
        this.camera = camera;
        this.speed = 0;
        this.maxSpeed = 10;
        this.baseSpeed = 5;
        this.acceleration = 0.3;
        this.deceleration = 0.2;
        this.jumpForce = 15;
        this.gravity = 30;
        this.verticalVelocity = 0;
        this.isGrounded = true;
        this.isSprinting = false;
        this.sprintMultiplier = 1.5;
        this.isInVehicle = false;
        this.currentVehicle = null;
        this.characterGroup = new THREE.Group();
        this.characterHeight = 1.1;
        this.characterRadius = 0.21;
        
        // Camera settings
        this.targetCameraRotation = undefined;
        this.cameraRotationSpeed = 0.1;
        this.cameraDistance = 4;
        this.cameraHeight = 2;
        
        // Animation states
        this.isEnteringVehicle = false;
        this.isExitingVehicle = false;
        this.animationProgress = 0;
        this.animationDuration = 0.5;
        this.animationStartPosition = new THREE.Vector3();
        this.animationStartRotation = new THREE.Euler();
        this.animationTargetPosition = new THREE.Vector3();
        this.animationTargetRotation = new THREE.Euler();
        
        // Movement settings
        this.movementSettings = {
            walkSpeed: 5,
            sprintSpeed: 8,
            jumpForce: 15,
            gravity: 30,
            turnSpeed: 2.5
        };

        // Create character model
        this.setupCharacterModel();
        this.setupCamera();
        this.inputHandler = new InputHandler();
        
        // Set initial position
        this.setInitialPosition();
    }

    setInitialPosition() {
        // Position the character on the track
        const trackRadius = 62.5;
        this.characterGroup.position.set(trackRadius, 0.4, 0);
        this.characterGroup.rotation.y = Math.PI / 2;
    }

    setupCharacterModel() {
        // Remove previous model if any
        if (this.characterGroup) {
            this.game.scene.remove(this.characterGroup);
        }
        this.characterGroup = new THREE.Group();
        this.game.scene.add(this.characterGroup);

        // --- COLORS ---
        const mainColor = 0x3a7cff; // Bright blue
        const limbColor = 0x22223b; // Dark for legs
        const faceColor = 0xffe0b3; // Light skin

        // --- BODY (short, chunky capsule) ---
        const bodyGeometry = new THREE.CapsuleGeometry(0.23, 0.5, 12, 24);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.7, metalness: 0.0 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.65;
        this.characterGroup.add(this.body);

        // --- HEAD (big sphere) ---
        const headGeometry = new THREE.SphereGeometry(0.22, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({ color: faceColor, roughness: 0.6, metalness: 0.0 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.13; // Sits on top of body
        this.characterGroup.add(this.head);

        // --- ARMS (short, stubby capsules) ---
        const armGeometry = new THREE.CapsuleGeometry(0.06, 0.18, 8, 16);
        const armMaterial = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.7, metalness: 0.0 });
        // Left arm
        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.26, 0.82, 0);
        this.leftArm.rotation.z = Math.PI / 8;
        this.characterGroup.add(this.leftArm);
        // Right arm
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.26, 0.82, 0);
        this.rightArm.rotation.z = -Math.PI / 8;
        this.characterGroup.add(this.rightArm);

        // --- LEGS (short, stubby capsules) ---
        const legGeometry = new THREE.CapsuleGeometry(0.07, 0.18, 8, 16);
        const legMaterial = new THREE.MeshStandardMaterial({ color: limbColor, roughness: 0.7, metalness: 0.0 });
        // Left leg
        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-0.09, 0.18, 0);
        this.characterGroup.add(this.leftLeg);
        // Right leg
        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(0.09, 0.18, 0);
        this.characterGroup.add(this.rightLeg);

        // --- SHADOWS ---
        this.characterGroup.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    setupCamera() {
        // Position camera behind and above character
        this.cameraOffset = new THREE.Vector3(0, 2, 4);
        this.camera.position.copy(this.characterGroup.position).add(this.cameraOffset);
        this.camera.lookAt(this.characterGroup.position);
    }

    update(deltaTime) {
        if (this.isEnteringVehicle || this.isExitingVehicle) {
            this.updateVehicleAnimation(deltaTime);
        } else if (this.isInVehicle) {
            this.updateInVehicle();
        } else {
            this.updateMovement(deltaTime);
            this.updateCamera();
        }
    }

    updateMovement(deltaTime) {
        const input = this.inputHandler.getInput();
        
        // Handle sprinting
        this.isSprinting = input.shift;
        const currentMaxSpeed = this.isSprinting ? 
            this.movementSettings.sprintSpeed : 
            this.movementSettings.walkSpeed;

        // Set target speed based on input
        let targetSpeed = 0;
        if (input.forward) {
            targetSpeed = this.baseSpeed;
        } else if (input.backward) {
            targetSpeed = -this.baseSpeed;
        }

        // Smooth acceleration and deceleration
        if (targetSpeed !== 0) {
            const speedDiff = targetSpeed - this.speed;
            this.speed += speedDiff * this.acceleration;
        } else {
            // Natural deceleration when no input
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.deceleration);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.deceleration);
            }
        }

        // Apply movement
        if (this.speed !== 0) {
            const moveDistance = this.speed * deltaTime;
            const moveDirection = new THREE.Vector3(0, 0, -1);
            moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.characterGroup.rotation.y);
            this.characterGroup.position.add(moveDirection.multiplyScalar(moveDistance));
        }

        // Handle rotation
        let targetRotation = this.characterGroup.rotation.y;
        if (input.left) {
            targetRotation += Math.PI / 2;
        } else if (input.right) {
            targetRotation -= Math.PI / 2;
        }

        // Smoothly rotate character
        const rotationDiff = targetRotation - this.characterGroup.rotation.y;
        const normalizedDiff = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
        this.characterGroup.rotation.y += normalizedDiff * 0.1;

        // Handle jumping
        if (input.jump && this.isGrounded) {
            this.verticalVelocity = this.movementSettings.jumpForce;
            this.isGrounded = false;
        }

        // Apply gravity
        if (!this.isGrounded) {
            this.verticalVelocity -= this.movementSettings.gravity * deltaTime;
            this.characterGroup.position.y += this.verticalVelocity * deltaTime;

            // Check for ground collision
            if (this.characterGroup.position.y <= 0.4) {
                this.characterGroup.position.y = 0.4;
                this.verticalVelocity = 0;
                this.isGrounded = true;
            }
        }

        // Animate character
        this.animateCharacter(input, deltaTime);
    }

    animateCharacter(input, deltaTime) {
        const isMoving = this.speed !== 0;
        const moveSpeed = Math.abs(this.speed) / this.baseSpeed; // Normalize speed for animation
        
        if (isMoving) {
            // Update animation time based on movement speed
            this.animationTime = (this.animationTime || 0) + deltaTime * moveSpeed * 5;
            
            // Calculate walking cycle with different frequencies for arms and legs
            const legCycle = Math.sin(this.animationTime * Math.PI * 2);
            const armCycle = Math.sin(this.animationTime * Math.PI * 2 + Math.PI); // Arms opposite to legs
            
            // Calculate movement intensity based on speed
            const movementIntensity = Math.min(1, moveSpeed);
            
            // Animate legs with more natural movement
            const legSwing = legCycle * 0.5 * movementIntensity; // Increased leg swing
            const legLift = Math.abs(legCycle) * 0.2 * movementIntensity; // Add vertical movement
            
            // Left leg
            this.leftLeg.rotation.x = legSwing;
            this.leftLeg.position.y = 0.25 + legLift;
            
            // Right leg (opposite phase)
            this.rightLeg.rotation.x = -legSwing;
            this.rightLeg.position.y = 0.25 + Math.abs(-legCycle) * 0.2 * movementIntensity;
            
            // Animate arms with more natural movement
            const armSwing = armCycle * 0.4 * movementIntensity; // Slightly reduced arm swing
            const armLift = Math.abs(armCycle) * 0.1 * movementIntensity; // Add slight vertical movement
            
            // Left arm (opposite to right leg)
            this.leftArm.rotation.x = -armSwing;
            this.leftArm.position.y = 0.9 + armLift;
            
            // Right arm (opposite to left leg)
            this.rightArm.rotation.x = armSwing;
            this.rightArm.position.y = 0.9 + Math.abs(-armCycle) * 0.1 * movementIntensity;
            
            // Add slight body movement
            const bodyBob = Math.abs(legCycle) * 0.05 * movementIntensity;
            this.body.position.y = 0.7 + bodyBob;
            this.head.position.y = 1.25 + bodyBob;
            
            // Add slight body rotation for more natural movement
            const bodyTilt = legCycle * 0.05 * movementIntensity;
            this.body.rotation.z = bodyTilt;
            this.head.rotation.z = -bodyTilt * 0.5; // Head counter-rotates slightly
            
        } else {
            // Reset animations when not moving
            this.animationTime = 0;
            
            // Reset leg positions
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftLeg.position.y = 0.25;
            this.rightLeg.position.y = 0.25;
            
            // Reset arm positions
            this.leftArm.rotation.x = Math.PI / 8;
            this.rightArm.rotation.x = -Math.PI / 8;
            this.leftArm.position.y = 0.9;
            this.rightArm.position.y = 0.9;
            
            // Reset body position and rotation
            this.body.position.y = 0.7;
            this.head.position.y = 1.25;
            this.body.rotation.z = 0;
            this.head.rotation.z = 0;
        }
    }

    updateCamera() {
        // Calculate ideal camera position based on character's rotation
        const idealOffset = new THREE.Vector3(
            Math.sin(this.characterGroup.rotation.y) * this.cameraDistance,
            this.cameraHeight,
            Math.cos(this.characterGroup.rotation.y) * this.cameraDistance
        );
        
        const idealPosition = this.characterGroup.position.clone().add(idealOffset);
        
        // Smooth camera movement
        this.camera.position.lerp(idealPosition, 0.1);
        
        // Make camera look at character
        const lookAtPosition = this.characterGroup.position.clone();
        lookAtPosition.y += 1; // Look slightly above character's feet
        this.camera.lookAt(lookAtPosition);
    }

    updateInVehicle() {
        if (this.currentVehicle) {
            // Update character position to match vehicle
            this.characterGroup.position.copy(this.currentVehicle.carGroup.position);
            this.characterGroup.position.y += 1; // Sit on top of vehicle
            this.characterGroup.rotation.copy(this.currentVehicle.carGroup.rotation);
        }
    }

    updateVehicleAnimation(deltaTime) {
        this.animationProgress += deltaTime / this.animationDuration;
        
        if (this.animationProgress >= 1) {
            // Animation complete
            this.animationProgress = 1;
            if (this.isEnteringVehicle) {
                this.isEnteringVehicle = false;
                this.isInVehicle = true;
                this.characterGroup.visible = false;
            } else if (this.isExitingVehicle) {
                this.isExitingVehicle = false;
                this.isInVehicle = false;
                this.characterGroup.visible = true;
            }
        }

        // Use smooth easing function
        const t = this.easeInOutQuad(this.animationProgress);

        if (this.isEnteringVehicle) {
            // Smooth entry animation
            this.characterGroup.position.lerpVectors(
                this.animationStartPosition,
                this.animationTargetPosition,
                t
            );
            
            // Rotate character to face forward in vehicle
            const targetRotation = this.animationTargetRotation.clone();
            this.characterGroup.rotation.y = this.animationStartRotation.y + 
                (targetRotation.y - this.animationStartRotation.y) * t;
            
            // Scale down character during entry
            const scale = 1 - t * 0.5; // Reduce to 50% size
            this.characterGroup.scale.set(scale, scale, scale);
        } else if (this.isExitingVehicle) {
            // Smooth exit animation
            this.characterGroup.position.lerpVectors(
                this.animationStartPosition,
                this.animationTargetPosition,
                t
            );
            
            // Rotate character to face away from vehicle
            const targetRotation = this.animationTargetRotation.clone();
            this.characterGroup.rotation.y = this.animationStartRotation.y + 
                (targetRotation.y - this.animationStartRotation.y) * t;
            
            // Scale up character during exit
            const scale = 0.5 + t * 0.5; // Start at 50% and scale to 100%
            this.characterGroup.scale.set(scale, scale, scale);
        }

        // Update camera with smooth transition
        this.updateCameraDuringAnimation(t);
    }

    updateCameraDuringAnimation(t) {
        if (this.isEnteringVehicle) {
            // Camera smoothly moves to vehicle position
            const targetPosition = this.animationTargetPosition.clone();
            targetPosition.y += 2; // Camera height above vehicle
            targetPosition.z += 4; // Camera distance behind vehicle
            
            this.camera.position.lerp(targetPosition, t);
            this.camera.lookAt(this.animationTargetPosition);
        } else if (this.isExitingVehicle) {
            // Camera smoothly follows character during exit
            const idealOffset = this.cameraOffset.clone();
            idealOffset.applyQuaternion(this.characterGroup.quaternion);
            const idealPosition = this.characterGroup.position.clone().add(idealOffset);
            
            this.camera.position.lerp(idealPosition, t);
            this.camera.lookAt(this.characterGroup.position);
        }
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    enterVehicle(vehicle) {
        if (!this.isInVehicle && vehicle && !this.isEnteringVehicle && !this.isExitingVehicle) {
            this.isEnteringVehicle = true;
            this.currentVehicle = vehicle;
            this.animationProgress = 0;
            
            // Store start position and rotation
            this.animationStartPosition.copy(this.characterGroup.position);
            this.animationStartRotation.copy(this.characterGroup.rotation);
            
            // Calculate target position (sitting position in vehicle)
            this.animationTargetPosition.copy(vehicle.carGroup.position);
            this.animationTargetPosition.y += 0.5; // Adjust for sitting height
            
            // Calculate target rotation (facing forward in vehicle)
            this.animationTargetRotation.copy(vehicle.carGroup.rotation);
            
            // Start the animation
            this.game.setActiveVehicle(vehicle);
        }
    }

    exitVehicle() {
        if (this.isInVehicle && this.currentVehicle && !this.isEnteringVehicle && !this.isExitingVehicle) {
            this.isExitingVehicle = true;
            this.animationProgress = 0;
            
            // Make character visible again
            this.characterGroup.visible = true;
            
            // Store start position and rotation (current vehicle position)
            this.animationStartPosition.copy(this.currentVehicle.carGroup.position);
            this.animationStartPosition.y += 0.5;
            this.animationStartRotation.copy(this.currentVehicle.carGroup.rotation);
            
            // Calculate exit position (next to vehicle)
            const exitOffset = new THREE.Vector3(2, 0, 0);
            exitOffset.applyQuaternion(this.currentVehicle.carGroup.quaternion);
            this.animationTargetPosition.copy(this.currentVehicle.carGroup.position).add(exitOffset);
            this.animationTargetPosition.y = 0.4;
            
            // Calculate exit rotation (facing away from vehicle)
            this.animationTargetRotation.copy(this.currentVehicle.carGroup.rotation);
            this.animationTargetRotation.y += Math.PI;
            
            // Reset vehicle-related states
            this.currentVehicle = null;
            this.game.setActiveVehicle(null);
        }
    }

    checkVehicleInteraction() {
        const input = this.inputHandler.getInput();
        
        if (!this.isInVehicle) {
            // Check for vehicle entry
            if (input.interact) {
                const nearbyVehicles = this.game.getNearbyVehicles(this.characterGroup.position, 3);
                if (nearbyVehicles.length > 0) {
                    const closestVehicle = nearbyVehicles[0];
                    this.enterVehicle(closestVehicle);
                }
            }
        } else {
            // Check for vehicle exit
            if (input.exit) {
                console.log('Exit key pressed, attempting to exit vehicle');
                this.exitVehicle();
            }
        }
    }
} 