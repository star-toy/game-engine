import { JOINT_RATIO } from '../constants';
import { Side, Sideline } from './piece-group';
import { JointShape, PieceShape } from './piece-shape';

type Point = [number, number];
export type Corner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';

interface Display {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
  dx: number;
  dy: number;
  dWidth: number;
  dHeight: number;
}

interface AdjacentLocation {
  row: number;
  column: number;
  snapSide: Side;
}

interface TabBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPiece {
  get display(): Display[];
  moveBy(dx: number, dy: number): void;
  contains(x: number, y: number): boolean;
  getPieceAt(x: number, y: number): null | IPiece;
  isAtGridPosition(row: number, column: number): boolean;
  isInRange(top: number, right: number, bottom: number, left: number): boolean;
}

export class Piece implements IPiece {
  private shape: Path2D;

  constructor(
    private readonly row: number,
    private readonly column: number,
    private readonly subX: number,
    private readonly subY: number,
    private readonly width: number,
    private readonly height: number,
    public readonly topJointShape: JointShape,
    public readonly rightJointShape: JointShape,
    public readonly bottomJointShape: JointShape,
    public readonly leftJointShape: JointShape,
    private x: number,
    private y: number,
  ) {
    this.shape = PieceShape.createShape(this);
  }

  public get position() {
    return { x: this.x, y: this.y };
  }

  public get gridPosition() {
    return { row: this.row, column: this.column };
  }

  public get dimensions() {
    return { width: this.width, height: this.height };
  }

  public get sideCenters() {
    return [
      this.sideCenterTop,
      this.sideCenterRight,
      this.sideCenterBottom,
      this.sideCenterLeft,
    ] as [Point, Point, Point, Point];
  }

  public get display() {
    const SCALE_RATIO = 1 + JOINT_RATIO * 2;

    const offsetX = this.width * JOINT_RATIO;
    const offsetY = this.height * JOINT_RATIO;

    return [
      {
        sx: this.subX - offsetX,
        sy: this.subY - offsetY,
        sWidth: this.width * SCALE_RATIO,
        sHeight: this.height * SCALE_RATIO,
        dx: this.x - offsetX,
        dy: this.y - offsetY,
        dWidth: this.width * SCALE_RATIO,
        dHeight: this.height * SCALE_RATIO,
      },
    ];
  }

  public draw(ctx: CanvasRenderingContext2D, image: CanvasImageSource) {
    const SCALE_RATIO = 1 + JOINT_RATIO * 2;

    const offsetX = this.width * JOINT_RATIO;
    const offsetY = this.height * JOINT_RATIO;

    ctx.save();

    ctx.stroke(this.shape);

    ctx.clip(this.shape);

    ctx.drawImage(
      image,
      this.subX - offsetX,
      this.subY - offsetY,
      this.width * SCALE_RATIO,
      this.height * SCALE_RATIO,
      this.x - offsetX,
      this.y - offsetY,
      this.width * SCALE_RATIO,
      this.height * SCALE_RATIO,
    );

    ctx.restore();
  }

  public moveBy(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
    this.shape = PieceShape.updateShape(this.shape, dx, dy);
  }

  public contains(x: number, y: number) {
    return (
      this.x <= x &&
      this.x + this.width >= x &&
      this.y <= y &&
      this.y + this.height >= y
    );
  }

  public getPieceAt(x: number, y: number) {
    return this.contains(x, y) ? this : null;
  }

  public isAtGridPosition(row: number, column: number) {
    return this.row === row && this.column === column;
  }

  public isInRange(
    top: number,
    right: number,
    bottom: number,
    left: number,
  ): boolean {
    const jointLength = PieceShape.jointLength;

    return (
      this.isInExtendedRange(top, right, bottom, left, jointLength) &&
      (this.isBaseRectInRange(top, right, bottom, left) ||
        this.isAnyTabInRange(top, right, bottom, left, jointLength))
    );
  }

  private isInExtendedRange(
    top: number,
    right: number,
    bottom: number,
    left: number,
    jointLength: number,
  ): boolean {
    return (
      this.y - jointLength < bottom &&
      this.x + this.width + jointLength > left &&
      this.y + this.height + jointLength > top &&
      this.x - jointLength < right
    );
  }

  private isBaseRectInRange(
    top: number,
    right: number,
    bottom: number,
    left: number,
  ): boolean {
    return (
      this.y + this.height > top &&
      this.x < right &&
      this.y < bottom &&
      this.x + this.width > left
    );
  }

  private getTabBounds(side: Side, jointLength: number): TabBounds {
    const [centerX, centerY] = this.getSideCenter(side);

    const halfJointLength = jointLength / 2;

    switch (side) {
      case 'top':
        return {
          x: centerX - halfJointLength,
          y: centerY - jointLength,
          width: jointLength,
          height: jointLength,
        };
      case 'right':
        return {
          x: centerX,
          y: centerY - halfJointLength,
          width: jointLength,
          height: jointLength,
        };
      case 'bottom':
        return {
          x: centerX - halfJointLength,
          y: centerY,
          width: jointLength,
          height: jointLength,
        };
      case 'left':
        return {
          x: centerX - jointLength,
          y: centerY - halfJointLength,
          width: jointLength,
          height: jointLength,
        };
    }
  }

  private isTabInRange(
    bounds: TabBounds,
    top: number,
    right: number,
    bottom: number,
    left: number,
  ): boolean {
    return (
      bounds.y + bounds.height > top &&
      bounds.x < right &&
      bounds.y < bottom &&
      bounds.x + bounds.width > left
    );
  }

  private isAnyTabInRange(
    top: number,
    right: number,
    bottom: number,
    left: number,
    jointLength: number,
  ): boolean {
    const sides: Side[] = ['top', 'right', 'bottom', 'left'];

    return sides.some((side) => {
      if (this.getJointShape(side) !== 'tab') return false;

      const tabBounds = this.getTabBounds(side, jointLength);

      return this.isTabInRange(tabBounds, top, right, bottom, left);
    });
  }

  public getAdjacentLocations(maxRow: number, maxColumn: number) {
    const locations = [
      { row: this.row - 1, column: this.column, snapSide: 'top' },
      { row: this.row, column: this.column + 1, snapSide: 'right' },
      { row: this.row + 1, column: this.column, snapSide: 'bottom' },
      { row: this.row, column: this.column - 1, snapSide: 'left' },
    ];

    return locations.filter(
      ({ row, column }) =>
        row >= 0 && row <= maxRow && column >= 0 && column <= maxColumn,
    ) as
      | [AdjacentLocation, AdjacentLocation]
      | [AdjacentLocation, AdjacentLocation, AdjacentLocation]
      | [
          AdjacentLocation,
          AdjacentLocation,
          AdjacentLocation,
          AdjacentLocation,
        ];
  }

  public getNearestSideCenter(piece: Piece) {
    return this.sideCenters.reduce(
      (nearest, currentSideCenter, index) => {
        const [x, y] = currentSideCenter;
        const [ox, oy] = piece.sideCenters[(index + 2) % 4];

        const distance = (x - ox) ** 2 + (y - oy) ** 2;

        return distance < nearest.distance
          ? { sideCenter: currentSideCenter, distance }
          : nearest;
      },
      { sideCenter: this.sideCenters[0], distance: Infinity },
    ).sideCenter;
  }

  public getSideCenter(side: Side) {
    switch (side) {
      case 'top':
        return this.sideCenterTop;
      case 'right':
        return this.sideCenterRight;
      case 'bottom':
        return this.sideCenterBottom;
      case 'left':
        return this.sideCenterLeft;
    }
  }

  public getOppositeSideCenter(side: Side) {
    switch (side) {
      case 'top':
        return this.sideCenterBottom;
      case 'right':
        return this.sideCenterLeft;
      case 'bottom':
        return this.sideCenterTop;
      case 'left':
        return this.sideCenterRight;
    }
  }

  public getCorner(at: Corner) {
    switch (at) {
      case 'topLeft':
        return this.topLeftCorner;
      case 'topRight':
        return this.topRightCorner;
      case 'bottomRight':
        return this.bottomRightCorner;
      case 'bottomLeft':
        return this.bottomLeftCorner;
    }
  }

  public getJointShape(side: Side) {
    switch (side) {
      case 'top':
        return this.topJointShape;
      case 'right':
        return this.rightJointShape;
      case 'bottom':
        return this.bottomJointShape;
      case 'left':
        return this.leftJointShape;
    }
  }

  public getSideline(side: Side): Sideline {
    const leftTop = this.getCorner('topLeft');
    const rightTop = this.getCorner('topRight');
    const rightBottom = this.getCorner('bottomRight');
    const leftBottom = this.getCorner('bottomLeft');

    switch (side) {
      case 'top':
        return { start: leftTop, end: rightTop };
      case 'right':
        return { start: rightTop, end: rightBottom };
      case 'bottom':
        return { start: rightBottom, end: leftBottom };
      case 'left':
        return { start: leftBottom, end: leftTop };
    }
  }

  private get topLeftCorner() {
    return [this.x, this.y] as Point;
  }

  private get topRightCorner() {
    return [this.x + this.width, this.y] as Point;
  }

  private get bottomRightCorner() {
    return [this.x + this.width, this.y + this.height] as Point;
  }

  private get bottomLeftCorner() {
    return [this.x, this.y + this.height] as Point;
  }

  private get sideCenterTop() {
    return [this.x + this.width / 2, this.y] as Point;
  }

  private get sideCenterRight() {
    return [this.x + this.width, this.y + this.height / 2] as Point;
  }

  private get sideCenterBottom() {
    return [this.x + this.width / 2, this.y + this.height] as Point;
  }

  private get sideCenterLeft() {
    return [this.x, this.y + this.height / 2] as Point;
  }

  // public moveTo(x: number, y: number) {
  //   this.x = x;
  //   this.y = y;
  // }
}
