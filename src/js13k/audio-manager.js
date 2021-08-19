export class AudioManager {
    musicCtx;
    musicGain;
    sfxVol = .25;
    sfxMap = {};
    ctxMap = {};

    constructor() {}

    initialize() {
        this.musicCtx = new AudioContext();
    }

    playMusic(musicBuffer) {
        this.musicGain = this.musicCtx.createGain();
        const musicNode = this.musicCtx.createBufferSource();
        musicNode.buffer = musicBuffer;
        musicNode.loop = true;
        musicNode.connect(this.musicGain);
        this.musicGain.connect(this.musicCtx.destination);
        musicNode.start(0);
    }

    registerBuffer(name, buffer) {
        this.sfxMap[name] = buffer;
    }

    playSfx(name, bufferName, loop, pan = 0, vol = 1) {
        if (this.ctxMap[name]) return;
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        gain.gain.value = vol;
        const bufferNode = ctx.createBufferSource();
        bufferNode.buffer = this.sfxMap[bufferName];
        bufferNode.loop = loop;
        if (pan !== 0) {
            const panner = ctx.createStereoPanner();
            panner.pan.value = pan;
            bufferNode.connect(panner);
            panner.connect(gain);
        } else {
            bufferNode.connect(gain);
        }
        gain.connect(ctx.destination);
        bufferNode.start(0);

        this.ctxMap[name] = {
            ctx,
            gain,
        };
    }

    stopSfx(name) {
        if (this.ctxMap[name]) {
            this.ctxMap[name].ctx.close();
            delete this.ctxMap[name];
        }
    }

    stopAll() {
        for (let key in this.ctxMap) {
            this.stopSfx(key);
        }
    }
}