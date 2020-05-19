import { getElement } from '../../helpers';
import { StateEvent, GameState, State } from '../../StateManager';

import moduleHtml from './InGameMenu.html';
import './InGameMenu.scss';

import { MenuHeader } from '../MenuHeaderModule/MenuHeader';
import { MenuButton } from '../MenuButtonModule/MenuButton';
import { Popup } from '../PopupModule/Popup';

export class InGameMenu {
  private _DOMElement: HTMLElement;
  private menuHeader: MenuHeader;
  private resumeButton: MenuButton;
  private restartButton: MenuButton;
  private restartConfirmPopup: Popup;
  private homeButton: MenuButton;
  private goToHomeConfirmPopup: Popup;

  constructor() {
    this._DOMElement = getElement(moduleHtml);
    this.menuHeader = new MenuHeader();
    this.resumeButton = new MenuButton('Resume', this.resumeGame.bind(this), 'fas fa-play');
    this.restartButton = new MenuButton('Restart', this.restartGame.bind(this), 'fas fa-undo-alt');
    this.homeButton = new MenuButton('Home', this.goToHome.bind(this), 'fas fa-home');
    this.restartConfirmPopup = new Popup('Restart Game', 'Are you sure? You will lose the current game', [
      {
        text: 'Yes',
        action: this.confirmRestartGame
      },
      {
        text: 'No'
      }
    ]);

    this.goToHomeConfirmPopup = new Popup('Go to home', 'Are you sure? You will lose the current game', [
      {
        text: 'Yes',
        action: this.confirmGoToHome
      },
      {
        text: 'No'
      }
    ]);

    this.config();
    this.rendor();
  }

  private config() {
    GameState.listen(StateEvent.STATE_CHANGED, (eventData) => {
      if (eventData.data.newState === State.PAUSED) {
        this.show();
      } else {
        this.hide();
      }
    });
  }

  private rendor() {
    this.restartConfirmPopup.hide();
    this.goToHomeConfirmPopup.hide();
    this.DOMElement.querySelector('template#in-game-menu-header')?.replaceWith(this.menuHeader.DOMElement);
    this.DOMElement.querySelector('template#resume-button')?.replaceWith(this.resumeButton.DOMElement);
    this.DOMElement.querySelector('template#restart-button')?.replaceWith(this.restartButton.DOMElement);
    this.DOMElement.querySelector('template#home-button')?.replaceWith(this.homeButton.DOMElement);
    this.DOMElement.querySelector('template#confirm-restart')?.replaceWith(this.restartConfirmPopup.DOMElement);
    this.DOMElement.querySelector('template#confirm-go-to-home')?.replaceWith(this.goToHomeConfirmPopup.DOMElement);
  }

  private resumeGame() {
    GameState.state = State.RUNNING;
  }

  private restartGame() {
    this.restartConfirmPopup.show();
  }

  private confirmRestartGame() {
    GameState.fire(StateEvent.IN_GAME_MENU_BUTTON_CLICKED, 'restartButton');
  }

  private goToHome() {
    this.goToHomeConfirmPopup.show();
  }

  private confirmGoToHome() {
    GameState.fire(StateEvent.IN_GAME_MENU_BUTTON_CLICKED, 'homeButton');
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
