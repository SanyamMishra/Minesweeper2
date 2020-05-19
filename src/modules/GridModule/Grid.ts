import { getElement } from '../../helpers';
import { GameState, State, StateEvent } from '../../StateManager';

import moduleHtml from './Grid.html';
import './Grid.scss';

import { Cell, CellPosition } from '../CellModule/Cell';

export type GridSize = {
  rowCount: number;
  columnCount: number;
}

export type GridOptions = {
  gridSize: GridSize,
  totalMines: number;
  mineRevealGapTime: number;
}

enum UserInteractionType { CLICK, CONTEXTMENU }

// Grid class
export class Grid {
  private _DOMElement: HTMLDivElement;
  private gridSize: GridSize;
  private grid: Cell[][];
  private totalMines: number;
  private mineCells: Cell[];
  private unrevealedCellsCount: number;
  private revealGapTime: number;

  // create a new grid
  constructor(gridOptions: GridOptions) {
    this._DOMElement = getElement(moduleHtml) as HTMLDivElement;

    this.gridSize = gridOptions.gridSize;

    // 2D array of cells
    this.grid = [...Array(this.gridSize.rowCount)].map((_, rowIndex) => {
      return [...Array(this.gridSize.columnCount)].map((_, columnIndex) => {
        return new Cell(rowIndex, columnIndex, this.getCellPosition(rowIndex, columnIndex));
      });
    });

    this.totalMines = gridOptions.totalMines;
    this.mineCells = [];
    this.unrevealedCellsCount = this.gridSize.rowCount * this.gridSize.columnCount;
    this.revealGapTime = gridOptions.mineRevealGapTime;

    this.config();
    this.render();
  }

  private getCellPosition(x: number, y: number) {
    let cellPosition: CellPosition;
    if (x === 0 && y === 0) {
      cellPosition = CellPosition.TOP_LEFT;
    } else if (x === 0 && y !== this.gridSize.columnCount - 1) {
      cellPosition = CellPosition.TOP;
    } else if (x === 0 && y === this.gridSize.columnCount - 1) {
      cellPosition = CellPosition.TOP_RIGHT;
    } else if (x !== this.gridSize.rowCount - 1 && y === 0) {
      cellPosition = CellPosition.LEFT;
    } else if (x !== this.gridSize.rowCount - 1 && y === this.gridSize.columnCount - 1) {
      cellPosition = CellPosition.RIGHT;
    } else if (x === this.gridSize.rowCount - 1 && y === 0) {
      cellPosition = CellPosition.BOTTOM_LEFT;
    } else if (x === this.gridSize.rowCount - 1 && y !== this.gridSize.columnCount - 1) {
      cellPosition = CellPosition.BOTTOM;
    } else if (x === this.gridSize.rowCount - 1 && y === this.gridSize.columnCount - 1) {
      cellPosition = CellPosition.BOTTOM_RIGHT;
    } else {
      cellPosition = CellPosition.IN_BETWEEN;
    }

    return cellPosition;
  }

  private config() {
    this.DOMElement.addEventListener('click', event => {
      if (!event.target) return;

      const targetCell = (event.target as HTMLElement).closest('.cell');
      if (targetCell) {
        this.handleUserInteraction(targetCell as HTMLDivElement, UserInteractionType.CLICK);
      }
    });

    this.DOMElement.addEventListener('contextmenu', event => {
      event.preventDefault();

      if (!event.target) return;

      const targetCell = (event.target as HTMLElement).closest('.cell');
      if (targetCell) {
        this.handleUserInteraction(targetCell as HTMLDivElement, UserInteractionType.CONTEXTMENU);
      }
    });

    GameState.listen(StateEvent.STATE_CHANGED, eventData => {
      if (eventData.data.newState === State.LOSE || eventData.data.newState === State.WON) {
        this.reset();
      }
    });
  }

  private render() {
    const grid = this.DOMElement.querySelector('.grid') as HTMLDivElement;
    this.forEachCell((cell) => {
      grid.append(cell.DOMElement);
    });

    grid.style.gridTemplateRows = `repeat(${this.gridSize.rowCount}, 1fr)`;
    grid.style.gridTemplateColumns = `repeat(${this.gridSize.columnCount}, 1fr)`;
  }

  private handleUserInteraction(cellDomElement: HTMLDivElement, interactionType: UserInteractionType) {
    if (!cellDomElement.dataset.x || !cellDomElement.dataset.y) return;

    const x = +cellDomElement.dataset.x;
    const y = +cellDomElement.dataset.y;
    const cell = this.getCell(x, y);

    // initialise the game if not started already
    if (GameState.state === State.RUNNING && this.mineCells.length == 0) {
      this.init(cell);

      // override contextmenu interaction for the first time, when grid is initialized
      interactionType = UserInteractionType.CLICK;
    };

    // analyse the move of the user
    this.analyseMove(cell, interactionType);
  }

  // initiate the grid by placing the mines
  init(seedCell: Cell) {
    let totalMinesPlaced = 0;

    while (totalMinesPlaced < this.totalMines) {
      // select a new cell to mine at random
      const x = Math.floor(Math.random() * this.gridSize.rowCount);
      const y = Math.floor(Math.random() * this.gridSize.columnCount);
      const mineCell = this.grid[x][y];

      // select another cell to mine if current cell is already mined
      if (mineCell.mined) continue;

      // select another cell to mine if current cell is the seed cell itself
      if (mineCell.equals(seedCell)) continue;

      // select another cell to mine if current cell is a neighbour of seed cell
      if (mineCell.isNeighbourOf(seedCell)) continue;

      // save current mine cell
      mineCell.mined = true;
      this.mineCells.push(mineCell);
      totalMinesPlaced++;
    }

    // update mine counts of all the cells in the grid
    this.forEachCell((cell) => {
      let mineCount = 0;
      this.forEachNeighbourhoodCell(cell, neighbourCell => neighbourCell.mined ? mineCount++ : '');
      cell.mineCount = mineCount;
    });
  }

  // analyse the move of the player
  analyseMove(cell: Cell, interactionType: UserInteractionType) {
    if (interactionType === UserInteractionType.CLICK) {
      const isRevealed = cell.reveal();
      if (isRevealed !== 1) return;

      this.unrevealedCellsCount--;

      // if cell is mined then reveal all the mines of the grid
      // GAME OVER
      if (cell.mined) {
        // reveal all mines
        return this.revealAllMines();
      }

      // if there was no mine in the neighbourhood of the cell,
      // then look for mines in the neighbourhood of the neighbouring cells
      if (!cell.mineCount) {
        this.forEachNeighbourhoodCell(cell, neighbourCell => this.analyseMove(
          neighbourCell,
          UserInteractionType.CLICK
        ));
      }
    } else if (interactionType === UserInteractionType.CONTEXTMENU) {
      cell.toggleFlag();
    }

    if (GameState.state === State.RUNNING) {
      this.checkForSuccess();
    }
  }

  // check whether the game has finished successfully
  checkForSuccess() {
    const areAllMinedCellsFlagged = this.mineCells.reduce((prev, mineCell) => prev ? mineCell.flagged : prev, true);
    if (areAllMinedCellsFlagged || this.unrevealedCellsCount === this.totalMines) {
      GameState.state = State.WON;
    }
  }

  // get a cell placed at (x,y) coordinates
  getCell(x: number, y: number) {
    return this.grid[x][y];
  }

  // reveal all the mine cells of the grid
  revealAllMines() {
    this.mineCells.forEach((mineCell, index, minecells) => setTimeout(() => {
      // forcibly reveal the mine cell
      const isRevealed = mineCell.reveal(true);
      if (isRevealed === 1) {
        this.unrevealedCellsCount--;
      }

      if (index == minecells.length - 1) {
        GameState.state = State.LOSE;
      }
    }, index * this.revealGapTime));
  }

  // loop through all the cells of the grid
  forEachCell(callback: (cell: Cell) => void) {
    this.grid.forEach((gridRow) => {
      gridRow.forEach((cell) => {
        callback(cell);
      });
    });
  }

  // loop through the neighbourhood of a cell, once for each cell
  forEachNeighbourhoodCell(cell: Cell, callback: (cell: Cell) => void) {
    // getting the neighbourhood boundaries of the cell
    const minX = cell.x === 0 ? 0 : cell.x - 1;
    const minY = cell.y === 0 ? 0 : cell.y - 1;
    const maxX = cell.x === (this.gridSize.rowCount - 1) ? cell.x : cell.x + 1;
    const maxY = cell.y === (this.gridSize.columnCount - 1) ? cell.y : cell.y + 1;

    // looping through the neighbourhood
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        // skipping the cell itself
        if (i === cell.x && j === cell.y) continue;

        // calling the callback once for each neighbourhood cell
        callback(this.grid[i][j]);
      }
    }
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

  // reset every cell in the grid
  reset() {
    this.mineCells.splice(0);
    this.unrevealedCellsCount = this.gridSize.rowCount * this.gridSize.columnCount;
  }
}
