import * as THREE from 'three';

export class MapThemes {
    static getTheme(themeName) {
        switch (themeName) {
            case 'dayZone':
                return {
                    name: 'Day Zone',
                    skyColor: 0x87CEEB,
                    groundColor: 0x90EE90,
                    ambientLight: 0xFFFFFF,
                    directionalLight: {
                        color: 0xFFFFFF,
                        intensity: 1.0,
                        position: new THREE.Vector3(50, 100, 50)
                    },
                    fog: {
                        color: 0x87CEEB,
                        near: 10,
                        far: 200
                    }
                };
            case 'nightZone':
                return {
                    name: 'Night Zone',
                    skyColor: 0x000033,
                    groundColor: 0x1a1a1a,
                    ambientLight: 0x000033,
                    directionalLight: {
                        color: 0xFFFFFF,
                        intensity: 0.3,
                        position: new THREE.Vector3(-50, 100, -50)
                    },
                    fog: {
                        color: 0x000033,
                        near: 10,
                        far: 200
                    }
                };
            case 'winterFell':
                return {
                    name: 'Winter Fell',
                    skyColor: 0xE0F7FF,
                    groundColor: 0xFFFFFF,
                    ambientLight: 0xCCCCCC,
                    directionalLight: {
                        color: 0xFFFFFF,
                        intensity: 0.8,
                        position: new THREE.Vector3(50, 100, 50)
                    },
                    fog: {
                        color: 0xE0F7FF,
                        near: 10,
                        far: 200
                    }
                };
            default:
                return this.getTheme('dayZone');
        }
    }
} 