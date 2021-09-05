const C = 33;
const D = 37;
const E = 41;
const F = 44;
const G = 49;
const A = 55;

const TTLS = [
    [C, 0.25],
    [C, 0.25],
    [G, 0.25],
    [G, 0.25],
  
    [A, 0.25],
    [A, 0.25],
    [G, 0.5],
  
    [F, 0.25],
    [F, 0.25],
    [E, 0.25],
    [E, 0.25],
  
    [D, 0.25],
    [D, 0.25],
    [C, 0.5],
  
    [G, 0.25],
    [G, 0.25],
    [F, 0.25],
    [F, 0.25],
  
    [E, 0.25],
    [E, 0.25],
    [D, 0.5],
  
    [G, 0.25],
    [G, 0.25],
    [F, 0.25],
    [F, 0.25],
  
    [E, 0.25],
    [E, 0.25],
    [D, 0.5],
  
    [C, 0.25],
    [C, 0.25],
    [G, 0.25],
    [G, 0.25],
  
    [A, 0.25],
    [A, 0.25],
    [G, 0.5],
  
    [F, 0.25],
    [F, 0.25],
    [E, 0.25],
    [E, 0.25],
  
    [D, 0.25],
    [D, 0.25],
    [C, 0.5]
];

export const loadTwinkle = async () => {
    const O = new OfflineAudioContext(1, 44100 * 12, 44100);

    const gain = O.createGain();
    const oss = O.createOscillator();

    oss.connect(gain);
    gain.connect(O.destination);

    gain.gain.setValueAtTime(0.1, 0);

    oss.type = 'triangle';

    let currentTime = 0;

    const addNote = (f, d) => {
        oss.frequency.setTargetAtTime(f, currentTime, d * 0.1);
        oss.frequency.setTargetAtTime(0, currentTime + d * 0.8, d * 0.1);
        currentTime += d;
    }
    oss.frequency.setValueAtTime(0, 0);

    TTLS.forEach(([f, d]) => addNote(f, d));

    oss.start(0);

    return await O.startRendering();
};

export const loadThrust = async () => {
    const O = new OfflineAudioContext(1, 44100, 44100);
    const m = O.createBuffer(1, 44100, 44100);
    const b = m.getChannelData(0);
    for(let i = 0; i < 44100; i++) b[i] = Math.random() * .05 - .025;
    const s = O.createBufferSource();
    s.buffer = m;
    s.connect(O.destination);
    s.start();

    return await O.startRendering();
};