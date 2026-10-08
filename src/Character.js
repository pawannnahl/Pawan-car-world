constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Create character model
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.model = new THREE.Mesh(geometry, material);
    this.model.position.y = 1; // Place on ground
    this.scene.add(this.model);

    // Add gun model
    const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.3);
    const gunMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.gun = new THREE.Mesh(gunGeometry, gunMaterial);
    this.gun.position.set(0.3, 0.5, 0.5); // Adjust position to fit character's hand
    this.model.add(this.gun);

    // Initialize ammo
    this.ammo = 30;
}

shoot() {
    if (this.ammo > 0) {
        // Create raycaster from camera
        const raycaster = new THREE.Raycaster();
        const center = new THREE.Vector2(0, 0); // Center of screen
        raycaster.setFromCamera(center, this.camera);

        // Check for intersections
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            console.log('Hit:', hitObject);
            
            // If hit a target, make it disappear
            if (hitObject.material && hitObject.material.color.getHex() === 0xff0000) {
                this.scene.remove(hitObject);
            }
        }

        // Decrease ammo
        this.ammo--;
        
        // Add muzzle flash effect
        const muzzleFlash = new THREE.PointLight(0xffff00, 1, 10);
        muzzleFlash.position.copy(this.gun.position);
        this.model.add(muzzleFlash);
        
        // Remove muzzle flash after 50ms
        setTimeout(() => {
            this.model.remove(muzzleFlash);
        }, 50);
    }
}

// Ammo system
this.updateAmmoUI = () => {
    // Update UI to show ammo count
    console.log('Ammo:', this.ammo);
}; 