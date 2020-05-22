import { getElement } from '../../helpers';
import { GameState, StateEvent, StateEventData, State } from './../../StateManager';

import moduleHtml from './Game.html';
import './Game.scss';

import { MainMenu } from '../MainMenuModule/MainMenu';
import { InGameMenu } from '../InGameMenuModule/InGameMenu';
import { CornerButton, Corner } from '../CornerButtonModule/CornerButton';
import { Grid, GridOptions } from '../GridModule/Grid';
import { Popup } from '../PopupModule/Popup';
import { Timer } from "../TimerModule/Timer";

const mineRevealGapTime = 50;

const smallGridOptions: GridOptions = {
  gridSize: {
    rowCount: 8,
    columnCount: 8
  },
  totalMines: 9,
  mineRevealGapTime
};

const mediumGridOptions: GridOptions = {
  gridSize: {
    rowCount: 10,
    columnCount: 10
  },
  totalMines: 15,
  mineRevealGapTime
};

const largeGridOptions: GridOptions = {
  gridSize: {
    rowCount: 12,
    columnCount: 12
  },
  totalMines: 25,
  mineRevealGapTime
};

// Game class
export class Game {
  private _DOMElement: HTMLElement;
  private mainMenu: MainMenu;
  private inGameMenu: InGameMenu;
  private pauseButton: CornerButton;
  private smallGrid: Grid;
  private mediumGrid: Grid;
  private largeGrid: Grid;
  private timer: Timer;
  private gameWonPopup: Popup;
  private gameLosePopup: Popup;

  private showGameEndPopup: boolean;

  // create a new game environment
  constructor() {
    this._DOMElement = getElement(moduleHtml);
    this.mainMenu = new MainMenu();
    this.inGameMenu = new InGameMenu();
    this.pauseButton = new CornerButton(Corner.TOP_LEFT, this.pauseButtonHandler.bind(this), 'fas fa-pause');
    this.smallGrid = new Grid(smallGridOptions);
    this.mediumGrid = new Grid(mediumGridOptions);
    this.largeGrid = new Grid(largeGridOptions);
    this.timer = new Timer('fas fa-clock');
    this.gameWonPopup = new Popup('Congratulations ✨🎊', 'You won the Game!!', [
      {
        text: 'Cool',
        action: () => GameState.state = State.NOT_STARTED
      }
    ]);

    this.gameLosePopup = new Popup('Oh No 🙁', 'You lose the Game', [
      {
        text: 'Okay',
        action: () => GameState.state = State.NOT_STARTED
      }
    ]);

    this.showGameEndPopup = true;

    this.config();
    this.render();
  }

  private config() {
    this.inGameMenu.hide();
    this.pauseButton.hide();
    this.smallGrid.hide();
    this.mediumGrid.hide();
    this.largeGrid.hide();
    this.gameWonPopup.hide();
    this.gameLosePopup.hide();
    GameState.listen(StateEvent.MAIN_MENU_BUTTON_CLICKED, this.mainMenuButtonsHandler.bind(this));
    GameState.listen(StateEvent.IN_GAME_MENU_BUTTON_CLICKED, this.inGameMenuButtonsHandler.bind(this));

    GameState.listen(StateEvent.STATE_CHANGED, eventData => {
      if (eventData.data.newState === State.NOT_STARTED) {
        this.smallGrid.hide();
        this.mediumGrid.hide();
        this.largeGrid.hide();
      } else if (eventData.data.newState === State.WON) {
        this.showGameEndPopup && this.gameWonPopup.show();
      } else if (eventData.data.newState === State.LOSE) {
        this.showGameEndPopup && this.gameLosePopup.show();
      }
    });
  }

  private render() {
    this.DOMElement.querySelector('template#main-menu')?.replaceWith(this.mainMenu.DOMElement);
    this.DOMElement.querySelector('template#in-game-menu')?.replaceWith(this.inGameMenu.DOMElement);
    this.DOMElement.querySelector('template#pause-button')?.replaceWith(this.pauseButton.DOMElement);
    this.DOMElement.querySelector('template#small-grid')?.replaceWith(this.smallGrid.DOMElement);
    this.DOMElement.querySelector('template#medium-grid')?.replaceWith(this.mediumGrid.DOMElement);
    this.DOMElement.querySelector('template#large-grid')?.replaceWith(this.largeGrid.DOMElement);
    this.DOMElement.querySelector('template#timer')?.replaceWith(this.timer.DOMElement);
    this.DOMElement.querySelector('template#game-won-popup')?.replaceWith(this.gameWonPopup.DOMElement);
    this.DOMElement.querySelector('template#game-lose-popup')?.replaceWith(this.gameLosePopup.DOMElement);
  }

  private mainMenuButtonsHandler(eventData: StateEventData) {
    GameState.state = State.RUNNING;
    this.pauseButton.show();
    switch (eventData.data) {
      case 'smallGridButton':
        this.smallGrid.show();
        break;
      case 'mediumGridButton':
        this.mediumGrid.show();
        break;
      case 'largeGridButton':
        this.largeGrid.show();
        break;
    }
  }

  private inGameMenuButtonsHandler(eventData: StateEventData) {
    this.showGameEndPopup = false;
    GameState.state = State.LOSE;

    if (eventData.data === 'restartButton') {
      GameState.state = State.RUNNING;
    } else if (eventData.data === 'homeButton') {
      GameState.state = State.NOT_STARTED;
    }

    this.showGameEndPopup = true;
  }

  private pauseButtonHandler() {
    GameState.state = State.PAUSED;
  }

  get DOMElement() {
    return this._DOMElement;
  }
}
