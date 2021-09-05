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
    color;

    constructor(x, y, size, density) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.density = density;

        this.volume = size * size * size * 4 * Math.PI / 3;
        this.mass = this.volume * density;

        this.color = `#f${Math.min(15, Math.floor((density - .5) * 64)).toString(16)}${Math.max(0, Math.floor((density - .75) * 63)).toString(16)}`;
        const circle = createSVG('circle');
        setAttribute(circle, 'fill', this.color);
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

    addLight(lastLight) {
        const name = `light${stars.length}`;
        const previousName = `out${stars.length}`;
        this.light = createSVG('feSpecularLighting');
        setAttribute(this.light, 'in', 'translated');
        setAttribute(this.light, 'specularExponent', '20');
        setAttribute(this.light, 'specularConstant', '5')
        setAttribute(this.light, 'surfaceScale', '15');
        setAttribute(this.light, 'lighting-color', this.color);
        this.pointLight = createSVG('fePointLight');
        setAttribute(this.pointLight, 'x', `${this.x}`);
        setAttribute(this.pointLight, 'y', `${this.y}`);
        setAttribute(this.pointLight, 'z', '200');
        this.light.appendChild(this.pointLight);
        const newComposite = createSVG('feComposite');
        setAttribute(newComposite, 'in', previousName);
        setAttribute(newComposite, 'in2', name);
        setAttribute(newComposite, 'operator', 'arithmetic');
        setAttribute(newComposite, 'k1', '0');
        setAttribute(newComposite, 'k2', '1');
        setAttribute(newComposite, 'k3', '1');
        setAttribute(newComposite, 'k4', '0');

        setAttribute(lastLight, 'result', previousName);
        lastLight.after(this.light, newComposite);
        return newComposite;
    }

    appendTo(group) {
        group.appendChild(this.graphic);
    }

    removeFrom(group) {
        group.removeChild(this.graphic);
        setAttribute(this.light, 'specularConstant', '0');
    }

    render() {
        setAttribute(this.graphic, 'transform', `translate(${this.x} ${this.y})`);
        if (this.pointLight) {
            setAttribute(this.pointLight, 'x', `${this.x}`);
            setAttribute(this.pointLight, 'y', `${this.y}`);
        }
    }
}