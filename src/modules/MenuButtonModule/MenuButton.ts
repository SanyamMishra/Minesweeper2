import { getElement } from '../../helpers';

import moduleHtml from './MenuButton.html';
import './MenuButton.scss';

export class MenuButton {
  private _DOMElement: HTMLElement;

  constructor(
    private text: string,
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
    this.DOMElement.querySelector('template#button-text')?.replaceWith(this.text);
  }

  get DOMElement() {
    return this._DOMElement;
  }
}
