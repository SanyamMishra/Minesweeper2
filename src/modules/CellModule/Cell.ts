import './Cell.scss';

enum CellIcons {
  FLAG = 'fas fa-flag',
  MINE = 'fas fa-bomb'
};

// Cell class
export default class Cell {
  private _DOMElement: HTMLDivElement;
  private _mined: boolean;
  private _revealed: boolean;
  private _flagged: boolean;
  private _mineCount: number;

  // create a new cell
  constructor(private _x: number, private _y: number) {
    // create the DOM representation of the cell
    this._DOMElement = document.createElement('div');
    this.DOMElement.className = 'cell';
    this.DOMElement.dataset.x = this.x.toString();
    this.DOMElement.dataset.y = this.y.toString();

    // **** THIS WILL BE DONE BY THE GRID ITSELF ****
    // add the cell to the UI
    // document.querySelector('.minesweeper-grid').append(this.domElement);

    // set the cell flags
    this._mined = false;
    this._revealed = false;
    this._flagged = false;

    // setting the neighbourhood mines count
    this._mineCount = 0;
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
    if (value === true) {
      this.DOMElement.classList.add('containsMine');
    } else {
      this.DOMElement.classList.remove('containsMine');
    }

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

      this.DOMElement.innerHTML = `<i class="${CellIcons.FLAG}"></i>`;
      this.DOMElement.classList.add('flagged');
      this._flagged = true;
    } else {
      // remove flag from the cell
      if (!this.flagged) return;

      this.DOMElement.innerHTML = '';
      this.DOMElement.classList.remove('flagged');
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
      this.DOMElement.innerHTML = `<i class="${CellIcons.MINE}"></i>`;
      this.DOMElement.classList.add('mined');
    } else {
      if (this.mineCount) {
        this.DOMElement.innerHTML = this.mineCount.toString();
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

  reset() {
    this.DOMElement.innerHTML = '';
    this.DOMElement.className = 'cell';
  }
}
