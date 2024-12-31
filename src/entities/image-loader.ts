export class ImageLoader {
  public static load(source: string): Promise<HTMLImageElement> {
    const image = new Image();

    return new Promise<HTMLImageElement>((resolve) => {
      image.onload = () => {
        resolve(image);
      };

      image.src = source;
    });
  }
}
