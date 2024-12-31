import { CursorStyle, State } from './state-stack';
import mediator, {
  MOUSE_MOVE,
  POP_STATE_STACK,
  TRANSLATE,
} from '../../mediator';

export class PanState implements State {
  public readonly cursor: CursorStyle = {
    type: 'system',
    value: 'grabbing',
  };

  public constructor(private origin: DOMPoint) {}

  public handleMouseDown(event: MouseEvent) {}
  public handleMouseMove(point: DOMPoint) {
    this.handleInteractionMove(point);
  }
  public handleMouseUp() {
    this.handleInteractionEnd();
  }
  public handleMouseLeave(event: MouseEvent) {
    this.handleInteractionEnd();
  }

  public handleMouseWheel(deltaY: WheelEvent['deltaY']) {}

  public draw(ctx: CanvasRenderingContext2D) {}

  public initializeEventSubscribers() {}

  public disposeEventSubscribers() {
    mediator.unsubscribe(MOUSE_MOVE);
  }

  private handleInteractionMove(point: DOMPoint) {
    const dx = point.x - this.origin.x;
    const dy = point.y - this.origin.y;

    mediator.publish(TRANSLATE, { dx, dy });

    this.origin = point;
  }

  private handleInteractionEnd() {
    mediator.publish(POP_STATE_STACK, null);
  }
}
