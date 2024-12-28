import { Viewport } from './viewport';

export class Controller {
  private viewport: Viewport;

  public constructor(canvas: HTMLCanvasElement) {
    this.viewport = new Viewport(canvas);
  }

  public render = () => {
    this.viewport.render();

    window.requestAnimationFrame(this.render);
  };
}
