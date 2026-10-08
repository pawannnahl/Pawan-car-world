import { Game } from './core/Game';

// Create loading message
const loadingMessage = document.createElement('div');
loadingMessage.style.position = 'fixed';
loadingMessage.style.top = '50%';
loadingMessage.style.left = '50%';
loadingMessage.style.transform = 'translate(-50%, -50%)';
loadingMessage.style.color = 'white';
loadingMessage.style.fontSize = '24px';
loadingMessage.style.fontFamily = 'Arial, sans-serif';
loadingMessage.textContent = 'Loading...';
document.body.appendChild(loadingMessage);

// Initialize game
const game = new Game();

async function init() {
    try {
        await game.init();
        loadingMessage.remove();
        animate();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        loadingMessage.textContent = 'Failed to load game. Please refresh the page.';
        loadingMessage.style.color = 'red';
    }
}

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = game.clock.getDelta();
    game.update(deltaTime);
    game.render();
}

init(); 