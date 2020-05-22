import { getElement } from '../../helpers';
import { GameState, StateEvent, State } from '../../StateManager';

import moduleHtml from './Timer.html';
import './Timer.scss';

export class Timer {
  private _DOMElement: HTMLElement;
  private initialTimestamp: number | undefined;
  private timerId: number | undefined;
  private pauseTimestamp: number | undefined;

  constructor(
    private iconClass?: string,
    private iconSrc?: string
  ) {
    this._DOMElement = getElement(moduleHtml);

    this.configure();
    this.render();
  }

  private configure() {
    GameState.listen(StateEvent.STATE_CHANGED, eventData => {
      if (eventData.data.newState === State.PAUSED || eventData.data.newState === State.WON || eventData.data.newState === State.LOSE) {
        this.pause();
      } else if (eventData.data.newState === State.RUNNING) {
        if (eventData.data.oldState === State.NOT_STARTED) {
          this.start();
        } else if (eventData.data.oldState === State.PAUSED) {
          this.resume();
        } else if (eventData.data.oldState === State.LOSE) {
          this.stop();
          this.start();
        }
      } else if (eventData.data.newState === State.NOT_STARTED) {
        this.stop();
      }
    });
  }

  private render() {
    let iconDOMElement: HTMLElement;
    if (this.iconClass) {
      iconDOMElement = getElement(`<i class="${this.iconClass}"></i>`);
    } else if (this.iconSrc) {
      iconDOMElement = getElement(`<img src="${this.iconSrc}"></i>`);
    } else {
      throw new Error('No valid icon found');
    }

    this.DOMElement.querySelector('template#timer-icon')?.replaceWith(iconDOMElement);
  }

  private tick() {
    if (this.initialTimestamp === undefined) {
      return;
    }

    const temp = Date.now();
    const diff = Math.trunc((temp - this.initialTimestamp) / 1000);
    const minutes = Math.trunc(diff / 60) + 'M';
    const seconds = (diff % 60) + 'S';

    this.DOMElement.querySelector('.timer--minutes')!.innerHTML = minutes;
    this.DOMElement.querySelector('.timer--seconds')!.innerHTML = seconds;
  }

  start() {
    if (this.initialTimestamp || this.timerId || this.pauseTimestamp) {
      return;
    }

    this.initialTimestamp = Date.now();

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);

    this.tick();
  }

  pause() {
    if (!this.initialTimestamp || !this.timerId) {
      return;
    }

    clearInterval(this.timerId);
    this.timerId = undefined;

    this.pauseTimestamp = Date.now();
  }

  resume() {
    if (!this.initialTimestamp || this.timerId || !this.pauseTimestamp) {
      return;
    }

    this.initialTimestamp += Date.now() - this.pauseTimestamp;
    this.pauseTimestamp = undefined;

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);

    this.tick();
  }

  stop() {
    clearInterval(this.timerId);
    this.timerId = undefined;
    this.initialTimestamp = undefined;
    this.pauseTimestamp = undefined;

    this.DOMElement.querySelector('.timer--minutes')!.innerHTML = '0M';
    this.DOMElement.querySelector('.timer--seconds')!.innerHTML = '0S';
  }

  get DOMElement() {
    return this._DOMElement;
  }

  show() {
    this.DOMElement.classList.remove('hide');
  }

  hide() {
    this.DOMElement.classList.add('hide');
  }
}
