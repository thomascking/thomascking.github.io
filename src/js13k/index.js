import { AudioManager } from './audio-manager';
import { loadThrust, loadTwinkle } from './audio'; 
import { Star } from './star';
import { setAttribute } from './utils';

let angle = 0;
let angularV = 0;

let x = 500;
let y = 500;
let vX = 0;
let vY = 0;

let thrust = 0;
let turn = 0;
let left = false;
let right = false;

let score = 0;

let cX = 0;
let cY = 0;

let raf = 0;
let initialized = false;

const q = id => document.getElementById(id);

const leftThrust = q('left');
const rightThrust = q('right');
const backThrust = q('backStart');
const backOff = q('backOff');

let musicBuffer;loadTwinkle().then(v => musicBuffer = v);
const audioManager = new AudioManager();
loadThrust().then(v => audioManager.registerBuffer('thrust', v));

const randomPoint = (magnitude=1, minDist=0) => {
    const dir = Math.random() * 2 * Math.PI;
    const len = Math.random() * .9 * (magnitude - minDist) + minDist;
    return [Math.sin(dir) * len, Math.cos(dir) * len];
}

const generateCheckpoint = () => {
    [cX, cY] = randomPoint();
}

window.onkeydown = event => {
    if (!raf) {
        if (event.key === 'Enter') {
            if (!initialized) initialize();
            startGame();
        }
        return;
    }
    switch(event.key) {
        case "Enter":
            
            break;
        case " ":
            if (!thrust) {
                thrust = 1;
                backThrust.beginElement();
                audioManager.playSfx('back', 'thrust', true);
            }
            break;
        case "ArrowLeft":
            if (!left) {
                turn -= 1;
                left = true;
                setAttribute(rightThrust, 'specularConstant', '1');
                audioManager.playSfx('right', 'thrust', true, 1, .25);
            }
            break;
        case "ArrowRight":
            if (!right) {
                turn += 1;
                right = true;
                setAttribute(leftThrust, 'specularConstant', '1');
                audioManager.playSfx('left', 'thrust', true, -1, .25);
            }
            break;
    }
};

window.onkeyup = event => {
    if (!raf) return;
    switch(event.key) {
        case " ":
            if (!!thrust) {
                thrust = 0;
                backOff.beginElement();
                audioManager.stopSfx('back');
            }
            break;
        case "ArrowLeft":
            if (left) {
                turn += 1;
                left = false;
                setAttribute(rightThrust, 'specularConstant', '.01');
                audioManager.stopSfx('right');
            }
            angularV = 0;
            break;
        case "ArrowRight":
            if (right) {
                turn -= 1;
                right = false;
                setAttribute(leftThrust, 'specularConstant', '.01');
                audioManager.stopSfx('left');
            }
            angularV = 0;
            break;
    }
};

const starG = q('stars');
const shipG = q('ship');

const lightTrans = q('lightTrans');
const lightTrans2 = q('lightTrans2');

const spedometer = q('spedometer');
const scoreEl = q('score');
const arrow = q('arrow');

let lastLight = q('lastLight');

const checkpoint = q('checkpoint');

const boundary = q('boundary');

let boundaryRadius = 2000;

const stars = [];

const addStar = (x, y, size, density) => {
    const newStar = new Star(x, y, size, density);
    newStar.appendTo(starG);
    lastLight = newStar.addLight(lastLight);
    stars.push(newStar);
    return newStar;
};

const clearStars = () => {
    stars.forEach(star => {
        star.removeFrom(starG);
    });
    stars.length = 0;
}

let previous;

const frame = () => {
    raf = requestAnimationFrame(frame);

    let now = performance.now();
    let elapsed = now - previous;
    previous = now;

    boundaryRadius -= elapsed * .025;

    const bx = x - 500;
    const by = y - 500;
    const db = Math.sqrt(bx*bx+by*by);
    if (db > boundaryRadius) {
        endGame();
        return;
    }

    const checkX = boundaryRadius * cX;
    const checkY = boundaryRadius * cY;
    const cdx = bx - checkX;
    const cdy = by - checkY;
    const checkD = Math.sqrt(cdx*cdx+cdy*cdy);
    if (checkD < 35) {
        score++;
        generateCheckpoint();
    } 

    let rA = angle * Math.PI / 180;

    vX -= vX * .01;
    vY -= vY * .01;

    const toMerge = [];

    stars.forEach((star, i) => {
        const dx = x - star.x;
        const dy = y - star.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < star.size * 50 + 15) {
            endGame();
            return;
        }
        const dir = Math.atan2(dx, dy);
        const force = 5 * star.mass / (d*d);
        vY += force * elapsed * Math.cos(dir);
        vX += force * elapsed * Math.sin(dir);

        stars.forEach((star2, i2) => {
            if (i === i2) return;

            const dx = star.x - star2.x;
            const dy = star.y - star2.y;
            const d = Math.sqrt(dx*dx+dy*dy);
            if (d < star2.size * 50) {
                toMerge.push([i, i2]);
                return;
            }
            const dir = Math.atan2(dx, dy);
            const force = star2.mass / (d*d);
            star.vY += force * elapsed * Math.cos(dir);
            star.vX += force * elapsed * Math.sin(dir);
        });

        star.x += -star.vX * elapsed;
        star.y += -star.vY * elapsed;

        star.render();
    });

    if (toMerge.length > 0) {
        const [i1, i2] = toMerge.pop();
        const s1 = stars[i1];
        const s2 = stars[i2];
        const newX = (s1.x + s2.x) / 2;
        const newY = (s1.y + s2.y) / 2;
        const mass = s1.mass + s2.mass;
        const v = s1.volume + s2.volume;
        const density = mass / v;
        const size = Math.pow((v * 3) / (4 * Math.PI), .333);
        const newStar = addStar(newX, newY, size, density);
        newStar.vX = (s1.vX * s1.mass + s2.vX * s2.mass) / newStar.mass;
        newStar.vY = (s1.vY * s1.mass + s2.vY * s2.mass) / newStar.mass;
        stars.splice(i1, 1);
        stars.splice(i2, 1);
        s1.removeFrom(starG);
        s2.removeFrom(starG);
    }

    vY += thrust * .0004 * elapsed * Math.cos(rA);
    vX += thrust * .0004 * elapsed * -Math.sin(rA);
    let speed = Math.sqrt(vX*vX + vY*vY);

    x += -vX * elapsed;
    y += -vY * elapsed;

    angularV += turn * .001 * elapsed;
    if (angularV > .5) angularV = .5;
    if (angularV < -.5) angularV = -.5;
    angle += angularV * elapsed;

    setAttribute(starG, 'transform', `translate(${500-x} ${500-y})`);
    setAttribute(shipG, 'transform', `rotate(${angle})`);
    spedometer.innerHTML = `${Math.round(speed * 100)}`;
    scoreEl.innerHTML = `${score}`;

    setAttribute(lightTrans, 'dx', `${x}`);
    setAttribute(lightTrans, 'dy', `${y}`);
    setAttribute(lightTrans2, 'dx', `${-x}`);
    setAttribute(lightTrans2, 'dy', `${-y}`);
    setAttribute(boundary, 'r', `${boundaryRadius}`);
    setAttribute(checkpoint, 'transform', `translate(${checkX} ${checkY})`);
    setAttribute(arrow, 'transform', `translate(${clamp(500-cdx, 15, 985)} ${clamp(500-cdy, 20, 980)}) rotate(${Math.atan2(cdx, cdy) * -180 / Math.PI})`)
};

const clamp = (v, i, a) => Math.min(a, Math.max(i, v));

const startGame = () => {
    x = 500;
    y = 500;
    vX = 0;
    vY = 0;
    angularV = 0;
    angle = 0;
    thrust = 0;
    turn = 0;
    boundaryRadius = 2000;
    score = 0;
    left = false;
    right = false;
    clearStars();
    for (let i = 0; i < 7; i++) {
        const [sX, sY] = randomPoint(2000, 400);
        const size = Math.random() + .5;
        const density = Math.random() * .5 + .5;
        addStar(sX, sY, size, density);
    }

    generateCheckpoint();
    cX = 0;
    cY = 0;

    previous = performance.now();
    frame();
};

const initialize = () => {
    initialized = true;
    audioManager.initialize();
    audioManager.playMusic(musicBuffer);
};

const endGame = () => {
    cancelAnimationFrame(raf);
    raf = 0;

    backOff.beginElement();
    setAttribute(rightThrust, 'specularConstant', '.01');
    setAttribute(leftThrust, 'specularConstant', '.01');

    audioManager.stopAll();
};
