export class Viewport {
  private ctx: CanvasRenderingContext2D;
  private scale: number = 1;

  public constructor(
    private canvas: HTMLCanvasElement,
    private paddingTop: number = 0,
  ) {
    this.ctx = canvas.getContext('2d')!;

    this.initializeCanvasSize();
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
}
