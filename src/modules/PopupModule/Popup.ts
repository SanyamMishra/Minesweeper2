import { getElement } from '../../helpers';
// import { GameState, StateEvent } from '../../StateManager';

import moduleHtml from './Popup.html';
import './Popup.scss';

export type PopupButton = {
  text: string,
  action?: () => void
}

export class Popup {
  private _DOMElement: HTMLElement;

  constructor(
    private title: string,
    private content: string,
    private buttons: PopupButton[]
  ) {
    this._DOMElement = getElement(moduleHtml);

    this.config();
    this.render();
  }

  private config() {
    this.DOMElement.querySelector('.popup-modal--close-button')?.addEventListener('click', this.hide.bind(this));
  }

  private render() {
    this.DOMElement.querySelector('.popup-modal--header-text')!.innerHTML = this.title;
    this.DOMElement.querySelector('.popup-modal--body')!.innerHTML = this.content;

    const popupButtonTemplate = this.DOMElement.querySelector('template#popup-button') as HTMLTemplateElement;

    this.buttons.forEach(button => {
      const popupButtonElement = document.importNode(popupButtonTemplate.content, true).firstElementChild as HTMLDivElement;
      popupButtonElement.innerHTML = button.text;
      popupButtonElement.addEventListener('click', () => {
        this.hide();

        if (button.action) {
          button.action();
        }
      });
      this.DOMElement.querySelector('.popup-modal--buttons')?.append(popupButtonElement);
    });
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
