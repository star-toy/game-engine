import {
  CHANGE_CURSOR,
  MOUSE_DOWN,
  MOUSE_LEAVE,
  MOUSE_MOVE,
  MOUSE_UP,
} from './mediator';

import mediator from './mediator';
import stateStack, { CursorStyle } from './states/state-stack';

export class Viewport {
  private ctx: CanvasRenderingContext2D;
  private stateStack = stateStack;

  private scale: number = 1;

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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  public initializeCanvasSize() {
    const devicePixelRatio = window.devicePixelRatio ?? 1;
    const width = window.screen.availWidth;
    const height =
      window.screen.availHeight -
      (window.outerHeight - window.innerHeight) -
      this.paddingTop;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.canvas.width = Math.floor(width * devicePixelRatio);
    this.canvas.height = Math.floor(height * devicePixelRatio);

    this.ctx.scale(
      this.scale * devicePixelRatio,
      this.scale * devicePixelRatio,
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
