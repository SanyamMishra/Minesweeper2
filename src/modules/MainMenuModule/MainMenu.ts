import { getElement } from '../../helpers';
import { GameState, StateEvent, State } from '../../StateManager';

import moduleHtml from './MainMenu.html';
import './MainMenu.scss';

import { MenuHeader } from '../MenuHeaderModule/MenuHeader';
import { MenuButton } from '../MenuButtonModule/MenuButton';

import '../../assets/images/cube3x.svg';
import '../../assets/images/cube5x.svg';

export class MainMenu {
  private _DOMElement: HTMLElement;
  private menuHeader: MenuHeader;
  private smallGridButton: MenuButton;
  private mediumGridButton: MenuButton;
  private largeGridButton: MenuButton;

  constructor() {
    this._DOMElement = getElement(moduleHtml);
    this.menuHeader = new MenuHeader();
    this.smallGridButton = new MenuButton('8x8', this.startSmallGame, 'fas fa-cube');
    this.mediumGridButton = new MenuButton('10x10', this.startMediumGame, undefined, 'fonts/cube3x.svg');
    this.largeGridButton = new MenuButton('12x12', this.startLargeGame, undefined, 'fonts/cube5x.svg');

    this.config();
    this.rendor();
  }

  private config() {
    GameState.listen(StateEvent.STATE_CHANGED, (eventData) => {
      if (eventData.data.newState === State.NOT_STARTED) {
        this.show();
      } else {
        this.hide();
      }
    });
  }

  private rendor() {
    this.DOMElement.querySelector('template#menu-header')?.replaceWith(this.menuHeader.DOMElement);
    this.DOMElement.querySelector('template#small-grid-button')?.replaceWith(this.smallGridButton.DOMElement);
    this.DOMElement.querySelector('template#medium-grid-button')?.replaceWith(this.mediumGridButton.DOMElement);
    this.DOMElement.querySelector('template#large-grid-button')?.replaceWith(this.largeGridButton.DOMElement);
  }

  private startSmallGame() {
    GameState.fire(StateEvent.MAIN_MENU_BUTTON_CLICKED, 'smallGridButton');
  }

  private startMediumGame() {
    GameState.fire(StateEvent.MAIN_MENU_BUTTON_CLICKED, 'mediumGridButton');
  }

  private startLargeGame() {
    GameState.fire(StateEvent.MAIN_MENU_BUTTON_CLICKED, 'largeGridButton');
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
