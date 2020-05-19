import { getElement } from '../../helpers';

import moduleHtml from './MenuHeader.html';
import './MenuHeader.scss';

export class MenuHeader {
  private _DOMElement: HTMLElement;

  constructor() {
    this._DOMElement = getElement(moduleHtml);
  }

  get DOMElement() {
    return this._DOMElement;
  }
}
