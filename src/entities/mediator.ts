class Mediator {
  private subscribers = new Map<keyof EventMap, EventMap[keyof EventMap]>();

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

  public publish(
    eventName: keyof EventMap,
    detail: Parameters<EventMap[keyof EventMap]>[0],
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

export interface EventMap {
  [MOUSE_DOWN]: (detail: MouseEvent) => void;
}
