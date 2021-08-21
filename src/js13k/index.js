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

let lastLight = q('lastLight');

const stars = [];

const addStar = (x, y, size, density) => {
    const newStar = new Star(x, y, size, density);
    newStar.appendTo(starG);
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

    let rA = angle * Math.PI / 180;

    vX -= vX * .00625;
    vY -= vY * .00625;

    const toMerge = [];

    stars.forEach((star, i) => {
        const dx = x - star.x;
        const dy = y - star.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < star.size * 50 + 15) endGame();
        const dir = Math.atan2(dx, dy);
        const force = star.mass / (d*d);
        vY += force * elapsed * Math.cos(dir);
        vX += force * elapsed * Math.sin(dir);

        star.vX -= star.vX * .00625;
        star.vY -= star.vY * .00625;

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
            const force = 10 * star2.mass / (d*d);
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

    vY += thrust * .000275 * elapsed * Math.cos(rA);
    vX += thrust * .000275 * elapsed * -Math.sin(rA);
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

    setAttribute(lightTrans, 'dx', `${x}`);
    setAttribute(lightTrans, 'dy', `${y}`);
    setAttribute(lightTrans2, 'dx', `${-x}`);
    setAttribute(lightTrans2, 'dy', `${-y}`);
};

const startGame = () => {
    x = 500;
    y = 500;
    vX = 0;
    vY = 0;
    angularV = 0;
    angle = 0;
    thrust = 0;
    turn = 0;
    left = false;
    right = false;
    clearStars();
    addStar(0, 0, 1.5, .5);
    addStar(1000, 200, .75, .75);
    addStar(500, 900, .5, 1);

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
