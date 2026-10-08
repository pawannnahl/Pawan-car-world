createSensitivityControls() {
    const sensitivityContainer = document.createElement('div');
    sensitivityContainer.className = 'sensitivity-controls';
    sensitivityContainer.style.marginTop = '20px';
    sensitivityContainer.style.padding = '10px';
    sensitivityContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    sensitivityContainer.style.borderRadius = '5px';

    const title = document.createElement('h3');
    title.textContent = 'Sensitivity Settings';
    title.style.color = '#fff';
    title.style.marginBottom = '15px';
    sensitivityContainer.appendChild(title);

    // Get current sensitivity settings
    const currentSettings = this.car.getSensitivitySettings();

    // Create sliders for each sensitivity setting
    const settings = [
        { name: 'Steering', key: 'steering', min: 0.5, max: 2.0, step: 0.1 },
        { name: 'Acceleration', key: 'acceleration', min: 0.5, max: 2.0, step: 0.1 },
        { name: 'Braking', key: 'braking', min: 0.5, max: 2.0, step: 0.1 },
        { name: 'Drift', key: 'drift', min: 0.5, max: 2.0, step: 0.1 },
        { name: 'Camera', key: 'camera', min: 0.5, max: 2.0, step: 0.1 }
    ];

    settings.forEach(setting => {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = setting.name;
        label.style.color = '#fff';
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        container.appendChild(label);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = setting.min;
        slider.max = setting.max;
        slider.step = setting.step;
        slider.value = currentSettings[setting.key];
        slider.style.width = '100%';
        slider.style.marginBottom = '5px';

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = slider.value;
        valueDisplay.style.color = '#fff';
        valueDisplay.style.marginLeft = '10px';

        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            const newSettings = { [setting.key]: parseFloat(slider.value) };
            this.car.updateSensitivity(newSettings);
        });

        container.appendChild(slider);
        container.appendChild(valueDisplay);
        sensitivityContainer.appendChild(container);
    });

    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset to Default';
    resetButton.style.marginTop = '10px';
    resetButton.style.padding = '5px 10px';
    resetButton.style.backgroundColor = '#4CAF50';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '3px';
    resetButton.style.cursor = 'pointer';

    resetButton.addEventListener('click', () => {
        const defaultSettings = {
            steering: 1.0,
            acceleration: 1.0,
            braking: 1.0,
            drift: 1.0,
            camera: 1.0
        };
        this.car.updateSensitivity(defaultSettings);
        
        // Update all sliders to default values
        settings.forEach(setting => {
            const slider = sensitivityContainer.querySelector(`input[type="range"]`);
            if (slider) {
                slider.value = defaultSettings[setting.key];
                slider.nextElementSibling.textContent = defaultSettings[setting.key];
            }
        });
    });

    sensitivityContainer.appendChild(resetButton);
    return sensitivityContainer;
}

// Add this to your existing createMenu method
createMenu() {
    // ... existing menu creation code ...

    // Add sensitivity controls
    const sensitivityControls = this.createSensitivityControls();
    this.menuContainer.appendChild(sensitivityControls);

    // ... rest of the existing code ...
} 