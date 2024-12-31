import { PiecesOption } from './model';

export class Pieces {
  private renderingOrderedArray = [];
  private logicalGridMap = new Map();

  private maxRow: number;
  private maxColumn: number;

  public compose({ rows, columns, width, height }: PiecesOption) {
    this.maxRow = rows - 1;
    this.maxColumn = columns - 1;
  }
}
