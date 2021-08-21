import { createSVG, setAttribute } from './utils';

export class Star {
    x;
    y;
    size;
    density;
    graphic;
    vX = 0;
    vY = 0;
    mass;
    volume;

    constructor(x, y, size, density) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.density = density;

        this.volume = size * size * size * 4 * Math.PI / 3;
        this.mass = this.volume * density;

        const color = `#f${Math.min(15, Math.floor((density - .5) * 64)).toString(16)}${Math.max(0, Math.floor((density - .75) * 63)).toString(16)}`;
        const circle = createSVG('circle');
        setAttribute(circle, 'fill', color);
        setAttribute(circle, 'r', '50');
        setAttribute(circle, 'filter', 'url(#blurMe)');
        setAttribute(circle, 'transform', `scale(${size})`);

        this.graphic = createSVG('g');
        setAttribute(this.graphic, 'transform', `translate(${x} ${y})`);
        this.graphic.appendChild(circle);
        // const mass = createSVG('text');
        // setAttribute(mass, 'fill', 'black');
        // mass.innerHTML = `${this.mass}`;
        // this.graphic.appendChild(mass);
    }

    addLight() {
        // const name = `light${stars.length}`;
        // const previousName = `out${stars.length}`;
        // const newLight = createSVG('feSpecularLighting');
        // setAttribute(newLight, 'in', 'translated');
        // setAttribute(newLight, 'specularExponent', '20');
        // setAttribute(newLight, 'specularConstant', '5')
        // setAttribute(newLight, 'surfaceScale', '15');
        // setAttribute(newLight, 'lighting-color', color);
        // const newPoint = createSVG('fePointLight');
        // setAttribute(newPoint, 'x', `${x}`);
        // setAttribute(newPoint, 'y', `${y}`);
        // setAttribute(newPoint, 'z', '200');
        // newLight.appendChild(newPoint);
        // const newComposite = createSVG('feComposite');
        // setAttribute(newComposite, 'in', previousName);
        // setAttribute(newComposite, 'in2', name);
        // setAttribute(newComposite, 'operator', 'arithmetic');
        // setAttribute(newComposite, 'k1', '0');
        // setAttribute(newComposite, 'k2', '1');
        // setAttribute(newComposite, 'k3', '1');
        // setAttribute(newComposite, 'k4', '0');

        // setAttribute(lastLight, 'result', previousName);
        // lastLight.after(newLight, newComposite);
        // lastLight = newComposite;
    }

    appendTo(group) {
        group.appendChild(this.graphic);
    }

    removeFrom(group) {
        group.removeChild(this.graphic);
    }

    render() {
        setAttribute(this.graphic, 'transform', `translate(${this.x} ${this.y})`)
    }
}