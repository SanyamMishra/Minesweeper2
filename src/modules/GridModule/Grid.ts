import './Grid.scss';
import Cell from '../CellModule/Cell';

// Grid class
export default class Grid {
  private _DOMElement: HTMLDivElement;
  private grid: Cell[][];
  private _mineCells: Cell[];
  private _unrevealedCellsCount: number;
  private revealGapTime = 50;

  // create a new grid
  constructor(private rowCount: number, private columnCount: number, private _totalMines: number) {
    // 2D array of cells
    this.grid = [...Array(this.rowCount)].map((_, rowIndex) => {
      return [...Array(this.columnCount)].map((_, columnIndex) => {
        return new Cell(rowIndex, columnIndex);
      });
    });

    this._DOMElement = document.createElement('div');
    this.DOMElement.classList.add('minesweeper-grid');

    this._mineCells = [];
    this._unrevealedCellsCount = rowCount * columnCount;

    this.render();
  }

  get DOMElement() {
    return this._DOMElement;
  }

  // loop through all the cells of the grid
  forEachCell(callback: (cell: Cell) => void) {
    this.grid.forEach((gridRow) => {
      gridRow.forEach((cell) => {
        callback(cell);
      });
    });
  }

  private render() {
    this.forEachCell((cell) => {
      this.DOMElement.append(cell.DOMElement);
    });

    document.body.append(this.DOMElement);
  }

  // place mines on the grid at random
  placeMines(seedCell: Cell) {
    let totalMinesPlaced = 0;

    while (totalMinesPlaced < this.totalMines) {
      // select a new cell to mine at random
      const x = Math.floor(Math.random() * this.rowCount);
      const y = Math.floor(Math.random() * this.columnCount);
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
    this.updateMineCounts();
  }

  // get a cell placed at (x,y) coordinates
  getCell(x: number, y: number) {
    return this.grid[x][y];
  }

  // get total mine count of the grid
  get totalMines() {
    return this._totalMines;
  }

  // get all the mine cells of the grid
  get mineCells() {
    return this._mineCells;
  }

  // reveal all the mine cells of the grid
  revealAllMines() {
    this.mineCells.forEach((mineCell, index) => setTimeout(() => {
      // forcibly reveal the mine cell
      const isRevealed = mineCell.reveal(true);
      if (isRevealed === 1) {
        this.unrevealedCellsCount--;
      }
    }, index * this.revealGapTime));
  }

  // get the current unrevealed cells count
  get unrevealedCellsCount() {
    return this._unrevealedCellsCount;
  }

  // decrease the unrevealed cells counter
  set unrevealedCellsCount(value) {
    if (value < 0) {
      throw new Error('unrevealedCellsCount cannot be negative');
    }

    this._unrevealedCellsCount = value;
  }

  // loop through the neighbourhood of a cell, once for each cell
  forEachNeighbourhoodCell(cell: Cell, callback: (cell: Cell) => void) {
    // getting the neighbourhood boundaries of the cell
    const minX = cell.x === 0 ? 0 : cell.x - 1;
    const minY = cell.y === 0 ? 0 : cell.y - 1;
    const maxX = cell.x === (this.rowCount - 1) ? cell.x : cell.x + 1;
    const maxY = cell.y === (this.columnCount - 1) ? cell.y : cell.y + 1;

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

  // update mine count of each cell in the grid
  updateMineCounts() {
    this.forEachCell((cell) => {
      let mineCount = 0;
      this.forEachNeighbourhoodCell(cell, neighbourCell => neighbourCell.mined ? mineCount++ : '');
      cell.mineCount = mineCount;
    });
  }

  // reset every cell in the grid
  reset() {
    this.forEachCell(cell => {
      cell.reset();
    });

    this.mineCells.splice(0);
  }
}
