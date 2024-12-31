import {
  CHANGE_CURSOR,
  MOUSE_DOWN,
  MOUSE_LEAVE,
  MOUSE_MOVE,
  MOUSE_UP,
} from './mediator';

import mediator from './mediator';
import stateStack, { CursorStyle } from './states/state-stack';
import transform from './transform';

export class Viewport {
  private ctx: CanvasRenderingContext2D;
  private stateStack = stateStack;
  private transform = transform;

  private devicePixelRatio = window.devicePixelRatio ?? 1;

  public constructor(
    private canvas: HTMLCanvasElement,
    private paddingTop: number = 0,
  ) {
    this.ctx = canvas.getContext('2d')!;

    this.initializeCanvasSize();
    this.initializeEventListeners();
    this.initializeEventSubscribers();
  }

  public render = () => {
    const width = this.canvas.width / this.devicePixelRatio;
    const height = this.canvas.height / this.devicePixelRatio;

    this.ctx.clearRect(0, 0, width, height);

    this.ctx.setTransform(this.transform.matrix);
  };

  public initializeCanvasSize() {
    const width = window.screen.availWidth;
    const height =
      window.screen.availHeight -
      (window.outerHeight - window.innerHeight) -
      this.paddingTop;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.canvas.width = Math.floor(width * this.devicePixelRatio);
    this.canvas.height = Math.floor(height * this.devicePixelRatio);

    this.ctx.scale(
      this.transform.scale * this.devicePixelRatio,
      this.transform.scale * this.devicePixelRatio,
    );
  }

  public initializeEventListeners() {
    this.canvas.addEventListener('mousedown', (event) => {
      mediator.publish(MOUSE_DOWN, event);
    });
    this.canvas.addEventListener('mousemove', (event) => {
      mediator.publish(MOUSE_MOVE, new DOMPoint(event.clientX, event.clientY));
    });
    this.canvas.addEventListener('mouseup', (event) => {
      mediator.publish(MOUSE_UP, new DOMPoint(event.clientX, event.clientY));
    });
    this.canvas.addEventListener('mouseleave', (event) => {
      mediator.publish(MOUSE_LEAVE, new DOMPoint(event.clientX, event.clientY));
    });

    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  public initializeEventSubscribers() {
    mediator.subscribe(CHANGE_CURSOR, (cursor: CursorStyle) => {
      if (cursor.type === 'system') {
        this.ctx.canvas.style.cursor = cursor.value;
      } else {
        this.ctx.canvas.style.cursor = `url(${cursor.value}) ${cursor.offsetX} ${cursor.offsetY}`;
      }
    });
  }
}
