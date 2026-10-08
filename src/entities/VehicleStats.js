export class VehicleStats {
    static getStats(vehicleType) {
        switch (vehicleType) {
            case 'sportsCar':
                return {
                    maxSpeed: 35,
                    baseSpeed: 15,
                    acceleration: 0.3,
                    deceleration: 0.2,
                    handling: 0.8,
                    boostMultiplier: 1.25,
                    boostDuration: 3,
                    boostCooldown: 5
                };
            case 'suv':
                return {
                    maxSpeed: 25,
                    baseSpeed: 12,
                    acceleration: 0.25,
                    deceleration: 0.15,
                    handling: 0.6,
                    boostMultiplier: 1.25,
                    boostDuration: 4,
                    boostCooldown: 6
                };
            case 'motorcycle':
                return {
                    maxSpeed: 40,
                    baseSpeed: 18,
                    acceleration: 0.35,
                    deceleration: 0.25,
                    handling: 0.9,
                    boostMultiplier: 1.25,
                    boostDuration: 2,
                    boostCooldown: 4
                };
            default:
                return this.getStats('sportsCar');
        }
    }
} 