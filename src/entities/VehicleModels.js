import * as THREE from 'three';

export class VehicleModels {
    static createSportsCar(game) {
        const carGroup = new THREE.Group();
        
        // Main body - more streamlined shape
        const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 4.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            metalness: 0.8,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        body.castShadow = true;
        carGroup.add(body);

        // Hood - more aerodynamic shape
        const hoodGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.4);
        const hoodMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.1
        });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 0.5, -1.3);
        hood.rotation.x = -Math.PI / 12; // Slight angle for aerodynamics
        body.add(hood);

        // Roof - more sporty shape
        const roofGeometry = new THREE.BoxGeometry(1.4, 0.5, 1.6);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.1
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 0.8, 0);
        body.add(roof);

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
        windshield.position.set(0, 0.9, -0.8);
        windshield.rotation.x = Math.PI / 6;
        body.add(windshield);

        // Rear window
        const rearWindow = new THREE.Mesh(windshieldGeometry, glassMaterial);
        rearWindow.position.set(0, 0.9, 0.8);
        rearWindow.rotation.x = -Math.PI / 6;
        body.add(rearWindow);

        // Side windows
        const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.5, 1.4);
        const leftWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        leftWindow.position.set(-0.7, 0.9, 0);
        body.add(leftWindow);

        const rightWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        rightWindow.position.set(0.7, 0.9, 0);
        body.add(rightWindow);

        // Add wheels with better detail
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

        const wheelPositions = [
            { x: -0.9, y: 0.4, z: -1.3 },
            { x: 0.9, y: 0.4, z: -1.3 },
            { x: -0.9, y: 0.4, z: 1.3 },
            { x: 0.9, y: 0.4, z: 1.3 }
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
            
            body.add(wheelGroup);
        });

        // Headlights
        const headlightGeometry = new THREE.CircleGeometry(0.15, 32);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });

        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.5, 0.5, -2);
        leftHeadlight.rotation.y = Math.PI;
        body.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.5, 0.5, -2);
        rightHeadlight.rotation.y = Math.PI;
        body.add(rightHeadlight);

        // Taillights
        const taillightGeometry = new THREE.CircleGeometry(0.12, 32);
        const taillightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });

        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-0.5, 0.5, 2);
        body.add(leftTaillight);

        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(0.5, 0.5, 2);
        body.add(rightTaillight);

        return carGroup;
    }

    static createSUV(game) {
        const carGroup = new THREE.Group();
        
        // Main body - more robust shape
        const bodyGeometry = new THREE.BoxGeometry(2.2, 1.2, 4.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        carGroup.add(body);

        // Roof - higher and more spacious
        const roofGeometry = new THREE.BoxGeometry(2, 0.8, 2.8);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.2
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 1.4, 0);
        body.add(roof);

        // Windows
        const glassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            metalness: 0.9,
            roughness: 0.1
        });

        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.9, 0.8, 0.1);
        const windshield = new THREE.Mesh(windshieldGeometry, glassMaterial);
        windshield.position.set(0, 1.2, -1.8);
        windshield.rotation.x = Math.PI / 8;
        body.add(windshield);

        // Rear window
        const rearWindow = new THREE.Mesh(windshieldGeometry, glassMaterial);
        rearWindow.position.set(0, 1.2, 1.8);
        rearWindow.rotation.x = -Math.PI / 8;
        body.add(rearWindow);

        // Side windows
        const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.7, 2.6);
        const leftWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        leftWindow.position.set(-1.05, 1.2, 0);
        body.add(leftWindow);

        const rightWindow = new THREE.Mesh(sideWindowGeometry, glassMaterial);
        rightWindow.position.set(1.05, 1.2, 0);
        body.add(rightWindow);

        // Add wheels with better detail
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.7
        });

        // Wheel rims
        const rimGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.41, 16);
        const rimMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            metalness: 0.9,
            roughness: 0.1
        });

        const wheelPositions = [
            { x: -1.1, y: 0.8, z: -1.6 },
            { x: 1.1, y: 0.8, z: -1.6 },
            { x: -1.1, y: 0.8, z: 1.6 },
            { x: 1.1, y: 0.8, z: 1.6 }
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
            
            body.add(wheelGroup);
        });

        // Headlights
        const headlightGeometry = new THREE.CircleGeometry(0.2, 32);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });

        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.7, 0.8, -2.3);
        leftHeadlight.rotation.y = Math.PI;
        body.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.7, 0.8, -2.3);
        rightHeadlight.rotation.y = Math.PI;
        body.add(rightHeadlight);

        // Taillights
        const taillightGeometry = new THREE.CircleGeometry(0.15, 32);
        const taillightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });

        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-0.7, 0.8, 2.3);
        body.add(leftTaillight);

        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(0.7, 0.8, 2.3);
        body.add(rightTaillight);

        return carGroup;
    }

    static createMotorcycle(game) {
        const bikeGroup = new THREE.Group();
        
        // Main frame - more detailed shape
        const frameGeometry = new THREE.BoxGeometry(0.6, 0.4, 2.2);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            metalness: 0.8,
            roughness: 0.2
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.8;
        frame.castShadow = true;
        bikeGroup.add(frame);

        // Fuel tank - more realistic shape
        const tankGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.7);
        const tankMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000,
            metalness: 0.8,
            roughness: 0.2
        });
        const tank = new THREE.Mesh(tankGeometry, tankMaterial);
        tank.position.set(0, 1.1, 0.3);
        tank.rotation.x = Math.PI / 12; // Slight angle for better look
        frame.add(tank);

        // Seat - more comfortable looking
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);
        const seatMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.2,
            roughness: 0.8
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, 1.2, -0.3);
        seat.rotation.x = -Math.PI / 24; // Slight angle for comfort
        frame.add(seat);

        // Handlebar - more realistic
        const handlebarGeometry = new THREE.BoxGeometry(1.2, 0.08, 0.08);
        const handlebarMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        const handlebar = new THREE.Mesh(handlebarGeometry, handlebarMaterial);
        handlebar.position.set(0, 1.4, -0.8);
        frame.add(handlebar);

        // Front fork - more detailed
        const forkGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.08);
        const forkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        const fork = new THREE.Mesh(forkGeometry, forkMaterial);
        fork.position.set(0, 0.4, -1.1);
        frame.add(fork);

        // Front wheel guard
        const frontGuardGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.3);
        const guardMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.2
        });
        const frontGuard = new THREE.Mesh(frontGuardGeometry, guardMaterial);
        frontGuard.position.set(0, 0.4, -1.1);
        frame.add(frontGuard);

        // Rear wheel guard
        const rearGuard = new THREE.Mesh(frontGuardGeometry, guardMaterial);
        rearGuard.position.set(0, 0.4, 1.1);
        frame.add(rearGuard);

        // Add wheels with better detail
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.5,
            roughness: 0.7
        });

        // Wheel rims
        const rimGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.16, 16);
        const rimMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            metalness: 0.9,
            roughness: 0.1
        });

        const wheelPositions = [
            { x: 0, y: 0.4, z: -1.1 },
            { x: 0, y: 0.4, z: 1.1 }
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
            
            frame.add(wheelGroup);
        });

        // Headlight
        const headlightGeometry = new THREE.CircleGeometry(0.12, 32);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });
        const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight.position.set(0, 1.2, -1.3);
        headlight.rotation.y = Math.PI;
        frame.add(headlight);

        // Taillight
        const taillightGeometry = new THREE.CircleGeometry(0.08, 32);
        const taillightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const taillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        taillight.position.set(0, 1.1, 1.3);
        frame.add(taillight);

        // Exhaust pipe
        const exhaustGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 16);
        const exhaustMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            metalness: 0.9,
            roughness: 0.1
        });
        const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        exhaust.position.set(0.3, 0.6, 0.8);
        exhaust.rotation.z = Math.PI / 4;
        frame.add(exhaust);

        return bikeGroup;
    }
} 