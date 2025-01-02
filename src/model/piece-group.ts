import { IPiece, Piece } from './piece';

export type Side = 'top' | 'right' | 'bottom' | 'left';

export interface Sideline {
  start: [number, number];
  end: [number, number];
}

export class PieceGroup implements IPiece {
  constructor(private readonly pieces: Piece[]) {}

  public get clonePieces() {
    return [...this.pieces];
  }

  public get display() {
    return this.pieces.flatMap((piece) => piece.display);
  }

  public moveBy(dx: number, dy: number) {
    for (const piece of this.pieces) {
      piece.moveBy(dx, dy);
    }
  }

  public contains(x: number, y: number) {
    return this.pieces.some((piece) => piece.contains(x, y));
  }

  public getPieceAt(x: number, y: number) {
    return this.pieces.find((piece) => piece.contains(x, y)) ?? null;
  }

  public isAtGridPosition(row: number, column: number) {
    return this.pieces.some((piece) => piece.isAtGridPosition(row, column));
  }

  public isInRange(
    top: number,
    right: number,
    bottom: number,
    left: number,
  ): boolean {
    return this.pieces.some((piece) =>
      piece.isInRange(top, right, bottom, left),
    );
  }

  // public moveTo(x: number, y: number) {
  //   const [first] = this.pieces;
  //   const { x: firstX, y: firstY } = first.position;

  //   const dx = x - firstX;
  //   const dy = y - firstY;

  //   for (const piece of this.pieces) {
  //     piece.moveBy(dx, dy);
  //   }
  // }
}
