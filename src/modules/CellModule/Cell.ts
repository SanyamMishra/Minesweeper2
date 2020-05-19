import { getElement } from '../../helpers';
import { GameState, StateEvent, State } from '../../StateManager';

import moduleHtml from './Cell.html';
import './Cell.scss';

export enum CellPosition {
  TOP_LEFT,
  TOP,
  TOP_RIGHT,
  LEFT,
  IN_BETWEEN,
  RIGHT,
  BOTTOM_LEFT,
  BOTTOM,
  BOTTOM_RIGHT
}

// Cell class
export class Cell {
  private _DOMElement: HTMLDivElement;
  private borderRightElement: HTMLDivElement;
  private borderBottomElement: HTMLDivElement;
  private iconFlagElement: HTMLDivElement;
  private iconMineElement: HTMLDivElement;
  private mineCountElement: HTMLDivElement;
  private _mined: boolean;
  private _revealed: boolean;
  private _flagged: boolean;
  private _mineCount: number;

  // create a new cell
  constructor(private _x: number, private _y: number, private cellPosition: CellPosition) {
    // create the DOM representation of the cell
    this._DOMElement = getElement(moduleHtml) as HTMLDivElement;
    this.borderRightElement = this.DOMElement.querySelector('.cell-border--right') as HTMLDivElement;
    this.borderBottomElement = this.DOMElement.querySelector('.cell-border--bottom') as HTMLDivElement;
    this.iconFlagElement = this.DOMElement.querySelector('.cell-icon--flag') as HTMLDivElement;
    this.iconMineElement = this.DOMElement.querySelector('.cell-icon--mine') as HTMLDivElement;
    this.mineCountElement = this.DOMElement.querySelector('.cell-mine-count') as HTMLDivElement;

    // set the cell flags
    this._mined = false;
    this._revealed = false;
    this._flagged = false;

    // setting the neighbourhood mines count
    this._mineCount = 0;

    this.config();
    this.render();
  }

  private config() {
    GameState.listen(StateEvent.STATE_CHANGED, eventData => {
      if (eventData.data.newState === State.LOSE || eventData.data.newState === State.WON) {
        this.reset();
      }
    });
  }

  private render() {
    this.DOMElement.dataset.x = this.x.toString();
    this.DOMElement.dataset.y = this.y.toString();

    switch (this.cellPosition) {
      case CellPosition.TOP_RIGHT:
      case CellPosition.RIGHT:
        this.borderRightElement.classList.add('hide');
        break;
      case CellPosition.BOTTOM_LEFT:
      case CellPosition.BOTTOM:
        this.borderBottomElement.classList.add('hide');
        break;
      case CellPosition.BOTTOM_RIGHT:
        this.borderBottomElement.classList.add('hide');
        this.borderRightElement.classList.add('hide');
        break;
    }
  }

  // return the X coordinate of the cell
  get x() {
    return this._x;
  }

  // return the Y coordinate of the cell
  get y() {
    return this._y;
  }

  get DOMElement() {
    return this._DOMElement;
  }

  // check if the cell contains a mine
  get mined() {
    return this._mined;
  }

  // add a mine to the the cell
  set mined(value) {
    this._mined = value;
  }

  // check if the cell is flagged
  get flagged() {
    return this._flagged;
  }

  set flagged(value) {
    if (value === true) {
      // mark this cell as flagged
      if (this.revealed || this.flagged) return;

      this.iconFlagElement.classList.remove('hide');
      this._flagged = true;
    } else {
      // remove flag from the cell
      if (!this.flagged) return;

      this.iconFlagElement.classList.add('hide');
      this._flagged = false;
    }
  }

  // get the count of mines in the neighbourhood of the cell
  get mineCount() {
    return this._mineCount;
  }

  // set the count of mines in the neighbourhood of the cell
  set mineCount(value) {
    if (value >= 0) {
      this._mineCount = value;
    } else {
      throw new Error('Invalid mine count value');
    }
  }

  // check if the cell is flagged
  get revealed() {
    return this._revealed;
  }

  reveal(forceReveal = false): -1 | 0 | 1 {
    // return -1 if the cell is already revealed
    if (this.revealed) return -1;

    // return 0 if the cell is flagged and cannot be revealed forcibly
    if (!forceReveal && this.flagged) return 0;

    if (this.mined) {
      this.iconFlagElement.classList.add('hide');
      this.iconMineElement.classList.remove('hide');
    } else {
      if (this.mineCount) {
        this.mineCountElement.innerHTML = this.mineCount.toString();
        this.mineCountElement.classList.remove('hide');
      }
      this.DOMElement.classList.add('revealed');
    }
    this._revealed = true;

    // return 1 if the cell is revealed
    return 1;
  }

  // toggle the flag of the cell
  toggleFlag() {
    if (this.flagged) {
      this.flagged = false;
    } else {
      this.flagged = true;
    }
  }

  // check if the cell is equal to the compareCell
  equals(compareCell: Cell) {
    if (this.x === compareCell.x && this.y === compareCell.y) {
      return true;
    }

    return false;
  }

  // check if the cell is in vicinity of the provided compareCell
  isNeighbourOf(compareCell: Cell) {
    if (Math.abs(this.x - compareCell.x) <= 1 && Math.abs(this.y - compareCell.y) <= 1) {
      return true;
    }

    return false;
  }

  private reset() {
    this.iconFlagElement.classList.add('hide');
    this.iconMineElement.classList.add('hide');
    this.mineCountElement.classList.add('hide');
    this.mineCountElement.innerHTML = '';
    this.DOMElement.className = 'cell';
    this.mined = false;
    this._revealed = false;
    this.flagged = false;
    this.mineCount = 0;
  }
}
