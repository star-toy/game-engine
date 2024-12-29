import mediator, {
  MOUSE_DOWN,
  MOUSE_MOVE,
  MOUSE_UP,
  MOUSE_LEAVE,
  PUSH_STATE_STACK,
  POP_STATE_STACK,
  CHANGE_CURSOR,
} from '../mediator';
import { IdleState } from './idle-state';

export interface State {
  readonly cursor: CursorStyle;

  handleMouseDown(event: MouseEvent): void;
  handleMouseMove(point: DOMPoint): void;
  handleMouseUp(point: DOMPoint): void;
  handleMouseLeave(event: MouseEvent): void;

  draw(ctx: CanvasRenderingContext2D): void;
}

class StateStack {
  private readonly stack: State[] = [new IdleState()];

  constructor() {
    this.initializeEventSubscribers();
  }

  public get current() {
    return this.stack.at(-1)!;
  }

  public push(state: State) {
    this.stack.push(state);
    mediator.publish(CHANGE_CURSOR, this.current.cursor);
  }

  public pop() {
    this.stack.pop();
    mediator.publish(CHANGE_CURSOR, this.current.cursor);
  }

  public initializeEventSubscribers() {
    mediator.subscribe(MOUSE_DOWN, (event: MouseEvent) =>
      this.current.handleMouseDown(event),
    );
    mediator.subscribe(MOUSE_MOVE, (point: DOMPoint) =>
      this.current.handleMouseMove(point),
    );
    mediator.subscribe(MOUSE_UP, (point: DOMPoint) =>
      this.current.handleMouseUp(point),
    );
    mediator.subscribe(MOUSE_LEAVE, (event: MouseEvent) =>
      this.current.handleMouseLeave(event),
    );

    mediator.subscribe(PUSH_STATE_STACK, (state: State) => this.push(state));
    mediator.subscribe(POP_STATE_STACK, () => this.pop());
  }
}

export default new StateStack();

export type CursorStyle =
  | {
      type: 'system';
      value: CSSStyleDeclaration['cursor'];
    }
  | {
      type: 'custom';
      value: string;
      offsetX?: number;
      offsetY?: number;
    };
