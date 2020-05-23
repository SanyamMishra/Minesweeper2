import { getElement } from '../../helpers';
import { GameState, StateEvent, State } from '../../StateManager';

import moduleHtml from './GameStat.html';
import './GameStat.scss';

export class GameStat {
  private _DOMElement: HTMLElement;
  private _value: number;

  constructor(
    private iconClass?: string,
    private iconSrc?: string
  ) {
    this._DOMElement = getElement(moduleHtml);

    this._value = 0;

    this.configure();
    this.render();
  }

  private configure() {
    GameState.listen(StateEvent.STATE_CHANGED, eventData => {
      console.log(eventData, State);
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

    this.DOMElement.querySelector('template#game-stat-icon')?.replaceWith(iconDOMElement);
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
    this.DOMElement.querySelector('.stat')!.innerHTML = String(value);
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
