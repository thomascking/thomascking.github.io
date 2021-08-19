import { AudioManager } from './audio-manager';
import { loadThrust, loadTwinkle } from './audio'; 

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

const setAttribute = (target, key, value) => target.setAttribute(key, value);
const createSVG = tag => document.createElementNS('http://www.w3.org/2000/svg', tag);

const addStar = (x, y, size, density) => {
    const color = `#f${Math.min(15, Math.floor((density - .5) * 64)).toString(16)}${Math.max(0, Math.floor((density - .75) * 63)).toString(16)}`;
    const newStar = createSVG('circle');
    setAttribute(newStar, 'fill', color);
    setAttribute(newStar, 'transform', `translate(${x} ${y}) scale(${size})`);
    setAttribute(newStar, 'r', '50');
    setAttribute(newStar, 'filter', 'url(#blurMe)');
    starG.appendChild(newStar);

    const name = `light${stars.length}`;
    const previousName = `out${stars.length}`;
    const newLight = createSVG('feSpecularLighting');
    setAttribute(newLight, 'in', 'translated');
    setAttribute(newLight, 'specularExponent', '20');
    setAttribute(newLight, 'specularConstant', '5')
    setAttribute(newLight, 'surfaceScale', '15');
    setAttribute(newLight, 'lighting-color', color);
    const newPoint = createSVG('fePointLight');
    setAttribute(newPoint, 'x', `${x}`);
    setAttribute(newPoint, 'y', `${y}`);
    setAttribute(newPoint, 'z', '200');
    newLight.appendChild(newPoint);
    const newComposite = createSVG('feComposite');
    setAttribute(newComposite, 'in', previousName);
    setAttribute(newComposite, 'in2', name);
    setAttribute(newComposite, 'operator', 'arithmetic');
    setAttribute(newComposite, 'k1', '0');
    setAttribute(newComposite, 'k2', '1');
    setAttribute(newComposite, 'k3', '1');
    setAttribute(newComposite, 'k4', '0');

    setAttribute(lastLight, 'result', previousName);
    lastLight.after(newLight, newComposite);
    lastLight = newComposite;

    stars.push({x,y,size,density});
};

addStar(0, 0, 1.5, .5);
addStar(1000, 200, .75, .75);
addStar(500, 900, .5, 1);

let previous;

const frame = () => {
    raf = requestAnimationFrame(frame);

    let now = performance.now();
    let elapsed = now - previous;
    previous = now;

    let rA = angle * Math.PI / 180;

    vX -= vX * .00625;
    vY -= vY * .00625;

    for (let star of stars) {
        const dx = x - star.x;
        const dy = y - star.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < star.size * 50 + 15) endGame();
        const dir = Math.atan2(dx, dy);
        const force = 30 * star.size * star.density / (d*d);
        vY += force * elapsed * Math.cos(dir);
        vX += force * elapsed * Math.sin(dir);
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
