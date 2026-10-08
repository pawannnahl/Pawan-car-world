import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 1000;
    }

    createDriftParticles(position, direction) {
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + 0.1;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;

            velocities.push({
                x: direction.x * (0.5 + Math.random() * 0.5),
                y: Math.random() * 0.2,
                z: direction.z * (0.5 + Math.random() * 0.5),
                life: 1.0
            });
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        
        this.particles.push({
            system: particleSystem,
            velocities: velocities,
            createdAt: performance.now()
        });

        this.scene.add(particleSystem);
    }

    createBoostParticles(position) {
        const particleCount = 30;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff4400,
            size: 1.0,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + 0.1;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;

            velocities.push({
                x: (Math.random() - 0.5) * 0.2,
                y: Math.random() * 0.3,
                z: (Math.random() - 0.5) * 0.2,
                life: 1.0
            });
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        
        this.particles.push({
            system: particleSystem,
            velocities: velocities,
            createdAt: performance.now()
        });

        this.scene.add(particleSystem);
    }

    createDiscoveryParticles(position, direction) {
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ff00,
            size: 1.0,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + 0.1;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;

            // Create a spiral effect
            const angle = (i / particleCount) * Math.PI * 4;
            const radius = 0.5 + (i / particleCount) * 2;
            const spiralX = Math.cos(angle) * radius;
            const spiralZ = Math.sin(angle) * radius;

            velocities.push({
                x: direction.x * 0.5 + spiralX * 0.1,
                y: direction.y * 0.5 + 0.2 + (i / particleCount) * 0.3,
                z: direction.z * 0.5 + spiralZ * 0.1,
                life: 1.0
            });
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        
        this.particles.push({
            system: particleSystem,
            velocities: velocities,
            createdAt: performance.now()
        });

        this.scene.add(particleSystem);
    }

    update(deltaTime) {
        const currentTime = performance.now();
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const positions = particle.system.geometry.attributes.position.array;
            
            for (let j = 0; j < particle.velocities.length; j++) {
                const j3 = j * 3;
                const velocity = particle.velocities[j];
                
                positions[j3] += velocity.x * deltaTime;
                positions[j3 + 1] += velocity.y * deltaTime;
                positions[j3 + 2] += velocity.z * deltaTime;
                
                velocity.life -= deltaTime;
                particle.system.material.opacity = velocity.life;
            }
            
            particle.system.geometry.attributes.position.needsUpdate = true;
            
            // Remove particles that are too old
            if (currentTime - particle.createdAt > 1000) {
                this.scene.remove(particle.system);
                this.particles.splice(i, 1);
            }
        }
    }
} 