import topTab from '@/src/assets/top-tab.svg?raw';
import rightTab from '@/src/assets/right-tab.svg?raw';
import bottomTab from '@/src/assets/bottom-tab.svg?raw';
import leftTab from '@/src/assets/left-tab.svg?raw';
import topSlot from '@/src/assets/top-slot.svg?raw';
import rightSlot from '@/src/assets/right-slot.svg?raw';
import bottomSlot from '@/src/assets/bottom-slot.svg?raw';
import leftSlot from '@/src/assets/left-slot.svg?raw';

import { Side } from './piece-group';
import { Corner, Piece } from './piece';
import { JOINT_RATIO } from '../constants';

export type JointShape = 'tab' | 'flat' | 'slot';

type JointAssetType = Exclude<JointShape, 'flat'>;
type PathKey = `${Side}-${JointAssetType}`;

interface PathCommand {
  dx: number;
  dy: number;
}

interface SVGMoveToCommand {
  type: 'm';
  position: [number, number];
}

interface SVGLineToCommand {
  type: 'l';
  position: [number, number];
}

interface SVGHorizontalLineCommand {
  type: 'h';
  position: [number];
}

interface SVGVerticalLineCommand {
  type: 'v';
  position: [number];
}

type SVGCommand =
  | SVGMoveToCommand
  | SVGLineToCommand
  | SVGHorizontalLineCommand
  | SVGVerticalLineCommand;

interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export class PieceShape {
  public static scale: number;
  public static jointLength: number;

  private static assetLength: number;

  private static pathCommands = {} as Record<PathKey, PathCommand[]>;

  private static readonly SIDE_OFFSET: Record<Side, [number, number]> = {
    top: [-1, 0],
    right: [0, -1],
    bottom: [1, 0],
    left: [0, 1],
  };

  private static readonly NEXT_CORNER_MAP: Record<Side, Corner> = {
    top: 'topRight',
    right: 'bottomRight',
    bottom: 'bottomLeft',
    left: 'topLeft',
  };

  static {
    try {
      const jointElements = [
        { side: 'top', type: 'tab', raw: topTab },
        { side: 'right', type: 'tab', raw: rightTab },
        { side: 'bottom', type: 'tab', raw: bottomTab },
        { side: 'left', type: 'tab', raw: leftTab },
        { side: 'top', type: 'slot', raw: topSlot },
        { side: 'right', type: 'slot', raw: rightSlot },
        { side: 'bottom', type: 'slot', raw: bottomSlot },
        { side: 'left', type: 'slot', raw: leftSlot },
      ].map(({ side, type, raw }) => ({
        side,
        type,
        element: PieceShape.parseSVGElement(raw),
      }));

      PieceShape.assetLength = PieceShape.validateSVGSizeConsistency(
        jointElements.map(({ element }) => element),
      );

      PieceShape.pathCommands = jointElements.reduce(
        (acc, { side, type, element }) => {
          const key = `${side}-${type}` as PathKey;

          acc[key] = PieceShape.parseSVGPath(PieceShape.parsePathData(element));

          return acc;
        },
        {} as Record<PathKey, PathCommand[]>,
      );
    } catch (error) {
      throw new Error(
        `Failed to initialize PuzzlePieceShape: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  public static initialize(pieceLength: number) {
    if (!pieceLength || pieceLength <= 0) {
      throw new Error('Piece length must be a positive number');
    }

    PieceShape.jointLength = pieceLength * JOINT_RATIO;
    PieceShape.scale = (pieceLength / PieceShape.assetLength) * JOINT_RATIO;
  }

  public static createShape(piece: Piece) {
    if (!PieceShape.scale) {
      throw new Error('PieceShape not initialized');
    }

    return PieceShape.traceOutline(piece);
  }

  public static updateShape(previous: Path2D, dx: number, dy: number) {
    const matrix = new DOMMatrix();
    matrix.translateSelf(dx, dy);

    const current = new Path2D();
    current.addPath(previous, matrix);

    return current;
  }

  public static drawSidePath(clipPath: Path2D, piece: Piece, side: Side) {
    const jointShape = piece.getJointShape(side);
    const [centerX, centerY] = piece.getSideCenter(side);

    const halfJointLength = PieceShape.jointLength / 2;
    const [offsetX, offsetY] = PieceShape.SIDE_OFFSET[side];

    const [jointX, jointY] = [
      centerX + offsetX * halfJointLength,
      centerY + offsetY * halfJointLength,
    ];

    clipPath.lineTo(jointX, jointY);

    if (jointShape !== 'flat') {
      PieceShape.drawPath(
        clipPath,
        PieceShape.pathCommands[`${side}-${jointShape}` as PathKey],
        jointX,
        jointY,
      );
    }

    clipPath.lineTo(...piece.getCorner(PieceShape.NEXT_CORNER_MAP[side]));
  }

  private static drawPath(
    clipPath: Path2D,
    commands: PathCommand[],
    currentX: number,
    currentY: number,
  ) {
    const scale = PieceShape.scale;

    for (const { dx, dy } of commands) {
      currentX += dx * scale;
      currentY += dy * scale;

      clipPath.lineTo(currentX, currentY);
    }
  }

  private static traceOutline(piece: Piece) {
    const { x, y } = piece.position;

    const clipPath = new Path2D();

    clipPath.moveTo(x, y);

    for (const side of ['top', 'right', 'bottom', 'left'] as Side[]) {
      PieceShape.drawSidePath(clipPath, piece, side);
    }

    clipPath.closePath();

    return clipPath;
  }

  // TODO: 현재는 상대좌표 명령어에만 대응
  private static parseSVGPath(d: string): PathCommand[] {
    const commands = d
      .trim()
      .replace(/\s+/g, ' ')
      .split(/(?=[mlhv])/)
      .map((command) => {
        const [type, ...position] = command.trim().split(/[\s,]+/);
        return {
          type,
          position: position.map(Number),
        } as SVGCommand;
      });

    const [, ...rest] = commands;

    return rest.map(({ type, position }) => {
      switch (type) {
        case 'l': {
          const [dx, dy] = position;
          return { dx, dy };
        }
        case 'h': {
          const [dx] = position;
          return { dx, dy: 0 };
        }
        case 'v': {
          const [dy] = position;
          return { dx: 0, dy };
        }
        default: {
          throw new Error(`Unsupported SVG path command type: '${type}'`);
        }
      }
    });
  }

  private static parseViewBox(element: Element): ViewBox {
    const [minX, minY, width, height] =
      element?.getAttribute('viewBox')?.split(' ').map(Number) ?? [];

    if (
      [minX, minY, width, height].some((value) => typeof value !== 'number')
    ) {
      throw new Error('Invalid viewBox format');
    }

    return { minX, minY, width, height };
  }

  private static validateSVGSizeConsistency(elements: Element[]) {
    const viewBoxes = elements.map((element) => {
      const viewBox = PieceShape.parseViewBox(element);

      if (viewBox.width !== viewBox.height) {
        throw new Error(
          `SVG must be square. Found irregular dimensions: ${viewBox.width}x${viewBox.height}`,
        );
      }

      return viewBox.width;
    });

    const [referenceLength] = viewBoxes;
    const invalidSizes = viewBoxes.filter((size) => size !== referenceLength);

    if (!invalidSizes.length) {
      return referenceLength;
    }

    throw new Error(
      `Inconsistent SVG sizes. Expected ${referenceLength}x${referenceLength}, but found: ${invalidSizes
        .map((size) => `${size}x${size}`)
        .join(', ')}`,
    );
  }

  private static parseSVGElement(raw: string): Element {
    const element = Document.parseHTMLUnsafe(raw).querySelector('svg');

    if (!element) {
      throw new Error(`Failed to parse SVG: ${raw}`);
    }

    return element;
  }

  private static parsePathData(element: Element): string {
    const pathData = element.querySelector('path')?.getAttribute('d');

    if (!pathData) {
      throw new Error(`Missing path data`);
    }

    return pathData;
  }
}
