import { Weather } from './effects/Weather.js';
import { RandomEncounters } from './entities/RandomEncounters.js';
import { Mountains } from './entities/Mountains.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import * as THREE from 'three';
import { Character } from './entities/Character.js';

export class Game {
    constructor() {
        console.log('Game constructor started');
        
        // Initialize scene and other properties
        this.scene = new THREE.Scene();
        this.trackRadius = 62.5;
        
        // Time of day system (static for now)
        this.timeOfDay = 0.5; // Fixed at noon
        
        // Exploration state
        this.isGameStarted = false;
        this.isGameOver = false;
        this.discoveredAreas = new Set();
        this.explorationPoints = 0;
        this.lastDiscoveryTime = 0;
        this.discoveryStreak = 0;
        this.maxDiscoveryStreak = 0;

        // Vehicle state
        this.currentSpeed = 0;
        this.maxSpeed = 200;
        this.nitroLevel = 100;
        this.maxNitro = 100;
        this.isNitroActive = false;
        this.nitroRechargeRate = 10; // units per second
        this.nitroDrainRate = 30; // units per second
        
        // Setup lighting with more intensity
        this.setupLighting();
        
        // Setup UI
        this.setupWeatherControls();
        this.setupSpeedometer();
        this.setupNitroMeter();
        this.setupExplorationDisplay();
        
        // Add ammo UI
        const ammoUI = document.createElement('div');
        ammoUI.style.position = 'absolute';
        ammoUI.style.top = '10px';
        ammoUI.style.right = '10px';
        ammoUI.style.color = 'white';
        ammoUI.style.fontSize = '20px';
        ammoUI.style.fontFamily = 'Arial';
        ammoUI.textContent = 'Ammo: 30';
        document.body.appendChild(ammoUI);

        // Update ammo UI
        this.updateAmmoUI = (ammo) => {
            ammoUI.textContent = `Ammo: ${ammo}`;
        };

        // Initialize character
        this.character = new Character(this.scene, this.camera);
        
        // Bind shooting to left mouse button
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button
                this.character.shoot();
                this.updateAmmoUI(this.character.ammo);
            }
        });

        // Add multiple targets
        for (let i = 0; i < 5; i++) {
            const targetGeometry = new THREE.BoxGeometry(1, 1, 1);
            const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const target = new THREE.Mesh(targetGeometry, targetMaterial);
            target.position.set(
                Math.random() * 40 - 20, // Random position within bounds
                0.5,
                Math.random() * 40 - 20
            );
            this.scene.add(target);
        }

        // Add multiple ammo pickups
        for (let i = 0; i < 3; i++) {
            const ammoPickupGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const ammoPickupMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const ammoPickup = new THREE.Mesh(ammoPickupGeometry, ammoPickupMaterial);
            ammoPickup.position.set(
                Math.random() * 40 - 20,
                0.2,
                Math.random() * 40 - 20
            );
            this.scene.add(ammoPickup);
        }
        
        console.log('Game initialization complete');
    }

    startGame() {
        console.log('Starting game...');
        this.isGameStarted = true;
        this.isGameOver = false;
        this.score = 0;
        
        // Initialize game systems
        this.initializeGameSystems();
        
        console.log('Game started successfully');
    }

    initializeGameSystems() {
        console.log('Initializing game systems...');
        
        // Initialize weather system
        console.log('Initializing weather system...');
        this.weather = new Weather(this.scene);
        
        // Initialize random encounters
        console.log('Initializing random encounters...');
        this.randomEncounters = new RandomEncounters(this.scene, this.trackRadius);
        
        // Initialize mountains
        console.log('Initializing mountains...');
        this.mountains = new Mountains(this.scene, this.trackRadius);

        // Initialize particle system
        console.log('Initializing particle system...');
        this.particleSystem = new ParticleSystem(this.scene);
        
        // Verify scene contents
        console.log('Scene children count:', this.scene.children.length);
        this.scene.children.forEach((child, index) => {
            console.log(`Scene child ${index}:`, child.type, child.name);
        });
    }

    setupLighting() {
        console.log('Setting up lighting...');
        
        // Ambient light with increased intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        console.log('Ambient light added');

        // Directional light (sun/moon)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.directionalLight.position.set(100, 100, 50);
        this.directionalLight.castShadow = true;
        
        // Configure shadow properties
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(this.directionalLight);
        console.log('Directional light added');

        // Add hemisphere light for better ambient lighting
        this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(this.hemisphereLight);
    }

    setupWeatherControls() {
        // Add weather control buttons to the UI
        const weatherControls = document.createElement('div');
        weatherControls.style.position = 'absolute';
        weatherControls.style.top = '10px';
        weatherControls.style.right = '10px';
        weatherControls.style.display = 'flex';
        weatherControls.style.gap = '10px';

        const weatherTypes = ['clear', 'rain', 'snow'];
        weatherTypes.forEach(type => {
            const button = document.createElement('button');
            button.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            button.style.padding = '8px 16px';
            button.style.borderRadius = '4px';
            button.style.border = 'none';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
            button.style.cursor = 'pointer';
            button.style.transition = 'background-color 0.3s';

            button.onmouseover = () => button.style.backgroundColor = '#45a049';
            button.onmouseout = () => button.style.backgroundColor = '#4CAF50';
            button.onclick = () => this.weather.setWeather(type);

            weatherControls.appendChild(button);
        });

        document.body.appendChild(weatherControls);
    }

    setupSpeedometer() {
        this.speedometerContainer = document.createElement('div');
        this.speedometerContainer.style.position = 'absolute';
        this.speedometerContainer.style.bottom = '20px';
        this.speedometerContainer.style.right = '20px';
        this.speedometerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.speedometerContainer.style.padding = '15px';
        this.speedometerContainer.style.borderRadius = '10px';
        this.speedometerContainer.style.color = 'white';
        this.speedometerContainer.style.fontFamily = 'Arial, sans-serif';
        this.speedometerContainer.style.fontSize = '24px';
        this.speedometerContainer.style.textAlign = 'center';
        this.speedometerContainer.style.minWidth = '150px';
        
        this.speedValue = document.createElement('div');
        this.speedValue.style.fontSize = '36px';
        this.speedValue.style.fontWeight = 'bold';
        this.speedValue.style.marginBottom = '5px';
        
        this.speedUnit = document.createElement('div');
        this.speedUnit.style.fontSize = '16px';
        this.speedUnit.style.opacity = '0.8';
        this.speedUnit.textContent = 'KM/H';
        
        this.speedometerContainer.appendChild(this.speedValue);
        this.speedometerContainer.appendChild(this.speedUnit);
        document.body.appendChild(this.speedometerContainer);
        
        this.updateSpeedometer();
    }

    setupNitroMeter() {
        this.nitroContainer = document.createElement('div');
        this.nitroContainer.style.position = 'absolute';
        this.nitroContainer.style.bottom = '20px';
        this.nitroContainer.style.left = '20px';
        this.nitroContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.nitroContainer.style.padding = '15px';
        this.nitroContainer.style.borderRadius = '10px';
        this.nitroContainer.style.color = 'white';
        this.nitroContainer.style.fontFamily = 'Arial, sans-serif';
        this.nitroContainer.style.fontSize = '24px';
        this.nitroContainer.style.textAlign = 'center';
        this.nitroContainer.style.minWidth = '150px';
        
        this.nitroLabel = document.createElement('div');
        this.nitroLabel.style.fontSize = '16px';
        this.nitroLabel.style.marginBottom = '5px';
        this.nitroLabel.textContent = 'NITRO';
        
        this.nitroBar = document.createElement('div');
        this.nitroBar.style.width = '100%';
        this.nitroBar.style.height = '20px';
        this.nitroBar.style.backgroundColor = '#333';
        this.nitroBar.style.borderRadius = '10px';
        this.nitroBar.style.overflow = 'hidden';
        
        this.nitroFill = document.createElement('div');
        this.nitroFill.style.width = '100%';
        this.nitroFill.style.height = '100%';
        this.nitroFill.style.backgroundColor = '#00ff00';
        this.nitroFill.style.transition = 'width 0.3s ease';
        
        this.nitroBar.appendChild(this.nitroFill);
        this.nitroContainer.appendChild(this.nitroLabel);
        this.nitroContainer.appendChild(this.nitroBar);
        document.body.appendChild(this.nitroContainer);
        
        this.updateNitroMeter();
    }

    setupExplorationDisplay() {
        this.explorationDisplay = document.createElement('div');
        this.explorationDisplay.style.position = 'absolute';
        this.explorationDisplay.style.top = '50px';
        this.explorationDisplay.style.left = '10px';
        this.explorationDisplay.style.color = 'white';
        this.explorationDisplay.style.fontSize = '24px';
        this.explorationDisplay.style.fontFamily = 'Arial, sans-serif';
        this.explorationDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        document.body.appendChild(this.explorationDisplay);
        this.updateExplorationDisplay();
    }

    updateSpeedometer() {
        this.speedValue.textContent = Math.round(this.currentSpeed);
    }

    updateNitroMeter() {
        const percentage = (this.nitroLevel / this.maxNitro) * 100;
        this.nitroFill.style.width = `${percentage}%`;
        
        // Change color based on nitro level
        if (percentage > 60) {
            this.nitroFill.style.backgroundColor = '#00ff00';
        } else if (percentage > 30) {
            this.nitroFill.style.backgroundColor = '#ffff00';
        } else {
            this.nitroFill.style.backgroundColor = '#ff0000';
        }
    }

    activateNitro() {
        if (this.nitroLevel > 0) {
            this.isNitroActive = true;
            this.currentSpeed = Math.min(this.currentSpeed * 1.5, this.maxSpeed * 1.5);
        }
    }

    deactivateNitro() {
        this.isNitroActive = false;
        this.currentSpeed = Math.min(this.currentSpeed, this.maxSpeed);
    }

    updateExplorationDisplay() {
        this.explorationDisplay.innerHTML = `
            Exploration Points: ${this.explorationPoints}<br>
            Areas Discovered: ${this.discoveredAreas.size}<br>
            Discovery Streak: ${this.discoveryStreak}x<br>
            Max Streak: ${this.maxDiscoveryStreak}x
        `;
    }

    update(deltaTime) {
        if (!this.isGameStarted) return;
        
        // Make sure deltaTime is a reasonable value
        if (deltaTime > 0.1) deltaTime = 0.1;
        
        // Update vehicle state
        if (this.isNitroActive) {
            this.nitroLevel = Math.max(0, this.nitroLevel - this.nitroDrainRate * deltaTime);
            if (this.nitroLevel === 0) {
                this.deactivateNitro();
            }
        } else {
            this.nitroLevel = Math.min(this.maxNitro, this.nitroLevel + this.nitroRechargeRate * deltaTime);
        }
        
        // Update UI
        this.updateSpeedometer();
        this.updateNitroMeter();
        
        // Update weather
        if (this.weather) {
            this.weather.update(deltaTime);
        }
        
        // Update random encounters
        if (this.randomEncounters) {
            this.randomEncounters.update(deltaTime);
        }

        // Update mountains
        if (this.mountains) {
            this.mountains.update(deltaTime);
        }

        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }
        
        // Check for collisions with animals
        if (this.car && this.randomEncounters) {
            if (this.randomEncounters.checkCollision(this.car.carGroup.position, this.car.collisionRadius)) {
                this.handleAnimalCollision();
            }
        }

        // Reset discovery streak if no new discoveries for 10 seconds
        if (performance.now() - this.lastDiscoveryTime > 10000) {
            this.discoveryStreak = 0;
            this.updateExplorationDisplay();
        }
    }

    handleAnimalCollision() {
        if (!this.car) return;
        
        // Reduce car speed
        this.car.speed *= 0.5;
        
        // Add some random rotation to the car
        this.car.carGroup.rotation.y += (Math.random() - 0.5) * Math.PI / 4;
        
        // Create collision particles
        if (this.particleSystem) {
            const direction = new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
            this.particleSystem.createDriftParticles(this.car.carGroup.position, direction);
        }
        
        // Reset discovery streak on collision
        this.discoveryStreak = 0;
        this.updateExplorationDisplay();
        
        // Play collision sound if available
        if (this.soundManager) {
            this.soundManager.playSound('collision');
        }
    }

    // Add method to handle drift
    handleDrift(position, direction, intensity) {
        if (this.particleSystem) {
            this.particleSystem.createDriftParticles(position, direction);
        }
    }

    // Add method to handle boost
    handleBoost(position) {
        if (this.particleSystem) {
            this.particleSystem.createBoostParticles(position);
        }
    }

    // Ammo pickup logic
    checkAmmoPickup = () => {
        const distance = this.character.model.position.distanceTo(ammoPickup.position);
        if (distance < 1) { // Adjust pickup radius as needed
            this.character.ammo += 10; // Increase ammo by 10
            this.updateAmmoUI(this.character.ammo);
            ammoPickup.position.set(
                Math.random() * 20 - 10, // Random position within bounds
                0.2,
                Math.random() * 20 - 10
            );
        }
    };

    // Game loop
    animate = () => {
        requestAnimationFrame(this.animate);
        this.update();
        this.checkAmmoPickup(); // Check for ammo pickups
        this.renderer.render(this.scene, this.camera);
    };
} 