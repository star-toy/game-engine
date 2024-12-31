import mediator, { TRANSLATE, ZOOM } from './mediator';

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 2;

const PADDING_TOP = 100;

class Transform {
  #matrix: DOMMatrix = new DOMMatrix();

  private width: number;
  private height: number;

  public constructor() {
    const width = window.screen.availWidth;
    const height =
      window.screen.availHeight -
      (window.outerHeight - window.innerHeight) -
      PADDING_TOP;

    this.width = width;
    this.height = height;

    mediator.subscribe(ZOOM, (detail: WheelEvent['deltaY']) => {
      this.handleScale(detail);
    });

    mediator.subscribe(TRANSLATE, (detail: { dx: number; dy: number }) => {
      this.handleTranslate(detail);
    });
  }

  public get matrix() {
    return this.#matrix;
  }

  public get scale() {
    return this.matrix.a;
  }

  private set matrix(value: DOMMatrix) {
    this.#matrix = value;
  }

  private handleScale(deltaY: number) {
    const delta = 0.2;
    const targetScale = this.scale + (deltaY < 0 ? delta : -delta);
    const boundedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale));

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    const scaleFactor = boundedScale / this.scale;

    this.matrix = this.matrix
      .translate(centerX, centerY)
      .scale(scaleFactor)
      .translate(-centerX, -centerY);
  }

  private handleTranslate({ dx, dy }: { dx: number; dy: number }) {
    this.matrix = this.matrix.translate(dx / this.scale, dy / this.scale);
  }
}

export default new Transform();
