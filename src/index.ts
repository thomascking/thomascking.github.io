import { animationFrames, fromEvent, merge } from 'rxjs';
import { map, mergeMap, startWith, takeUntil, tap } from 'rxjs/operators';

const MAX_SPEED = 0.5;

class Square {
  angle = 0;
  angularVelocity = 0.001;

  targetX = 200;
  targetY = 200;

  x = 200;
  y = 200;

  update(elapsed: number) {
    this.angle += this.angularVelocity * elapsed;

    // calculate direction
    const xDiff = this.targetX - this.x;
    const yDiff = this.targetY - this.y;
    const targetDir = Math.atan2(yDiff, xDiff);

    const speed = MAX_SPEED * elapsed;

    let vX = Math.cos(targetDir) * speed;
    if (vX > 0 ? vX > xDiff : vX < xDiff) {
      vX = xDiff;
    }
    let vY = Math.sin(targetDir) * speed;
    if (vY > 0 ? vY > yDiff : vY < yDiff) {
      vY = yDiff;
    }

    this.x += vX;
    this.y += vY;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(-50, -50, 100, 100);
    ctx.restore();
  }

  moveTo(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }
}

let previous = 0;
const update = ({ elapsed }: { elapsed: number }) => {
  const diff = elapsed - previous;
  previous = elapsed;
  square.update(diff);
};

const render = () => {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  square.render(ctx);
};

const square = new Square();
const canvas = document.querySelector<HTMLCanvasElement>('#canvas2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const ctx = canvas.getContext('2d');

animationFrames().pipe(
  tap(e => update(e)),
).subscribe(
  () => render()
);

merge(
  fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
    mergeMap(event =>
      fromEvent<MouseEvent>(canvas, 'mousemove').pipe(
        takeUntil(fromEvent(canvas, 'mouseup')),
        takeUntil(fromEvent(canvas, 'mouseleave')),
        startWith(event),
      )
    ),
    map(event => [event.pageX, event.pageY]),
  ),
  merge(
    fromEvent<TouchEvent>(canvas, 'touchstart', { passive: true }),
    fromEvent<TouchEvent>(canvas, 'touchmove', { passive: true })
  ).pipe(
    map(event => [event.touches[0].pageX, event.touches[0].pageY]),
  ),
).subscribe(([x, y]) => {
  square.moveTo(x, y);
});
