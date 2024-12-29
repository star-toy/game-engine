import { CursorStyle, State } from './state-stack';
import { PanState } from './pan-state';
import mediator, { PUSH_STATE_STACK } from '../mediator';

export class IdleState implements State {
  public readonly cursor: CursorStyle = {
    type: 'system',
    value: 'default',
  };

  public constructor() {}

  public handleMouseDown(event: MouseEvent) {
    this.handleInteractionStart(event);
  }
  public handleMouseMove(point: DOMPoint) {}
  public handleMouseUp(point: DOMPoint) {}
  public handleMouseLeave(event: MouseEvent) {}

  public draw(ctx: CanvasRenderingContext2D) {}

  private handleInteractionStart(event: MouseEvent) {
    const point = new DOMPoint(event.clientX, event.clientY);

    switch (event.button) {
      case 2:
        mediator.publish(PUSH_STATE_STACK, new PanState(point));
        break;
    }
  }
}
