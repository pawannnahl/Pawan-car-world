import * as THREE from 'three';

export class Mountains {
    constructor(scene, trackRadius) {
        console.log('Mountains constructor started with trackRadius:', trackRadius);
        this.scene = scene;
        this.trackRadius = trackRadius;
        this.mountains = [];
        this.mountainGroup = new THREE.Group();
        this.mountainGroup.name = 'MountainGroup';
        this.scene.add(this.mountainGroup);
        console.log('Mountain group added to scene');
        
        // Mountain parameters - adjusted for outer positioning
        this.mountainCount = 16;
        this.minDistance = trackRadius + 135; // Reduced by 10% from 150
        this.maxDistance = trackRadius + 270; // Reduced by 10% from 300
        this.minHeight = 60;
        this.maxHeight = 90;
        
        // Terrain parameters
        this.terrainSize = trackRadius * 4.5;
        this.terrainResolution = 128;
        
        // Initialize textures with fallback colors
        this.initializeTextures();
        
        console.log('Starting terrain and mountain generation...');
        this.generateTerrain();
        this.generateMountains();
        this.generateSignboards();
        console.log('Terrain and mountains generation complete');
        console.log('Number of mountains created:', this.mountains.length);
    }

    initializeTextures() {
        const textureLoader = new THREE.TextureLoader();
        
        // Default colors for fallback
        const defaultGrassColor = 0x4CAF50;
        const defaultSnowColor = 0xFFFFFF;
        const defaultRockColor = 0x808080;
        
        // Mountain textures with fallback colors
        this.mountainTexture = this.createTextureWithFallback(
            textureLoader,
            '/textures/terrain/grass.jpg',
            defaultGrassColor
        );
        
        // Snow texture with fallback color
        this.snowTexture = this.createTextureWithFallback(
            textureLoader,
            '/textures/terrain/snow.jpg',
            defaultSnowColor
        );
        
        // Rock texture with fallback color
        this.rockTexture = this.createTextureWithFallback(
            textureLoader,
            '/textures/terrain/rock.jpg',
            defaultRockColor
        );
    }

    createTextureWithFallback(loader, path, fallbackColor) {
        const texture = new THREE.Texture();
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        
        // Try to load the texture, but use fallback color if it fails
        loader.load(
            path,
            (loadedTexture) => {
                texture.image = loadedTexture.image;
                texture.needsUpdate = true;
            },
            undefined,
            () => {
                console.warn(`Failed to load texture: ${path}, using fallback color`);
                // Create a 1x1 canvas with the fallback color
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#' + fallbackColor.toString(16).padStart(6, '0');
                ctx.fillRect(0, 0, 1, 1);
                texture.image = canvas;
                texture.needsUpdate = true;
            }
        );
        
        return texture;
    }

    generateTerrain() {
        console.log('Generating terrain...');
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize,
            this.terrainSize,
            this.terrainResolution,
            this.terrainResolution
        );
        
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            const distanceFromCenter = Math.sqrt(x * x + z * z);
            
            let height = 0;
            
            // Create bumpy road sections
            if (distanceFromCenter > this.trackRadius - 5 && distanceFromCenter < this.trackRadius + 5) {
                height += Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.3;
            }
            
            // Add terrain features
            if (distanceFromCenter > this.trackRadius + 15) {
                // Steeper elevation for outer areas
                height += (distanceFromCenter - this.trackRadius - 15) * 0.8; // Increased elevation
                height += Math.sin(x * 0.2) * Math.cos(z * 0.2) * 8; // Increased variation
                height += Math.random() * 3.0; // Increased randomness
            }
            
            vertices[i + 1] = height;
        }
        
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a472a,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });
        
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.name = 'Terrain';
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.terrain.position.y = -1;
        this.mountainGroup.add(this.terrain);
        console.log('Terrain added to mountain group');
    }

    generateMountains() {
        console.log('Generating mountains...');
        for (let i = 0; i < this.mountainCount; i++) {
            const mountain = this.createMountain();
            mountain.name = `Mountain_${i}`;
            this.mountains.push(mountain);
            this.mountainGroup.add(mountain);
            console.log(`Mountain ${i + 1} created and added to group`);
        }
    }

    generateSignboards() {
        console.log('Generating signboards...');
        const signCount = 6;
        const signPositions = [];
        
        for (let i = 0; i < signCount; i++) {
            const angle = (i / signCount) * Math.PI * 2;
            const distance = this.trackRadius + 8;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            signPositions.push({ x, z, angle });
        }
        
        signPositions.forEach((pos, index) => {
            const signGroup = new THREE.Group();
            signGroup.name = `Signboard_${index}`;
            
            const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
            const postMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.7,
                metalness: 0.3
            });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.y = 2;
            signGroup.add(post);
            
            const boardGeometry = new THREE.BoxGeometry(2, 1, 0.1);
            const boardMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                roughness: 0.5,
                metalness: 0.2
            });
            const board = new THREE.Mesh(boardGeometry, boardMaterial);
            board.position.set(1.2, 3.5, 0);
            signGroup.add(board);
            
            signGroup.position.set(pos.x, 0, pos.z);
            signGroup.rotation.y = pos.angle + Math.PI/2;
            
            this.mountainGroup.add(signGroup);
            console.log(`Signboard ${index + 1} created and added to group`);
        });
    }

    createMountain() {
        const mountainGroup = new THREE.Group();
        
        const angle = Math.random() * Math.PI * 2;
        const distance = this.minDistance + Math.random() * (this.maxDistance - this.minDistance);
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const height = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);
        const width = height * (1.5 + Math.random() * 0.5);
        
        // Create main mountain body with texture
        const mountainGeometry = new THREE.ConeGeometry(width/2, height, 8);
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true,
            map: this.mountainTexture,
            bumpMap: this.mountainTexture,
            bumpScale: 0.5
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.rotation.y = Math.random() * Math.PI;
        mountain.position.y = height/2;
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        mountainGroup.add(mountain);
        
        // Add snow cap with texture
        const snowCapGeometry = new THREE.ConeGeometry(width/3, height/4, 8);
        const snowMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.3,
            metalness: 0.1,
            flatShading: true,
            map: this.snowTexture,
            bumpMap: this.snowTexture,
            bumpScale: 0.3
        });
        const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
        snowCap.position.y = height * 0.75;
        snowCap.rotation.y = mountain.rotation.y;
        snowCap.castShadow = true;
        snowCap.receiveShadow = true;
        mountainGroup.add(snowCap);
        
        // Add rocks with texture
        const rockCount = 12 + Math.floor(Math.random() * 12); // Increased rock count
        for (let i = 0; i < rockCount; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(
                1 + Math.random() * 3,
                0
            );
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9,
                metalness: 0.1,
                flatShading: true,
                map: this.rockTexture,
                bumpMap: this.rockTexture,
                bumpScale: 0.4
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            
            const rockAngle = (i / rockCount) * Math.PI * 2;
            const rockDistance = width/2 * (0.8 + Math.random() * 0.4);
            rock.position.set(
                Math.cos(rockAngle) * rockDistance,
                0.5 + Math.random() * 2,
                Math.sin(rockAngle) * rockDistance
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.scale.set(
                0.5 + Math.random(),
                0.5 + Math.random(),
                0.5 + Math.random()
            );
            
            rock.castShadow = true;
            rock.receiveShadow = true;
            mountainGroup.add(rock);
        }
        
        // Add more trees and shrubs
        const treeCount = 15 + Math.floor(Math.random() * 15); // Increased tree count
        for (let i = 0; i < treeCount; i++) {
            const tree = this.createTree();
            const treeAngle = (i / treeCount) * Math.PI * 2;
            const treeDistance = width/2 * (1.2 + Math.random() * 0.8);
            tree.position.set(
                Math.cos(treeAngle) * treeDistance,
                0,
                Math.sin(treeAngle) * treeDistance
            );
            mountainGroup.add(tree);
        }

        // Add shrubs around the mountain base
        const shrubCount = 20 + Math.floor(Math.random() * 20); // Added shrub count
        for (let i = 0; i < shrubCount; i++) {
            const shrub = this.createShrub();
            const shrubAngle = (i / shrubCount) * Math.PI * 2;
            const shrubDistance = width/2 * (1.4 + Math.random() * 0.6);
            shrub.position.set(
                Math.cos(shrubAngle) * shrubDistance,
                0,
                Math.sin(shrubAngle) * shrubDistance
            );
            mountainGroup.add(shrub);
        }
        
        mountainGroup.position.set(x, 0, z);
        return mountainGroup;
    }

    createTree() {
        const treeGroup = new THREE.Group();
        
        // Tree trunk with brown color
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4d2926, // Brown
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Tree top with bright green color
        const topGeometry = new THREE.ConeGeometry(1, 2, 8);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00, // Bright green
            roughness: 0.8,
            metalness: 0.1
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 2.5;
        top.castShadow = true;
        treeGroup.add(top);
        
        return treeGroup;
    }

    createShrub() {
        const shrubGroup = new THREE.Group();
        
        // Create multiple spheres for a more natural bush look
        const shrubMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d5a27,
            roughness: 0.8,
            metalness: 0.1
        });

        // Create 4-6 spheres of different sizes
        const numSpheres = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numSpheres; i++) {
            const radius = 0.6 + Math.random() * 0.6;
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 8, 8),
                shrubMaterial
            );
            sphere.position.set(
                (Math.random() - 0.5) * 2,
                radius,
                (Math.random() - 0.5) * 2
            );
            sphere.castShadow = true;
            shrubGroup.add(sphere);
        }

        return shrubGroup;
    }

    update(deltaTime) {
        this.mountains.forEach((mountain, index) => {
            mountain.position.y = Math.sin(Date.now() * 0.001 + index) * 0.1;
        });
    }
} 