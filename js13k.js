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

const leftThrust = document.getElementById('left');
const rightThrust = document.getElementById('right');
const backThrust = document.getElementById('backStart');
const backOff = document.getElementById('backOff');

window.onkeydown = event => {
    switch(event.key) {
        case "Enter":
            if (!raf) startGame();
            break;
        case " ":
            if (!thrust) {
                thrust = 1;
                backThrust.beginElement();
            }
            break;
        case "ArrowLeft":
            if (!left) {
                turn -= 1;
                left = true;
                rightThrust.setAttribute('specularConstant', '1');
            }
            break;
        case "ArrowRight":
            if (!right) {
                turn += 1;
                right = true;
                leftThrust.setAttribute('specularConstant', '1');
            }
            break;
    }
};

window.onkeyup = event => {
    switch(event.key) {
        case " ":
            if (!!thrust) {
                thrust = 0;
                backOff.beginElement();
            }
            break;
        case "ArrowLeft":
            if (left) {
                turn += 1;
                left = false;
                rightThrust.setAttribute('specularConstant', '.01');
            }
            angularV = 0;
            break;
        case "ArrowRight":
            if (right) {
                turn -= 1;
                right = false;
                leftThrust.setAttribute('specularConstant', '.01');
            }
            angularV = 0;
            break;
    }
};

const starG = document.getElementById('stars');
const shipG = document.getElementById('ship');

const lightTrans = document.getElementById('lightTrans');
const lightTrans2 = document.getElementById('lightTrans2');

const spedometer = document.getElementById('spedometer');

let lastLight = document.getElementById('lastLight');

const stars = [];

const addStar = (x, y, size, density) => {
    const color = `#f${Math.min(15, Math.floor((density - .5) * 64)).toString(16)}${Math.max(0, Math.floor((density - .75) * 63)).toString(16)}`;
    const newStar = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newStar.setAttribute('fill', color);
    newStar.setAttribute('transform', `translate(${x} ${y}) scale(${size})`);
    newStar.setAttribute('r', '50');
    newStar.setAttribute('filter', 'url(#blurMe)');
    starG.appendChild(newStar);

    const name = `light${stars.length}`;
    const previousName = `out${stars.length}`;
    const newLight = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
    newLight.setAttribute('in', 'translated');
    newLight.setAttribute('specularExponent', '20');
    newLight.setAttribute('specularConstant', '5')
    newLight.setAttribute('surfaceScale', '15');
    newLight.setAttribute('lighting-color', color);
    const newPoint = document.createElementNS('http://www.w3.org/2000/svg', 'fePointLight');
    newPoint.setAttribute('x', `${x}`);
    newPoint.setAttribute('y', `${y}`);
    newPoint.setAttribute('z', '200');
    newLight.appendChild(newPoint);
    const newComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    newComposite.setAttribute('in', previousName);
    newComposite.setAttribute('in2', name);
    newComposite.setAttribute('operator', 'arithmetic');
    newComposite.setAttribute('k1', '0');
    newComposite.setAttribute('k2', '1');
    newComposite.setAttribute('k3', '1');
    newComposite.setAttribute('k4', '0');

    lastLight.setAttribute('result', previousName);
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

    vX -= vX * .0125;
    vY -= vY * .0125;

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
    // while (speed > 1) {
    //     vX *= .99;
    //     vY *= .99;
    //     speed = Math.sqrt(vX*vX + vY*vY);
    // }

    x += -vX * elapsed;
    y += -vY * elapsed;

    angularV += turn * .001 * elapsed;
    if (angularV > .5) angularV = .5;
    if (angularV < -.5) angularV = -.5;
    angle += angularV * elapsed;

    starG.setAttribute('transform', `translate(${500-x} ${500-y})`);
    shipG.setAttribute('transform', `rotate(${angle})`);
    spedometer.innerHTML = `${Math.round(speed * 100)}`;

    lightTrans.setAttribute('dx', `${x}`);
    lightTrans.setAttribute('dy', `${y}`);
    lightTrans2.setAttribute('dx', `${-x}`);
    lightTrans2.setAttribute('dy', `${-y}`);
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

const endGame = () => {
    cancelAnimationFrame(raf);
    raf = 0;
};