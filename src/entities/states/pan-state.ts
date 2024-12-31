import { CursorStyle, State } from './state-stack';
import mediator, { MOUSE_MOVE, POP_STATE_STACK, ZOOM } from '../mediator';

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
    // TODO: translate viewport
  }

  private handleInteractionEnd() {
    mediator.publish(POP_STATE_STACK, null);
  }
}
