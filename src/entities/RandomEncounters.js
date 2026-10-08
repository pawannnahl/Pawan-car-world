import * as THREE from 'three';

export class RandomEncounters {
    constructor(scene, trackRadius) {
        this.scene = scene;
        this.trackRadius = trackRadius;
        this.birds = [];
        this.birdGroup = new THREE.Group();
        this.birdGroup.name = 'BirdGroup';
        this.scene.add(this.birdGroup);
        
        // Bird parameters
        this.birdCount = 20;
        this.minHeight = 30;
        this.maxHeight = 50;
        this.minDistance = trackRadius + 50;
        this.maxDistance = trackRadius + 150;
        
        this.generateBirds();
    }

    generateBirds() {
        for (let i = 0; i < this.birdCount; i++) {
            const bird = this.createBird();
            bird.name = `Bird_${i}`;
            this.birds.push(bird);
            this.birdGroup.add(bird);
        }
    }

    createBird() {
        const birdGroup = new THREE.Group();
        
        // Random position in the sky
        const angle = Math.random() * Math.PI * 2;
        const distance = this.minDistance + Math.random() * (this.maxDistance - this.minDistance);
        const height = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);
        
        // Bird body
        const bodyGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        body.position.y = 0.2;
        birdGroup.add(body);

        // Wings
        const wingGeometry = new THREE.PlaneGeometry(1.5, 0.6);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.8, 0.2, 0);
        leftWing.rotation.y = Math.PI / 4;
        birdGroup.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.8, 0.2, 0);
        rightWing.rotation.y = -Math.PI / 4;
        birdGroup.add(rightWing);

        // Tail
        const tailGeometry = new THREE.PlaneGeometry(0.4, 0.3);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.8,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.2, -0.5);
        tail.rotation.x = Math.PI / 2;
        birdGroup.add(tail);

        // Position the bird
        birdGroup.position.set(
            Math.cos(angle) * distance,
            height,
            Math.sin(angle) * distance
        );

        // Random initial rotation
        birdGroup.rotation.y = Math.random() * Math.PI * 2;

        // Store wing references for animation
        birdGroup.userData = {
            leftWing,
            rightWing,
            wingAngle: 0,
            wingSpeed: 0.1 + Math.random() * 0.1,
            flightPath: this.generateFlightPath()
        };

        return birdGroup;
    }

    generateFlightPath() {
        const path = [];
        const points = 5 + Math.floor(Math.random() * 5);
        const centerX = 0;
        const centerZ = 0;
        const radius = this.minDistance + Math.random() * (this.maxDistance - this.minDistance);
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            path.push({
                x: centerX + Math.cos(angle) * radius,
                z: centerZ + Math.sin(angle) * radius,
                y: this.minHeight + Math.random() * (this.maxHeight - this.minHeight)
            });
        }
        
        return path;
    }

    update(deltaTime) {
        this.birds.forEach(bird => {
            // Animate wings
            const wingAngle = Math.sin(Date.now() * 0.005 * bird.userData.wingSpeed) * Math.PI / 4;
            bird.userData.leftWing.rotation.y = Math.PI / 4 + wingAngle;
            bird.userData.rightWing.rotation.y = -Math.PI / 4 - wingAngle;

            // Update flight path
            const path = bird.userData.flightPath;
            const currentPoint = path[Math.floor(Date.now() * 0.0005) % path.length];
            const nextPoint = path[(Math.floor(Date.now() * 0.0005) + 1) % path.length];
            
            // Smoothly interpolate between points
            const t = (Date.now() * 0.0005) % 1;
            bird.position.x = currentPoint.x + (nextPoint.x - currentPoint.x) * t;
            bird.position.y = currentPoint.y + (nextPoint.y - currentPoint.y) * t;
            bird.position.z = currentPoint.z + (nextPoint.z - currentPoint.z) * t;

            // Make bird face direction of movement
            const direction = new THREE.Vector3(
                nextPoint.x - currentPoint.x,
                nextPoint.y - currentPoint.y,
                nextPoint.z - currentPoint.z
            ).normalize();
            
            bird.rotation.y = Math.atan2(direction.x, direction.z);
            bird.rotation.x = Math.asin(direction.y);
        });
    }
} 