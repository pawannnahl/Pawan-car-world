import * as THREE from 'three';
import { VehicleModels } from '../entities/VehicleModels';
import { VehicleStats } from '../entities/VehicleStats';
import { MapThemes } from '../entities/MapThemes';

export class Menu {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'main'; // main, customize
        this.selectedColor = '#FF0000'; // Default red color
        this.selectedVehicle = 'sportsCar'; // Default vehicle
        this.selectedMap = 'dayZone'; // Default map
        this.setupMenu();
    }

    setupMenu() {
        // Create main container
        this.menuContainer = document.createElement('div');
        this.menuContainer.style.position = 'absolute';
        this.menuContainer.style.top = '0';
        this.menuContainer.style.left = '0';
        this.menuContainer.style.width = '100%';
        this.menuContainer.style.height = '100%';
        this.menuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.menuContainer.style.display = 'flex';
        this.menuContainer.style.flexDirection = 'column';
        this.menuContainer.style.alignItems = 'center';
        this.menuContainer.style.justifyContent = 'center';
        this.menuContainer.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(this.menuContainer);

        // Create main menu
        this.createMainMenu();
        
        // Create customize menu (initially hidden)
        this.createCustomizeMenu();
    }

    createMainMenu() {
        this.mainMenu = document.createElement('div');
        this.mainMenu.style.textAlign = 'center';

        // Game title
        const title = document.createElement('h1');
        title.textContent = 'CubeGo Racing';
        title.style.fontSize = '48px';
        title.style.color = '#FFD700';
        title.style.marginBottom = '50px';
        title.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
        this.mainMenu.appendChild(title);

        // Menu buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '20px';

        // Start button
        const startButton = this.createButton('Start Game', () => {
            this.menuContainer.style.display = 'none';
            this.game.startGame();
        });
        buttonContainer.appendChild(startButton);

        // Customize button
        const customizeButton = this.createButton('Customize', () => {
            this.showScreen('customize');
        });
        buttonContainer.appendChild(customizeButton);

        // Exit button
        const exitButton = this.createButton('Exit', () => {
            window.close();
        });
        buttonContainer.appendChild(exitButton);

        this.mainMenu.appendChild(buttonContainer);
        this.menuContainer.appendChild(this.mainMenu);
    }

    createCustomizeMenu() {
        this.customizeMenu = document.createElement('div');
        this.customizeMenu.style.textAlign = 'center';
        this.customizeMenu.style.display = 'none';

        // Back button
        const backButton = this.createButton('← Back', () => {
            this.showScreen('main');
        });
        backButton.style.position = 'absolute';
        backButton.style.top = '20px';
        backButton.style.left = '20px';
        this.customizeMenu.appendChild(backButton);

        // Customize title
        const title = document.createElement('h2');
        title.textContent = 'Customize Your Experience';
        title.style.fontSize = '36px';
        title.style.color = '#FFD700';
        title.style.marginBottom = '30px';
        this.customizeMenu.appendChild(title);

        // Create main container for side-by-side layout
        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.justifyContent = 'center';
        mainContainer.style.gap = '40px';
        mainContainer.style.padding = '20px';

        // Vehicle Settings Section
        const vehicleSection = document.createElement('div');
        vehicleSection.style.flex = '1';
        vehicleSection.style.maxWidth = '500px';
        vehicleSection.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        vehicleSection.style.padding = '20px';
        vehicleSection.style.borderRadius = '10px';

        const vehicleTitle = document.createElement('h3');
        vehicleTitle.textContent = 'Vehicle Settings';
        vehicleTitle.style.fontSize = '24px';
        vehicleTitle.style.marginBottom = '20px';
        vehicleTitle.style.color = 'white';
        vehicleSection.appendChild(vehicleTitle);

        // Vehicle Preview
        const vehiclePreviewSection = document.createElement('div');
        vehiclePreviewSection.style.marginBottom = '30px';
        vehiclePreviewSection.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        vehiclePreviewSection.style.padding = '20px';
        vehiclePreviewSection.style.borderRadius = '5px';

        const vehiclePreviewTitle = document.createElement('h4');
        vehiclePreviewTitle.textContent = 'Vehicle Preview';
        vehiclePreviewTitle.style.fontSize = '20px';
        vehiclePreviewTitle.style.marginBottom = '20px';
        vehiclePreviewTitle.style.color = 'white';
        vehiclePreviewSection.appendChild(vehiclePreviewTitle);

        // Create vehicle preview canvas
        this.vehiclePreviewCanvas = document.createElement('canvas');
        this.vehiclePreviewCanvas.width = 280;
        this.vehiclePreviewCanvas.height = 200;
        this.vehiclePreviewCanvas.style.backgroundColor = '#1a1a1a';
        this.vehiclePreviewCanvas.style.borderRadius = '5px';
        vehiclePreviewSection.appendChild(this.vehiclePreviewCanvas);

        // Setup vehicle preview renderer
        this.vehiclePreviewRenderer = new THREE.WebGLRenderer({ canvas: this.vehiclePreviewCanvas, antialias: true });
        this.vehiclePreviewRenderer.setSize(280, 200);
        this.vehiclePreviewScene = new THREE.Scene();
        this.vehiclePreviewCamera = new THREE.PerspectiveCamera(45, 280/200, 0.1, 1000);
        this.vehiclePreviewCamera.position.set(0, 2, 5);
        this.vehiclePreviewCamera.lookAt(0, 0, 0);

        // Add lights to vehicle preview
        const vehicleAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.vehiclePreviewScene.add(vehicleAmbientLight);
        const vehicleDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        vehicleDirectionalLight.position.set(5, 5, 5);
        this.vehiclePreviewScene.add(vehicleDirectionalLight);

        // Add vehicle stats display
        const vehicleStatsContainer = document.createElement('div');
        vehicleStatsContainer.style.marginTop = '20px';
        vehicleStatsContainer.style.padding = '10px';
        vehicleStatsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        vehicleStatsContainer.style.borderRadius = '5px';
        this.vehicleStatsContainer = vehicleStatsContainer;
        vehiclePreviewSection.appendChild(vehicleStatsContainer);

        vehicleSection.appendChild(vehiclePreviewSection);

        // Create vehicle preview vehicle
        this.vehiclePreviewVehicle = null;
        this.updateVehiclePreview();

        // Vehicle selection
        const vehicleOptions = document.createElement('div');
        vehicleOptions.style.display = 'flex';
        vehicleOptions.style.justifyContent = 'center';
        vehicleOptions.style.gap = '20px';
        vehicleOptions.style.marginBottom = '20px';

        const vehicles = [
            { name: 'Sports Car', value: 'sportsCar' },
            { name: 'SUV', value: 'suv' },
            { name: 'Motorcycle', value: 'motorcycle' }
        ];

        vehicles.forEach(vehicle => {
            const vehicleButton = document.createElement('button');
            vehicleButton.textContent = vehicle.name;
            vehicleButton.style.padding = '10px 20px';
            vehicleButton.style.fontSize = '18px';
            vehicleButton.style.backgroundColor = '#333';
            vehicleButton.style.color = 'white';
            vehicleButton.style.border = '3px solid white';
            vehicleButton.style.borderRadius = '5px';
            vehicleButton.style.cursor = 'pointer';
            vehicleButton.style.transition = 'all 0.3s';
            
            vehicleButton.onmouseover = () => {
                vehicleButton.style.transform = 'scale(1.05)';
            };
            vehicleButton.onmouseout = () => {
                if (this.selectedVehicle !== vehicle.value) {
                    vehicleButton.style.transform = 'scale(1)';
                }
            };
            vehicleButton.onclick = () => {
                this.selectedVehicle = vehicle.value;
                vehicleOptions.querySelectorAll('button').forEach(btn => {
                    btn.style.transform = 'scale(1)';
                    btn.style.border = '3px solid white';
                });
                vehicleButton.style.transform = 'scale(1.05)';
                vehicleButton.style.border = '3px solid #FFD700';
                this.updateVehiclePreview();
            };
            
            vehicleOptions.appendChild(vehicleButton);
        });

        vehicleSection.appendChild(vehicleOptions);

        // Color selection
        const colorOptions = document.createElement('div');
        colorOptions.style.display = 'flex';
        colorOptions.style.justifyContent = 'center';
        colorOptions.style.gap = '20px';
        colorOptions.style.marginBottom = '20px';

        const colors = [
            { name: 'Red', value: '#FF0000' },
            { name: 'Blue', value: '#0000FF' },
            { name: 'Green', value: '#00FF00' },
            { name: 'Yellow', value: '#FFFF00' },
            { name: 'Purple', value: '#800080' },
            { name: 'Orange', value: '#FFA500' }
        ];

        colors.forEach(color => {
            const colorButton = document.createElement('button');
            colorButton.style.width = '50px';
            colorButton.style.height = '50px';
            colorButton.style.borderRadius = '50%';
            colorButton.style.border = '3px solid white';
            colorButton.style.backgroundColor = color.value;
            colorButton.style.cursor = 'pointer';
            colorButton.style.transition = 'all 0.3s';
            
            colorButton.onmouseover = () => {
                colorButton.style.transform = 'scale(1.1)';
            };
            colorButton.onmouseout = () => {
                if (this.selectedColor !== color.value) {
                    colorButton.style.transform = 'scale(1)';
                }
            };
            colorButton.onclick = () => {
                this.selectedColor = color.value;
                colorOptions.querySelectorAll('button').forEach(btn => {
                    btn.style.transform = 'scale(1)';
                    btn.style.border = '3px solid white';
                });
                colorButton.style.transform = 'scale(1.1)';
                colorButton.style.border = '3px solid #FFD700';
                this.updateVehiclePreview();
            };
            
            colorOptions.appendChild(colorButton);
        });

        vehicleSection.appendChild(colorOptions);

        // Map Settings Section
        const mapSection = document.createElement('div');
        mapSection.style.flex = '1';
        mapSection.style.maxWidth = '500px';
        mapSection.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        mapSection.style.padding = '20px';
        mapSection.style.borderRadius = '10px';

        const mapTitle = document.createElement('h3');
        mapTitle.textContent = 'Map Settings';
        mapTitle.style.fontSize = '24px';
        mapTitle.style.marginBottom = '20px';
        mapTitle.style.color = 'white';
        mapSection.appendChild(mapTitle);

        // Map Preview
        const mapPreviewSection = document.createElement('div');
        mapPreviewSection.style.marginBottom = '30px';
        mapPreviewSection.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        mapPreviewSection.style.padding = '20px';
        mapPreviewSection.style.borderRadius = '5px';

        const mapPreviewTitle = document.createElement('h4');
        mapPreviewTitle.textContent = 'Map Preview';
        mapPreviewTitle.style.fontSize = '20px';
        mapPreviewTitle.style.marginBottom = '20px';
        mapPreviewTitle.style.color = 'white';
        mapPreviewSection.appendChild(mapPreviewTitle);

        // Create map preview canvas
        this.mapPreviewCanvas = document.createElement('canvas');
        this.mapPreviewCanvas.width = 280;
        this.mapPreviewCanvas.height = 200;
        this.mapPreviewCanvas.style.backgroundColor = '#1a1a1a';
        this.mapPreviewCanvas.style.borderRadius = '5px';
        mapPreviewSection.appendChild(this.mapPreviewCanvas);

        // Setup map preview renderer
        this.mapPreviewRenderer = new THREE.WebGLRenderer({ canvas: this.mapPreviewCanvas, antialias: true });
        this.mapPreviewRenderer.setSize(280, 200);
        this.mapPreviewScene = new THREE.Scene();
        this.mapPreviewCamera = new THREE.PerspectiveCamera(45, 280/200, 0.1, 1000);
        this.mapPreviewCamera.position.set(0, 10, 20);
        this.mapPreviewCamera.lookAt(0, 0, 0);

        // Add lights to map preview
        const mapAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.mapPreviewScene.add(mapAmbientLight);
        const mapDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mapDirectionalLight.position.set(5, 5, 5);
        this.mapPreviewScene.add(mapDirectionalLight);

        // Create map preview elements
        this.createMapPreview();
        mapPreviewSection.appendChild(this.mapPreviewCanvas);
        mapSection.appendChild(mapPreviewSection);

        // Map selection
        const mapOptions = document.createElement('div');
        mapOptions.style.display = 'flex';
        mapOptions.style.justifyContent = 'center';
        mapOptions.style.gap = '20px';
        mapOptions.style.marginBottom = '20px';

        const maps = [
            { name: 'Day Zone', value: 'dayZone' },
            { name: 'Night Zone', value: 'nightZone' },
            { name: 'Winter Fell', value: 'winterFell' }
        ];

        maps.forEach(map => {
            const mapButton = document.createElement('button');
            mapButton.textContent = map.name;
            mapButton.style.padding = '10px 20px';
            mapButton.style.fontSize = '18px';
            mapButton.style.backgroundColor = '#333';
            mapButton.style.color = 'white';
            mapButton.style.border = '3px solid white';
            mapButton.style.borderRadius = '5px';
            mapButton.style.cursor = 'pointer';
            mapButton.style.transition = 'all 0.3s';
            
            mapButton.onmouseover = () => {
                mapButton.style.transform = 'scale(1.05)';
            };
            mapButton.onmouseout = () => {
                if (this.selectedMap !== map.value) {
                    mapButton.style.transform = 'scale(1)';
                }
            };
            mapButton.onclick = () => {
                this.selectedMap = map.value;
                mapOptions.querySelectorAll('button').forEach(btn => {
                    btn.style.transform = 'scale(1)';
                    btn.style.border = '3px solid white';
                });
                mapButton.style.transform = 'scale(1.05)';
                mapButton.style.border = '3px solid #FFD700';
                this.updateMapPreview();
            };
            
            mapOptions.appendChild(mapButton);
        });

        mapSection.appendChild(mapOptions);

        // Add sections to main container
        mainContainer.appendChild(vehicleSection);
        mainContainer.appendChild(mapSection);
        this.customizeMenu.appendChild(mainContainer);

        // Apply Changes button
        const applyButton = this.createButton('Apply Changes', () => {
            this.applyChanges();
        });
        applyButton.style.marginTop = '20px';
        this.customizeMenu.appendChild(applyButton);

        this.menuContainer.appendChild(this.customizeMenu);

        // Start preview animations
        this.animatePreviews();
    }

    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '15px 40px';
        button.style.fontSize = '24px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.3s';
        button.style.minWidth = '200px';
        
        button.onmouseover = () => {
            button.style.backgroundColor = '#45a049';
            button.style.transform = 'scale(1.05)';
        };
        button.onmouseout = () => {
            button.style.backgroundColor = '#4CAF50';
            button.style.transform = 'scale(1)';
        };
        button.onclick = onClick;
        
        return button;
    }

    showScreen(screen) {
        if (screen === 'main') {
            this.mainMenu.style.display = 'block';
            this.customizeMenu.style.display = 'none';
        } else if (screen === 'customize') {
            this.mainMenu.style.display = 'none';
            this.customizeMenu.style.display = 'block';
        }
        this.currentScreen = screen;
    }

    getSelectedColor() {
        return this.selectedColor;
    }

    getSelectedVehicle() {
        return this.selectedVehicle;
    }

    updateStats() {
        const stats = VehicleStats.getStats(this.selectedVehicle);
        this.vehicleStatsContainer.innerHTML = `
            <div style="color: white; text-align: left; font-size: 14px;">
                <div style="margin-bottom: 5px;">
                    <span style="color: #FFD700;">Speed:</span> 
                    <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div style="width: ${(stats.maxSpeed/40)*100}%; height: 100%; background: #4CAF50; border-radius: 4px;"></div>
                    </div>
                </div>
                <div style="margin-bottom: 5px;">
                    <span style="color: #FFD700;">Acceleration:</span>
                    <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div style="width: ${(stats.acceleration/0.5)*100}%; height: 100%; background: #2196F3; border-radius: 4px;"></div>
                    </div>
                </div>
                <div style="margin-bottom: 5px;">
                    <span style="color: #FFD700;">Handling:</span>
                    <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div style="width: ${(stats.handling/1.0)*100}%; height: 100%; background: #FF9800; border-radius: 4px;"></div>
                    </div>
                </div>
                <div style="margin-bottom: 5px;">
                    <span style="color: #FFD700;">Boost:</span>
                    <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; margin-top: 2px;">
                        <div style="width: ${(stats.boostMultiplier/3.0)*100}%; height: 100%; background: #F44336; border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    updatePreview() {
        // Remove old preview vehicle if it exists
        if (this.previewVehicle) {
            this.previewScene.remove(this.previewVehicle);
        }

        // Create new preview vehicle
        switch (this.selectedVehicle) {
            case 'sportsCar':
                this.previewVehicle = VehicleModels.createSportsCar(this.game);
                break;
            case 'suv':
                this.previewVehicle = VehicleModels.createSUV(this.game);
                break;
            case 'motorcycle':
                this.previewVehicle = VehicleModels.createMotorcycle(this.game);
                break;
        }

        // Apply selected color
        const color = new THREE.Color(this.selectedColor);
        this.previewVehicle.traverse((child) => {
            if (child.isMesh && child.material) {
                if (!child.material.emissive && !child.material.transparent) {
                    child.material.color.set(color);
                }
            }
        });

        this.previewScene.add(this.previewVehicle);
        this.updateStats();
    }

    animatePreview() {
        if (this.previewVehicle) {
            this.previewVehicle.rotation.y += 0.01;
        }
        this.previewRenderer.render(this.previewScene, this.previewCamera);
        requestAnimationFrame(() => this.animatePreview());
    }

    applyChanges() {
        // Update vehicle model
        let newVehicle;
        switch (this.selectedVehicle) {
            case 'sportsCar':
                newVehicle = VehicleModels.createSportsCar(this.game);
                break;
            case 'suv':
                newVehicle = VehicleModels.createSUV(this.game);
                break;
            case 'motorcycle':
                newVehicle = VehicleModels.createMotorcycle(this.game);
                break;
        }

        // Update color
        const color = new THREE.Color(this.selectedColor);
        newVehicle.traverse((child) => {
            if (child.isMesh && child.material) {
                if (!child.material.emissive && !child.material.transparent) {
                    child.material.color.set(color);
                }
            }
        });

        // Update the car in the game with new stats
        if (this.game.car) {
            this.game.car.updateVehicle(newVehicle);
            this.game.car.updateStats(VehicleStats.getStats(this.selectedVehicle));
        }

        // Update map theme
        const theme = MapThemes.getTheme(this.selectedMap);
        this.game.updateMapTheme(theme);

        // Create confirmation overlay
        const confirmationOverlay = document.createElement('div');
        confirmationOverlay.style.position = 'fixed';
        confirmationOverlay.style.top = '0';
        confirmationOverlay.style.left = '0';
        confirmationOverlay.style.width = '100%';
        confirmationOverlay.style.height = '100%';
        confirmationOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        confirmationOverlay.style.display = 'flex';
        confirmationOverlay.style.flexDirection = 'column';
        confirmationOverlay.style.alignItems = 'center';
        confirmationOverlay.style.justifyContent = 'center';
        confirmationOverlay.style.zIndex = '1000';

        const confirmationMessage = document.createElement('div');
        confirmationMessage.textContent = 'Changes Applied Successfully!';
        confirmationMessage.style.color = '#4CAF50';
        confirmationMessage.style.fontSize = '32px';
        confirmationMessage.style.marginBottom = '20px';
        confirmationMessage.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.5)';

        const checkmark = document.createElement('div');
        checkmark.textContent = '✓';
        checkmark.style.color = '#4CAF50';
        checkmark.style.fontSize = '64px';
        checkmark.style.marginBottom = '20px';
        checkmark.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.5)';

        confirmationOverlay.appendChild(checkmark);
        confirmationOverlay.appendChild(confirmationMessage);
        document.body.appendChild(confirmationOverlay);

        // Remove confirmation after 2 seconds
        setTimeout(() => {
            document.body.removeChild(confirmationOverlay);
        }, 2000);
    }

    createMapPreview() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x90EE90,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        this.mapPreviewScene.add(ground);

        // Create road
        const roadGeometry = new THREE.RingGeometry(5, 7, 32);
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.01;
        this.mapPreviewScene.add(road);

        // Add some trees
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 10;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const treeGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
            const treeMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x4d2926,
                roughness: 0.9,
                metalness: 0.1
            });
            const trunk = new THREE.Mesh(treeGeometry, treeMaterial);
            trunk.position.set(x, 0.5, z);
            this.mapPreviewScene.add(trunk);

            const foliageGeometry = new THREE.ConeGeometry(0.5, 1, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x2d5a27,
                roughness: 0.8,
                metalness: 0.1
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(x, 1.5, z);
            this.mapPreviewScene.add(foliage);
        }
    }

    updateVehiclePreview() {
        // Remove old preview vehicle if it exists
        if (this.vehiclePreviewVehicle) {
            this.vehiclePreviewScene.remove(this.vehiclePreviewVehicle);
        }

        // Create new preview vehicle
        switch (this.selectedVehicle) {
            case 'sportsCar':
                this.vehiclePreviewVehicle = VehicleModels.createSportsCar(this.game);
                break;
            case 'suv':
                this.vehiclePreviewVehicle = VehicleModels.createSUV(this.game);
                break;
            case 'motorcycle':
                this.vehiclePreviewVehicle = VehicleModels.createMotorcycle(this.game);
                break;
        }

        // Apply selected color
        const color = new THREE.Color(this.selectedColor);
        this.vehiclePreviewVehicle.traverse((child) => {
            if (child.isMesh && child.material) {
                if (!child.material.emissive && !child.material.transparent) {
                    child.material.color.set(color);
                }
            }
        });

        this.vehiclePreviewScene.add(this.vehiclePreviewVehicle);
        this.updateStats();
    }

    updateMapPreview() {
        const theme = MapThemes.getTheme(this.selectedMap);
        
        // Update scene background
        this.mapPreviewScene.background = new THREE.Color(theme.skyColor);

        // Update ground color
        this.mapPreviewScene.children.forEach(child => {
            if (child.isMesh && child.material) {
                if (child.geometry.type === 'PlaneGeometry') {
                    child.material.color.set(theme.groundColor);
                }
            }
        });

        // Update lighting
        this.mapPreviewScene.children.forEach(child => {
            if (child instanceof THREE.Light) {
                if (child instanceof THREE.AmbientLight) {
                    child.color.set(theme.ambientLight);
                } else if (child instanceof THREE.DirectionalLight) {
                    child.color.set(theme.directionalLight.color);
                    child.intensity = theme.directionalLight.intensity;
                }
            }
        });

        // Update fog
        this.mapPreviewScene.fog = new THREE.Fog(
            theme.fog.color,
            theme.fog.near,
            theme.fog.far
        );
    }

    animatePreviews() {
        // Animate vehicle preview
        if (this.vehiclePreviewVehicle) {
            this.vehiclePreviewVehicle.rotation.y += 0.01;
        }
        this.vehiclePreviewRenderer.render(this.vehiclePreviewScene, this.vehiclePreviewCamera);

        // Animate map preview
        this.mapPreviewRenderer.render(this.mapPreviewScene, this.mapPreviewCamera);

        requestAnimationFrame(() => this.animatePreviews());
    }
} 