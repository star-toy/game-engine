import { CursorStyle, State } from './states/state-stack';

class Mediator {
  private subscribers = new Map<
    keyof EventMap,
    { [K in keyof EventMap]: EventMap[K] }[keyof EventMap]
  >();

  public subscribe(
    eventName: keyof EventMap,
    callback: EventMap[keyof EventMap],
  ) {
    if (this.subscribers.has(eventName)) {
      throw new Error(
        `이벤트 '${eventName}'는 이미 구독자가 있습니다. 현재 설계상 하나의 이벤트는 하나의 구독자만 가질 수 있습니다.`,
      );
    }

    this.subscribers.set(eventName, callback);
  }

  public publish<T extends keyof EventMap>(
    eventName: T,
    detail: Parameters<EventMap[T]>[0],
  ) {
    const callback = this.subscribers.get(eventName) as any; // TODO: EventMap으로부터 타입 추론

    if (!callback) {
      throw new Error(`이벤트 '${eventName}'는 설정되어있지 않습니다.`);
    }

    return callback(detail);
  }

  public unsubscribe(eventName: keyof EventMap) {
    this.subscribers.delete(eventName);
  }
}

export default new Mediator();

export const MOUSE_DOWN = 'mouse-down';
export const MOUSE_MOVE = 'mouse-move';
export const MOUSE_UP = 'mouse-up';
export const MOUSE_LEAVE = 'mouse-leave';

export const CHANGE_CURSOR = 'change-cursor';

export const ZOOM = 'zoom';

export const PUSH_STATE_STACK = 'push-state-stack';
export const POP_STATE_STACK = 'pop-state-stack';

export interface EventMap {
  [MOUSE_DOWN]: (detail: MouseEvent) => void;
  [MOUSE_MOVE]: (detail: DOMPoint) => void;
  [MOUSE_UP]: (detail: DOMPoint) => void;
  [MOUSE_LEAVE]: (detail: DOMPoint) => void;

  [CHANGE_CURSOR]: (detail: CursorStyle) => void;

  [ZOOM]: (detail: number) => void;

  [PUSH_STATE_STACK]: (detail: State) => void;
  [POP_STATE_STACK]: (detail: null) => void;
}
