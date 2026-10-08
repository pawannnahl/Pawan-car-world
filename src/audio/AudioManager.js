export class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.music = null;
        this.isMuted = false;
        this.volume = 0.5;
    }

    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, {
                buffer: audioBuffer,
                context: audioContext
            });
        } catch (error) {
            console.error(`Failed to load sound ${name}:`, error);
        }
    }

    async loadMusic(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            this.music = {
                buffer: audioBuffer,
                context: audioContext,
                source: null,
                gainNode: null
            };
        } catch (error) {
            console.error('Failed to load music:', error);
        }
    }

    playSound(name, options = {}) {
        if (this.isMuted) return;

        const sound = this.sounds.get(name);
        if (!sound) return;

        const source = sound.context.createBufferSource();
        const gainNode = sound.context.createGain();
        
        source.buffer = sound.buffer;
        gainNode.gain.value = (options.volume || 1) * this.volume;
        
        source.connect(gainNode);
        gainNode.connect(sound.context.destination);
        
        source.start(0);
    }

    playMusic(loop = true) {
        if (this.isMuted || !this.music) return;

        const source = this.music.context.createBufferSource();
        const gainNode = this.music.context.createGain();
        
        source.buffer = this.music.buffer;
        source.loop = loop;
        gainNode.gain.value = this.volume * 0.5; // Music is slightly quieter
        
        source.connect(gainNode);
        gainNode.connect(this.music.context.destination);
        
        this.music.source = source;
        this.music.gainNode = gainNode;
        
        source.start(0);
    }

    stopMusic() {
        if (this.music && this.music.source) {
            this.music.source.stop();
            this.music.source = null;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.music && this.music.gainNode) {
            this.music.gainNode.gain.value = this.volume * 0.5;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
    }

    // Predefined sound effects
    async loadDefaultSounds() {
        const sounds = {
            shoot: '/sounds/shoot.mp3',
            reload: '/sounds/reload.mp3',
            hit: '/sounds/hit.mp3',
            enemyDeath: '/sounds/enemy-death.mp3',
            playerDamage: '/sounds/player-damage.mp3',
            waveStart: '/sounds/wave-start.mp3',
            gameOver: '/sounds/game-over.mp3'
        };

        for (const [name, url] of Object.entries(sounds)) {
            await this.loadSound(name, url);
        }

        // Load background music
        await this.loadMusic('/sounds/background-music.mp3');
    }
} 