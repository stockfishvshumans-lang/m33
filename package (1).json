// ==========================================
// 🔊 THE FINAL SOUND ENGINE (PRO AUDIO)
// ==========================================
window.Sound = {
    ctx: null,
    masterGain: null,
    isMuted: false,
    activeNodes: [], // Tracks active oscillators/intervals
    currentMode: null,
   
// PRESETS
    laser: function() { 
        if(!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(1200, t);
        o.frequency.exponentialRampToValueAtTime(100, t + 0.2); 
        g.gain.setValueAtTime(0.3, t); 
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        o.connect(g); g.connect(this.masterGain);
        o.start(); o.stop(t + 0.2);
    }, 
    boom: function() { this.playTone(50, 'square', 0.5, 0.6); }, 
    error: function() { this.playTone(150, 'sawtooth', 0.2, 0.2); }, 
    
    // 🟢 ITO ANG NAWAWALA NA NAGPAPACRASH SA BOSS AT EMP!
    nuke: function() { this.playTone(30, 'square', 2.0, 0.8); }, 
    
    powerup: function() {
        if(!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.frequency.setValueAtTime(400, t);
        o.frequency.linearRampToValueAtTime(2000, t + 0.5); 
        g.gain.setValueAtTime(0.2, t);
        g.gain.linearRampToValueAtTime(0, t + 0.5);
        o.connect(g); g.connect(this.masterGain);
        o.start(); o.stop(t + 0.5);
    },
    click: function() { 
        if(!this.ctx) this.init(); 
        this.playTone(1000, 'sine', 0.05, 0.1); 
    },

    // --- 1. INITIALIZATION ---
    init: function() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            // MASTER VOLUME LIMITER (Tinaasan sa 0.6 para malakas)
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.6; 
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.log("Audio waiting for user..."));
        }
    },

    // --- 2. TOGGLE MUTE ---
    toggle: function() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.6, now + 0.5);
        }
        return this.isMuted;
    },

    // --- 3. VOICE COMMANDER (Sci-Fi Voice) ---
    speak: function(text) {
        if (this.isMuted || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.0; 
        u.pitch = 0.8; // Deep authoritative voice
        u.volume = 1.0;
        const v = window.speechSynthesis.getVoices().find(v => v.name.includes('Google US English') || v.name.includes('Zira'));
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
    },

    // --- 4. HIGH-TECH SFX (Filtered) ---
    playTone: function(freq, type, duration, vol = 0.1) {
        if (!this.ctx || this.isMuted) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter(); 

            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            
            // Lowpass Filter removes the "Sabog/Buzz" sound
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1200, t); 

            // Envelopes (Smooth Attack/Release)
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(vol, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(t);
            osc.stop(t + duration);
            
            setTimeout(() => { osc.disconnect(); }, duration * 1000 + 100);
        } catch (e) {}
    },

    // --- 🌠 SHOOTING STAR EFFECT (NEW) ---
    starSweep: function() {
        if (!this.ctx || this.isMuted) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            const f = this.ctx.createBiquadFilter();

            // Mabilis na pagtaas ng pitch (Swoosh effect)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.exponentialRampToValueAtTime(3000, t + 0.5); 

            f.type = 'bandpass';
            f.frequency.value = 2000;

            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.3, t + 0.1);
            g.gain.linearRampToValueAtTime(0, t + 0.5);

            osc.connect(f); f.connect(g); g.connect(this.masterGain);
            osc.start(); osc.stop(t + 0.5);
        } catch(e) {}
    },

    // --- 5. ATMOSPHERIC BGM ENGINE ---
    playBGM: function(mode) {
        this.init(); // Ensure context exists
        if (!this.ctx || this.isMuted || this.currentMode === mode) return;
        
        this.stopBGM(); 
        this.currentMode = mode;
        const t = this.ctx.currentTime;

        if (mode === 'intro') {
            // Layer 1: Deep Engine Growl
            const osc1 = this.ctx.createOscillator();
            const g1 = this.ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(40, t);
            osc1.frequency.linearRampToValueAtTime(100, t + 6); // Rising engine
            
            const f1 = this.ctx.createBiquadFilter();
            f1.type = 'lowpass';
            f1.frequency.value = 400;

            g1.gain.value = 0.5;

            osc1.connect(f1); f1.connect(g1); g1.connect(this.masterGain);
            osc1.start();
            this.activeNodes.push(osc1, g1, f1);

            const starInterval = setInterval(() => {
                if(this.currentMode === 'intro' && Math.random() > 0.4) {
                    this.starSweep();
                }
            }, 600); // Check every 600ms
            this.activeNodes.push({ stop: () => clearInterval(starInterval) });
        } 
        else if (mode === 'menu') {
            this.createPad(220, 'sine', 0.25);    // Chord note 1
            this.createPad(261.63, 'sine', 0.2);  // Chord note 2
            this.createPad(110, 'triangle', 0.15); // Sub-base drone
        } 
        else if (mode === 'battle') {
            this.createPad(55, 'sawtooth', 0.2); // Low synth bass
            
            let beat = 0;
            const sequencer = setInterval(() => {
                if (this.isMuted || this.currentMode !== 'battle') return;
                const now = this.ctx.currentTime;
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const flt = this.ctx.createBiquadFilter();
                
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.4); 
                
                flt.type = "lowpass";
                flt.frequency.value = 150; // Muffled Kick
                
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                
                osc.connect(flt); flt.connect(gain); gain.connect(this.masterGain);
                osc.start(now); osc.stop(now + 0.5);
                
                if (beat % 4 === 0) this.playTone(880, 'sine', 0.05, 0.05); 
                beat++;
            }, 500);
            
            this.activeNodes.push({ stop: () => clearInterval(sequencer) });
        }
    },

    // Helper: Creates a smooth background tone
    createPad: function(freq, type, vol) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 350;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 2.5); // Slow fade in

        osc.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        osc.start();
        
        const node = { 
            stop: () => {
                try {
                    gain.gain.cancelScheduledValues(this.ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5); // Fade out
                    setTimeout(() => { osc.stop(); osc.disconnect(); }, 1600);
                } catch(e){}
            }
        };
        this.activeNodes.push(node);
        return node;
    },

    stopBGM: function() {
        this.activeNodes.forEach(n => {
            if (n.stop) n.stop();
            else { try { n.stop(); n.disconnect(); } catch(e){} }
        });
        this.activeNodes = [];
        this.currentMode = null;
    }
};

// --- AUDIO TRIGGERS ---

// 1. GLOBAL UNLOCK (Solves "No Sound on Load" issue)
document.addEventListener('click', () => {
    if (window.Sound) {
        window.Sound.init();
        if (window.Sound.ctx && window.Sound.ctx.state === 'suspended') {
            window.Sound.ctx.resume();
        }
    }
}, { once: true });

// 2. INTRO MUSIC
const originalIntroLoad = window.onload;
window.addEventListener('load', () => {
    setTimeout(() => { 
        if(window.Sound) {
            window.Sound.playBGM('intro');
        }
    }, 1000);
});
