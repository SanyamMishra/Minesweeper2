import { getElement } from '../../helpers';

import moduleHtml from './CornerButton.html';
import './CornerButton.scss';

export enum Corner {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right'
}

export class CornerButton {
  private _DOMElement: HTMLElement;

  constructor(
    private corner: Corner,
    private callback: () => void,
    private iconClass?: string,
    private iconSrc?: string
  ) {
    this._DOMElement = getElement(moduleHtml);

    this.configure();
    this.render();
  }

  private configure() {
    this.DOMElement.addEventListener('click', this.callback);
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

    this.DOMElement.querySelector('template#button-icon')?.replaceWith(iconDOMElement);
    this.DOMElement.classList.add(this.corner);
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
