import mediator, { ZOOM } from './mediator';

class Transform {
  #matrix: DOMMatrix = new DOMMatrix();

  public constructor() {
    mediator.subscribe(ZOOM, (detail: WheelEvent['deltaY']) => {});
  }

  public get matrix() {
    return this.#matrix;
  }

  public get scale() {
    return this.matrix.a;
  }

  public set scale(value: number) {
    const scaleFactor = value / this.scale;
    this.matrix.scaleSelf(scaleFactor, scaleFactor);
  }
}

export default new Transform();
