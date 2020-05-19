export enum State {
  NOT_STARTED,
  RUNNING,
  PAUSED,
  WON,
  LOSE
}

export enum StateEvent {
  STATE_CHANGED,
  MAIN_MENU_BUTTON_CLICKED,
  IN_GAME_MENU_BUTTON_CLICKED
}

export type StateEventData = {
  event: StateEvent,
  data: any
}

type StateEventListener = (eventData: StateEventData) => void;

class StateManager {
  private static instance: StateManager;
  private _state: State;

  private eventListeners: {
    [prop: string]: StateEventListener[]
  };

  private constructor() {
    this._state = State.NOT_STARTED;
    this.eventListeners = {};
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new StateManager();
    }

    return this.instance;
  }

  get state() {
    return this._state;
  }

  set state(newState) {
    const oldState = this.state;
    this._state = newState;

    this.fire(StateEvent.STATE_CHANGED, {
      oldState,
      newState
    });
  }

  listen(event: StateEvent, eventListener: StateEventListener) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    this.eventListeners[event].push(eventListener);
  }

  fire(event: StateEvent, data?: any) {
    this.eventListeners[event].forEach(listener => listener({ event, data }));
  }

  reset() { }
}

export const GameState = StateManager.getInstance();
