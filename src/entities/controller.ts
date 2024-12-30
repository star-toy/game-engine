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

  // TODO: save를 위한 toJSON
  // TODO: load를 위한 fromJSON
  // TODO: Puzzle Pieces
  // TODO: Pieces on Edge
  // TODO: Artwork Preview
  // TODO: BGM
  // TODO: Sound Effect
  // TODO: Zoom in
  // TODO: Zoom out
}
