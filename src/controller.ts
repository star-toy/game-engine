import Model from './model/model';
import { Viewport } from './view/viewport';

export class Controller {
  private viewport: Viewport;
  private model: Model;

  public constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
    this.viewport = new Viewport(canvas);
    this.model = new Model(image);
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
}
