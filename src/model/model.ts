import mediator, { CHANGE_IMAGE, CHANGE_PIECES_INDEX } from '../mediator';

interface PiecesOption {
  total: number;
  rows: number;
  columns: number;
}

const MINIMUM_PIECE_SIZE = 40;

class Model {
  #piecesOptions!: PiecesOption[];
  #selectedPiecesOption!: PiecesOption;

  public constructor(image: HTMLImageElement) {
    if (!image.complete) {
      throw new Error('Image is not ready');
    }

    this.piecesOptions = image;

    this.initializeEventSubscribers();
  }

  public get selectedPiecesOption(): PiecesOption {
    return this.#selectedPiecesOption;
  }

  public set selectedPiecesOption(index: number) {
    this.#selectedPiecesOption = this.#piecesOptions[index];
  }

  public set piecesOptions(image: HTMLImageElement) {
    this.#piecesOptions = this.getPieceOptions(image);
    const middleIndex = Math.round((this.#piecesOptions.length - 1) / 2);
    this.selectedPiecesOption = middleIndex;
  }

  public initializeEventSubscribers() {
    mediator.subscribe(CHANGE_PIECES_INDEX, (index: number) => {
      this.selectedPiecesOption = index;
    });

    mediator.subscribe(CHANGE_IMAGE, (image: HTMLImageElement) => {
      this.piecesOptions = image;
    });
  }

  public changeImage(image: HTMLImageElement) {
    this.piecesOptions = image;
  }

  private getPieceOptions(image: HTMLImageElement): PiecesOption[] {
    const gcd = getGreatestCommonDivisor(image.width, image.height);

    const possibleDivisors = Array.from(
      { length: gcd - 1 },
      (_, i) => i + 2,
    ).filter((i) => gcd % i === 0);

    const possibleOptions: PiecesOption[] = possibleDivisors
      .map((divisor) => {
        const pieceSize = gcd / divisor;
        const columns = image.width / pieceSize;
        const rows = image.height / pieceSize;

        return {
          total: rows * columns,
          rows,
          columns,
        };
      })
      .filter((option) => option.total >= MINIMUM_PIECE_SIZE);

    return possibleOptions.sort((a, b) => a.total - b.total);
  }
}

export default Model;

const getGreatestCommonDivisor = (a: number, b: number): number => {
  return b === 0 ? a : getGreatestCommonDivisor(b, a % b);
};
