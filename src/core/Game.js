import * as THREE from 'three';
import { Car } from '../entities/Car';
import { Character } from '../entities/Character';
import { GameState } from './GameState';
import { Menu } from './Menu';
import { MapThemes } from '../entities/MapThemes';
import { Mountains } from '../entities/Mountains';
import { RandomEncounters } from '../entities/RandomEncounters';
import { Weather } from '../effects/Weather';
import { MissionManager } from './MissionManager';
import { MiniMap } from './MiniMap';

export class Game {
    constructor() {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.car = null;
        this.character = null;
        this.activeVehicle = null;
        this.collisionObjects = []; // Store objects for collision detection
        this.gameState = new GameState(this);
        this.coinMeshes = [];
        this.isGameStarted = false;
        this.isCountdownActive = false;
        this.countdownValue = 3;
        
        // Initialize systems
        this.mountains = null;
        this.randomEncounters = null;
        this.weather = null;
        this.miniMap = null;
    }

    async init() {
        console.log('Initializing game...');
        
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Setup scene
        this.setupLights();
        this.setupEnvironment();
        this.setupCoins();
        this.setupUI();

        // Initialize systems
        console.log('Initializing mountains...');
        this.mountains = new Mountains(this.scene, 62.5); // Using track radius
        
        console.log('Initializing random encounters...');
        this.randomEncounters = new RandomEncounters(this.scene, 62.5);
        
        console.log('Initializing weather...');
        this.weather = new Weather(this.scene);

        // Initialize character and car
        this.character = new Character(this, this.camera);
        this.car = new Car(this, this.camera);

        // Setup menu
        this.menu = new Menu(this);

        // Setup missions
        this.missionManager = new MissionManager(this);

        // Setup minimap
        this.miniMap = new MiniMap(this);

        // Setup event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Set initial map theme
        this.updateMapTheme(MapThemes.getTheme('dayZone'));
        
        console.log('Game initialization complete');
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        
        // Improve shadow quality
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);

        // Add hemisphere light for better ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(hemisphereLight);
    }

    setupEnvironment() {
        // Create ground with increased size
        const groundGeometry = new THREE.PlaneGeometry(1500, 1500); // Increased from 1000 to 1500 (50% larger)
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a7e4f,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add pond in the middle
        this.createPond();

        // Add road
        this.createRoad();
        
        // Add environment props
        this.addEnvironmentProps();
    }

    createRoad() {
        // Create a larger circular road with increased width
        const roadGeometry = new THREE.RingGeometry(75, 112.5, 128); // Increased from 50,75 to 75,112.5 (50% bigger, 30% wider)
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.01;
        road.receiveShadow = true;
        this.scene.add(road);

        // Add road markings
        const markingGeometry = new THREE.RingGeometry(91.5, 96, 128); // Adjusted marking position for new road size
        const markingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.2
        });
        const marking = new THREE.Mesh(markingGeometry, markingMaterial);
        marking.rotation.x = -Math.PI / 2;
        marking.position.y = 0.02;
        this.scene.add(marking);

        // Add road texture
        const textureLoader = new THREE.TextureLoader();
        const roadTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        roadTexture.wrapS = THREE.RepeatWrapping;
        roadTexture.wrapT = THREE.RepeatWrapping;
        roadTexture.repeat.set(25, 25);
        roadMaterial.map = roadTexture;
    }

    createTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4d2926,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Create foliage (multiple layers for more realistic look)
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d5a27,
            roughness: 0.8,
            metalness: 0.1
        });

        // Bottom layer
        const bottomFoliage = new THREE.Mesh(
            new THREE.ConeGeometry(3, 4, 8),
            foliageMaterial
        );
        bottomFoliage.position.y = 3;
        bottomFoliage.castShadow = true;
        treeGroup.add(bottomFoliage);

        // Middle layer
        const middleFoliage = new THREE.Mesh(
            new THREE.ConeGeometry(2.5, 3, 8),
            foliageMaterial
        );
        middleFoliage.position.y = 5;
        middleFoliage.castShadow = true;
        treeGroup.add(middleFoliage);

        // Top layer
        const topFoliage = new THREE.Mesh(
            new THREE.ConeGeometry(2, 2, 8),
            foliageMaterial
        );
        topFoliage.position.y = 6.5;
        topFoliage.castShadow = true;
        treeGroup.add(topFoliage);

        treeGroup.position.set(x, 0, z);
        
        // Add collision data
        this.collisionObjects.push({
            position: new THREE.Vector3(x, 0, z),
            radius: 3, // Collision radius for trees
            type: 'tree'
        });
        
        return treeGroup;
    }

    createBush(x, z) {
        const bushGroup = new THREE.Group();
        
        // Create multiple spheres for a more natural bush look
        const bushMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d5a27,
            roughness: 0.8,
            metalness: 0.1
        });

        // Create 3-5 spheres of different sizes
        const numSpheres = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numSpheres; i++) {
            const radius = 0.5 + Math.random() * 0.5;
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 8, 8),
                bushMaterial
            );
            sphere.position.set(
                (Math.random() - 0.5) * 1.5,
                radius,
                (Math.random() - 0.5) * 1.5
            );
            sphere.castShadow = true;
            bushGroup.add(sphere);
        }

        bushGroup.position.set(x, 0, z);
        
        // Add collision data
        this.collisionObjects.push({
            position: new THREE.Vector3(x, 0, z),
            radius: 1.5, // Collision radius for bushes
            type: 'bush'
        });
        
        return bushGroup;
    }

    createPond() {
        // Pond geometry and material
        const pondRadius = 30;
        const pondGeometry = new THREE.CircleGeometry(pondRadius, 64);
        const pondMaterial = new THREE.MeshStandardMaterial({
            color: 0x4fc3f7,
            roughness: 0.3,
            metalness: 0.7,
            transparent: true,
            opacity: 0.85
        });
        const pond = new THREE.Mesh(pondGeometry, pondMaterial);
        pond.rotation.x = -Math.PI / 2;
        pond.position.set(0, 0.05, 0);
        pond.receiveShadow = true;
        this.scene.add(pond);
        this.pond = pond;

        // Add lotus flowers
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const r = pondRadius * 0.6 + Math.random() * pondRadius * 0.3;
            const x = Math.cos(angle) * r * 0.7;
            const z = Math.sin(angle) * r * 0.7;
            this.createLotus(x, z);
        }

        // Add fish
        this.fishGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            this.createFish(pondRadius);
        }
        this.scene.add(this.fishGroup);
    }

    createLotus(x, z) {
        // Lotus base (leaf)
        const leafGeometry = new THREE.CircleGeometry(2.2, 24);
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x6ecb77,
            roughness: 0.7,
            metalness: 0.2
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.rotation.x = -Math.PI / 2;
        leaf.position.set(x, 0.06, z);
        this.scene.add(leaf);

        // Lotus flower (petals)
        const petalGeometry = new THREE.ConeGeometry(0.5, 1.2, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: 0xf8bbd0,
            roughness: 0.5,
            metalness: 0.5
        });
        for (let i = 0; i < 6; i++) {
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            const angle = (i / 6) * Math.PI * 2;
            petal.position.set(
                x + Math.cos(angle) * 0.8,
                0.15,
                z + Math.sin(angle) * 0.8
            );
            petal.rotation.x = -Math.PI / 2;
            petal.rotation.z = angle;
            this.scene.add(petal);
        }
        // Lotus center
        const centerGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xfff176 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(x, 0.25, z);
        this.scene.add(center);
    }

    createFish(pondRadius) {
        // Fish body
        const fishGroup = new THREE.Group();
        const bodyGeometry = new THREE.SphereGeometry(1, 12, 12);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.7, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.2, 0.7, 0.7);
        fishGroup.add(body);
        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.4, 1, 8);
        const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xff7043 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(-1.1, 0, 0);
        tail.rotation.z = Math.PI / 2;
        fishGroup.add(tail);
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.5, 0.2, 0.3);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.5, 0.2, -0.3);
        fishGroup.add(leftEye);
        fishGroup.add(rightEye);
        // Random position in pond
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (pondRadius * 0.7);
        fishGroup.position.set(Math.cos(angle) * r, 0.2, Math.sin(angle) * r);
        // Animate fish
        fishGroup.userData = { angle, r, speed: 0.3 + Math.random() * 0.3, phase: Math.random() * Math.PI * 2 };
        this.fishGroup.add(fishGroup);
    }

    addEnvironmentProps() {
        // Add trees around the track
        const numTrees = 150; // Increased number of trees
        for (let i = 0; i < numTrees; i++) {
            const angle = (i / numTrees) * Math.PI * 2;
            const radius = 180 + Math.random() * 90; // Increased radius for trees
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            // Avoid placing trees on the pond
            if (Math.sqrt(x * x + z * z) < 40) continue;
            const tree = this.createTree(x, z);
            this.scene.add(tree);
        }

        // Add random trees in the center
        for (let i = 0; i < 30; i++) { // Increased number of center trees
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 67.5; // Increased radius for center trees
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            // Avoid placing trees on the pond
            if (Math.sqrt(x * x + z * z) < 40) continue;
            const tree = this.createTree(x, z);
            this.scene.add(tree);
        }

        // Add bushes
        const numBushes = 300; // Increased number of bushes
        for (let i = 0; i < numBushes; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 157.5 + Math.random() * 112.5; // Increased radius for bushes
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const bush = this.createBush(x, z);
            this.scene.add(bush);
        }

        // Add some rocks
        const numRocks = 75; // Increased number of rocks
        for (let i = 0; i < numRocks; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 168.75 + Math.random() * 101.25; // Increased radius for rocks
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5);
            const rockMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x808080,
                roughness: 0.9,
                metalness: 0.1
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, 0.25, z);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            this.scene.add(rock);
            
            // Add collision data for rocks
            this.collisionObjects.push({
                position: new THREE.Vector3(x, 0, z),
                radius: 1,
                type: 'rock'
            });
        }
    }

    setupCoins() {
        this.gameState.setupCoins();
        
        // Create coin meshes
        const coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const coinMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xFFD700,
            emissiveIntensity: 0.2
        });

        this.gameState.coins.forEach(coin => {
            const coinMesh = new THREE.Mesh(coinGeometry, coinMaterial);
            coinMesh.position.set(coin.position.x, 1, coin.position.z);
            coinMesh.rotation.x = Math.PI / 2;
            this.scene.add(coinMesh);
            this.coinMeshes.push(coinMesh);
        });
    }

    setupUI() {
        // Create countdown overlay
        this.countdownOverlay = document.createElement('div');
        this.countdownOverlay.style.position = 'absolute';
        this.countdownOverlay.style.top = '50%';
        this.countdownOverlay.style.left = '50%';
        this.countdownOverlay.style.transform = 'translate(-50%, -50%)';
        this.countdownOverlay.style.fontSize = '120px';
        this.countdownOverlay.style.fontFamily = 'Arial, sans-serif';
        this.countdownOverlay.style.color = 'white';
        this.countdownOverlay.style.textShadow = '0 0 20px rgba(0,0,0,0.5)';
        this.countdownOverlay.style.display = 'none';
        document.body.appendChild(this.countdownOverlay);

        // Create regular UI elements
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '20px';
        this.uiContainer.style.left = '20px';
        this.uiContainer.style.color = 'white';
        this.uiContainer.style.fontFamily = 'Arial, sans-serif';
        this.uiContainer.style.fontSize = '20px';
        this.uiContainer.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        this.uiContainer.style.display = 'none';
        document.body.appendChild(this.uiContainer);

        // Create UI elements
        this.scoreElement = document.createElement('div');
        this.speedElement = document.createElement('div');
        this.nitroElement = document.createElement('div');
        this.nitroBar = document.createElement('div');
        this.nitroBarFill = document.createElement('div');

        // Style speedometer with digital display
        this.speedElement.style.position = 'absolute';
        this.speedElement.style.bottom = '20px';
        this.speedElement.style.right = '20px';
        this.speedElement.style.fontSize = '32px';
        this.speedElement.style.fontWeight = 'bold';
        this.speedElement.style.color = '#00ff00';
        this.speedElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        this.speedElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.speedElement.style.padding = '15px 25px';
        this.speedElement.style.borderRadius = '10px';
        this.speedElement.style.fontFamily = 'Digital, Arial, sans-serif';
        this.speedElement.style.border = '2px solid #00ff00';
        this.speedElement.style.boxShadow = '0 0 10px rgba(0,255,0,0.3)';
        document.body.appendChild(this.speedElement);

        // Style nitro meter container
        this.nitroElement.style.position = 'absolute';
        this.nitroElement.style.bottom = '20px';
        this.nitroElement.style.right = '180px'; // Moved closer to speedometer
        this.nitroElement.style.width = '60px';
        this.nitroElement.style.height = '150px';
        this.nitroElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.nitroElement.style.padding = '15px';
        this.nitroElement.style.borderRadius = '10px';
        this.nitroElement.style.border = '2px solid #0088ff';
        this.nitroElement.style.boxShadow = '0 0 10px rgba(0,136,255,0.3)';
        this.nitroElement.style.display = 'flex';
        this.nitroElement.style.flexDirection = 'column';
        this.nitroElement.style.alignItems = 'center';
        document.body.appendChild(this.nitroElement);

        // Style nitro label
        const nitroLabel = document.createElement('div');
        nitroLabel.textContent = 'NITRO';
        nitroLabel.style.color = '#0088ff';
        nitroLabel.style.fontSize = '16px';
        nitroLabel.style.fontWeight = 'bold';
        nitroLabel.style.marginBottom = '10px';
        nitroLabel.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        this.nitroElement.appendChild(nitroLabel);

        // Style nitro bar background
        this.nitroBar.style.width = '20px';
        this.nitroBar.style.height = '100px';
        this.nitroBar.style.backgroundColor = 'rgba(0,136,255,0.2)';
        this.nitroBar.style.borderRadius = '10px';
        this.nitroBar.style.overflow = 'hidden';
        this.nitroBar.style.position = 'relative';
        this.nitroElement.appendChild(this.nitroBar);

        // Style nitro bar fill
        this.nitroBarFill.style.width = '100%';
        this.nitroBarFill.style.height = '100%';
        this.nitroBarFill.style.backgroundColor = '#0088ff';
        this.nitroBarFill.style.transition = 'height 0.1s ease-out';
        this.nitroBarFill.style.boxShadow = '0 0 10px rgba(0,136,255,0.5)';
        this.nitroBarFill.style.position = 'absolute';
        this.nitroBarFill.style.bottom = '0';
        this.nitroBar.appendChild(this.nitroBarFill);

        this.uiContainer.appendChild(this.scoreElement);

        // Create scoreboard
        this.scoreboard = document.createElement('div');
        this.scoreboard.style.display = 'none';
        this.scoreboard.style.position = 'absolute';
        this.scoreboard.style.top = '50%';
        this.scoreboard.style.left = '50%';
        this.scoreboard.style.transform = 'translate(-50%, -50%)';
        this.scoreboard.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.scoreboard.style.padding = '30px';
        this.scoreboard.style.borderRadius = '15px';
        this.scoreboard.style.color = 'white';
        this.scoreboard.style.fontFamily = 'Arial, sans-serif';
        this.scoreboard.style.textAlign = 'center';
        this.scoreboard.style.minWidth = '300px';
        this.scoreboard.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';

        // Add scoreboard elements
        this.scoreboardTitle = document.createElement('h2');
        this.scoreboardTitle.style.fontSize = '32px';
        this.scoreboardTitle.style.marginBottom = '20px';
        this.scoreboardTitle.style.color = '#FFD700';

        this.finalScoreElement = document.createElement('div');
        this.finalScoreElement.style.fontSize = '24px';
        this.finalScoreElement.style.marginBottom = '15px';

        this.coinsCollectedElement = document.createElement('div');
        this.coinsCollectedElement.style.fontSize = '20px';
        this.coinsCollectedElement.style.marginBottom = '15px';

        this.lapsCompletedElement = document.createElement('div');
        this.lapsCompletedElement.style.fontSize = '20px';
        this.lapsCompletedElement.style.marginBottom = '20px';

        this.restartButton = document.createElement('button');
        this.restartButton.textContent = 'Play Again';
        this.restartButton.style.padding = '10px 20px';
        this.restartButton.style.fontSize = '18px';
        this.restartButton.style.backgroundColor = '#4CAF50';
        this.restartButton.style.color = 'white';
        this.restartButton.style.border = 'none';
        this.restartButton.style.borderRadius = '5px';
        this.restartButton.style.cursor = 'pointer';
        this.restartButton.style.transition = 'background-color 0.3s';
        this.restartButton.onmouseover = () => this.restartButton.style.backgroundColor = '#45a049';
        this.restartButton.onmouseout = () => this.restartButton.style.backgroundColor = '#4CAF50';
        this.restartButton.onclick = () => window.location.reload();

        this.scoreboard.appendChild(this.scoreboardTitle);
        this.scoreboard.appendChild(this.finalScoreElement);
        this.scoreboard.appendChild(this.coinsCollectedElement);
        this.scoreboard.appendChild(this.lapsCompletedElement);
        this.scoreboard.appendChild(this.restartButton);

        document.body.appendChild(this.scoreboard);
    }

    startGame() {
        this.isCountdownActive = true;
        this.countdownValue = 3;
        this.countdownOverlay.style.display = 'block';
        this.countdownOverlay.textContent = this.countdownValue;
        
        const countdownInterval = setInterval(() => {
            this.countdownValue--;
            if (this.countdownValue > 0) {
                this.countdownOverlay.textContent = this.countdownValue;
            } else if (this.countdownValue === 0) {
                this.countdownOverlay.textContent = 'GO!';
            } else {
                clearInterval(countdownInterval);
                this.countdownOverlay.style.display = 'none';
                this.isGameStarted = true;
                this.uiContainer.style.display = 'block';
                this.gameState.startGame();
                // Notify mission manager that game has started
                if (this.missionManager) {
                    this.missionManager.onGameStart();
                }
                // Show minimap
                if (this.miniMap) {
                    this.miniMap.show();
                }
                // Update car color from menu selection
                if (this.car) {
                    this.car.updateColor(this.menu.getSelectedColor());
                }
            }
        }, 1000);
    }

    updateUI() {
        const score = this.gameState.getScore();
        const progress = this.gameState.getProgress();

        this.scoreElement.textContent = `Score: ${score}`;
        // this.coinsElement.textContent = `Coins: ${this.gameState.coinsCollected}/${this.gameState.totalCoins}`; // Commented out to remove coins display

        // Update speedometer with digital display
        const speed = Math.abs(this.car.speed * 10); // Example: scale to km/h
        this.speedElement.innerHTML = `
            <div style="font-size: 14px; margin-bottom: 5px;">SPEED</div>
            <div style="font-size: 36px;">${Math.round(speed)}</div>
            <div style="font-size: 14px;">km/h</div>
        `;

        // Update nitro meter with visual bar
        let percentage = 100;
        if (this.car.isBoosting) {
            percentage = 100 - (this.car.boostTime / this.car.boostDuration) * 100;
        } else if (this.car.boostCooldown > 0) {
            percentage = (this.car.boostCooldown / this.car.boostCooldownTime) * 100;
        }
        this.nitroBarFill.style.backgroundColor = percentage > 60 ? '#00ff00' : percentage > 30 ? '#ffff00' : '#ff0000';
        this.nitroBarFill.style.height = `${percentage}%`;
        
        // Add pulse and shimmer animation styles if not present
        if (!document.querySelector('#nitroPulseShimmer')) {
            const style = document.createElement('style');
            style.id = 'nitroPulseShimmer';
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                @keyframes shimmer {
                    0% { background-position: -40px 0; }
                    100% { background-position: 40px 0; }
                }
                @keyframes blink {
                    0%, 100% { filter: brightness(1.2); }
                    50% { filter: brightness(2.2); }
                }
            `;
            document.head.appendChild(style);
        }

        // Nitro recharge shimmer
        if (!this.car.isBoosting && percentage < 100 && this.car.boostCooldown <= 0) {
            this.nitroBarFill.style.backgroundImage = 'linear-gradient(90deg, #0088ff 60%, #66ccff 80%, #0088ff 100%)';
            this.nitroBarFill.style.backgroundSize = '40px 100%';
            this.nitroBarFill.style.animation = 'shimmer 1s linear infinite';
        } else if (percentage >= 100) {
            // Full nitro blink
            this.nitroBarFill.style.backgroundImage = '';
            this.nitroBarFill.style.animation = 'blink 0.7s steps(1, end) infinite';
        } else if (this.car.isBoosting) {
            // Nitro in use, keep pulse
            this.nitroBarFill.style.backgroundImage = '';
            this.nitroBarFill.style.animation = 'pulse 0.5s infinite';
        } else {
            // Default
            this.nitroBarFill.style.backgroundImage = '';
            this.nitroBarFill.style.animation = 'none';
        }

        // Update coin meshes
        this.coinMeshes.forEach((mesh, index) => {
            const coin = this.gameState.coins[index];
            if (coin.collected) {
                mesh.visible = false;
            } else {
                mesh.visible = true;
                mesh.rotation.y += 0.05; // Rotate coins
            }
        });

        // Check for game over
        if (this.gameState.isGameOver()) {
            this.scoreboard.style.display = 'block';
            this.scoreboardTitle.textContent = 'Exploration Complete!';
            this.finalScoreElement.textContent = `Final Score: ${score}`;
            this.coinsCollectedElement.textContent = `Total Coins Collected: ${this.gameState.coinsCollected}`;
            this.lapsCompletedElement.style.display = 'none'; // Hide laps element
        }
    }

    update(deltaTime) {
        if (!this.isGameStarted) return;

        // Update character
        if (this.character) {
            this.character.update(deltaTime);
            this.character.checkVehicleInteraction();
        }

        // Update active vehicle
        if (this.activeVehicle) {
            this.activeVehicle.update(deltaTime);
        }

        // Update game state with both positions
        const carPosition = this.car ? this.car.carGroup.position : null;
        const characterPosition = this.character ? this.character.characterGroup.position : null;
        this.gameState.update(deltaTime, carPosition, characterPosition);

        // Update missions
        if (this.missionManager) {
            this.missionManager.update();
        }

        // Update minimap
        if (this.miniMap) {
            this.miniMap.update();
        }

        // Update other systems
        if (this.mountains) this.mountains.update(deltaTime);
        if (this.randomEncounters) this.randomEncounters.update(deltaTime);
        if (this.weather) this.weather.update(deltaTime);

        // Update UI
        this.updateUI();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Add method to get collision objects
    getCollisionObjects() {
        return this.collisionObjects;
    }

    updateMapTheme(theme) {
        // Update scene background
        this.scene.background = new THREE.Color(theme.skyColor);

        // Update ground color
        if (this.ground) {
            this.ground.material.color.set(theme.groundColor);
        }

        // Update lighting
        if (this.ambientLight) {
            this.ambientLight.color.set(theme.ambientLight);
        }

        if (this.directionalLight) {
            this.directionalLight.color.set(theme.directionalLight.color);
            this.directionalLight.intensity = theme.directionalLight.intensity;
            this.directionalLight.position.copy(theme.directionalLight.position);
        }

        // Update fog
        this.scene.fog = new THREE.Fog(
            theme.fog.color,
            theme.fog.near,
            theme.fog.far
        );
    }

    setActiveVehicle(vehicle) {
        this.activeVehicle = vehicle;
        if (vehicle) {
            // Switch to vehicle controls
            this.camera.position.copy(vehicle.cameraOffset);
            this.camera.lookAt(vehicle.carGroup.position);
        } else {
            // Switch to character controls
            this.camera.position.copy(this.character.cameraOffset);
            this.camera.lookAt(this.character.characterGroup.position);
        }
    }

    getNearbyVehicles(position, radius) {
        const vehicles = [];
        if (this.car) {
            const distance = position.distanceTo(this.car.carGroup.position);
            if (distance <= radius) {
                vehicles.push(this.car);
            }
        }
        return vehicles;
    }

    updateSpeedometer() {
        if (this.car) {
            // Convert to km/h if needed, or just show the value
            const speed = Math.abs(this.car.speed * 10); // Example: scale to km/h
            this.speedElement.innerHTML = `
                <div style="font-size: 14px; margin-bottom: 5px;">SPEED</div>
                <div style="font-size: 36px;">${Math.round(speed)}</div>
                <div style="font-size: 14px;">km/h</div>
            `;
        }
    }

    updateNitroMeter() {
        if (this.car) {
            let percentage = 100;
            if (this.car.isBoosting) {
                percentage = 100 - (this.car.boostTime / this.car.boostDuration) * 100;
            } else if (this.car.boostCooldown > 0) {
                percentage = (this.car.boostCooldown / this.car.boostCooldownTime) * 100;
            }
            this.nitroBarFill.style.backgroundColor = percentage > 60 ? '#00ff00' : percentage > 30 ? '#ffff00' : '#ff0000';
            this.nitroBarFill.style.height = `${percentage}%`;
        }
    }
} 