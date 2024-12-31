class Model {
  public constructor(image: HTMLImageElement) {
    if (!image.complete) {
      throw new Error('Image is not ready');
    }
  }
}

export default Model;
