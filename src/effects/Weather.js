import * as THREE from 'three';

export class Weather {
    constructor(scene) {
        this.scene = scene;
        this.weatherType = 'clear'; // clear, rain, snow
        this.particles = [];
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
        
        // Weather parameters
        this.weatherIntensity = 0.5;
        this.windDirection = new THREE.Vector3(1, 0, 0);
        this.windStrength = 0.5;
        
        // Create particle systems
        this.setupParticleSystems();
    }

    setupParticleSystems() {
        // Rain particles
        const rainCount = 1000;
        const rainGeometry = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(rainCount * 3);
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        for (let i = 0; i < rainCount; i++) {
            rainPositions[i * 3] = (Math.random() - 0.5) * 100;
            rainPositions[i * 3 + 1] = Math.random() * 50;
            rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }

        rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        this.rainSystem = new THREE.Points(rainGeometry, rainMaterial);
        this.rainSystem.visible = false;
        this.particleGroup.add(this.rainSystem);

        // Snow particles
        const snowCount = 500;
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = new Float32Array(snowCount * 3);
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < snowCount; i++) {
            snowPositions[i * 3] = (Math.random() - 0.5) * 100;
            snowPositions[i * 3 + 1] = Math.random() * 50;
            snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }

        snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
        this.snowSystem = new THREE.Points(snowGeometry, snowMaterial);
        this.snowSystem.visible = false;
        this.particleGroup.add(this.snowSystem);
    }

    setWeather(type, intensity = 0.5) {
        this.weatherType = type;
        this.weatherIntensity = intensity;

        // Hide all weather effects
        this.rainSystem.visible = false;
        this.snowSystem.visible = false;

        // Show selected weather effect
        switch (type) {
            case 'rain':
                this.rainSystem.visible = true;
                break;
            case 'snow':
                this.snowSystem.visible = true;
                break;
        }

        // Update environment based on weather
        this.updateEnvironment();
    }

    updateEnvironment() {
        // Update lighting based on weather
        const ambientLight = this.scene.getObjectByName('ambientLight');
        const directionalLight = this.scene.getObjectByName('directionalLight');

        if (ambientLight && directionalLight) {
            switch (this.weatherType) {
                case 'clear':
                    ambientLight.intensity = 0.5;
                    directionalLight.intensity = 1;
                    break;
                case 'rain':
                    ambientLight.intensity = 0.3;
                    directionalLight.intensity = 0.5;
                    break;
                case 'snow':
                    ambientLight.intensity = 0.4;
                    directionalLight.intensity = 0.7;
                    break;
            }
        }
    }

    update(deltaTime) {
        if (this.weatherType === 'clear') return;

        const positions = this.weatherType === 'rain' ? 
            this.rainSystem.geometry.attributes.position.array :
            this.snowSystem.geometry.attributes.position.array;

        const particleCount = positions.length / 3;
        const speed = this.weatherType === 'rain' ? 20 : 5;
        const windEffect = this.windStrength * deltaTime;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Update position
            positions[i3 + 1] -= speed * deltaTime * this.weatherIntensity;
            positions[i3] += this.windDirection.x * windEffect;
            positions[i3 + 2] += this.windDirection.z * windEffect;

            // Reset particles that fall below ground
            if (positions[i3 + 1] < 0) {
                positions[i3] = (Math.random() - 0.5) * 100;
                positions[i3 + 1] = 50;
                positions[i3 + 2] = (Math.random() - 0.5) * 100;
            }
        }

        // Update geometry
        if (this.weatherType === 'rain') {
            this.rainSystem.geometry.attributes.position.needsUpdate = true;
        } else {
            this.snowSystem.geometry.attributes.position.needsUpdate = true;
        }
    }

    setWindDirection(x, z) {
        this.windDirection.set(x, 0, z).normalize();
    }

    setWindStrength(strength) {
        this.windStrength = Math.max(0, Math.min(1, strength));
    }
} 