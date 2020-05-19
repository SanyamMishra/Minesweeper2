import './Game.scss';
import Grid from '../GridModule/Grid';

type GameOptions = {
  gridSize: {
    rowCount: number;
    columnCount: number;
  },
  totalMines: number;
}

enum UserInteractionType { CLICK, CONTEXTMENU }

class GameState {
  private static instance: GameState;
  public started: boolean;
  public isOver: boolean;

  private constructor() {
    this.started = false;
    this.isOver = false;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new GameState();
    }

    return this.instance;
  }

  reset() {
    this.started = false;
    this.isOver = false;
  }
}

// Game class
export default class Game {
  private grid: Grid;
  private gameState: GameState;

  // create a new game environment
  constructor(options: GameOptions) {
    this.grid = new Grid(options.gridSize.rowCount, options.gridSize.columnCount, options.totalMines);
    this.gameState = GameState.getInstance();

    this.config();
  }

  private config() {
    this.grid.DOMElement.addEventListener('click', event => {
      if (!event.target) return;

      const targetCell = (event.target as HTMLElement).closest('.cell');
      if (targetCell) {
        this.handleUserInteraction(targetCell as HTMLDivElement, UserInteractionType.CLICK);
      }
    });

    this.grid.DOMElement.addEventListener('contextmenu', event => {
      event.preventDefault();

      if (!event.target) return;

      const targetCell = (event.target as HTMLElement).closest('.cell');
      if (targetCell) {
        this.handleUserInteraction(targetCell as HTMLDivElement, UserInteractionType.CONTEXTMENU);
      }
    });
  }

  private handleUserInteraction(cellDomElement: HTMLDivElement, interactionType: UserInteractionType) {
    if (!cellDomElement.dataset.x || !cellDomElement.dataset.y) return;

    const x = +cellDomElement.dataset.x;
    const y = +cellDomElement.dataset.y;

    // initialise the game if not started already
    if (!this.gameState.started) this.init(x, y);

    // analyse the move of the user
    this.analyseMove({ x, y }, interactionType);
  }

  // initiate the game by placing the mines
  init(x: number, y: number) {
    const seedCell = this.grid.getCell(x, y);
    this.grid.placeMines(seedCell);
    this.gameState.started = true;
  }

  // check whether the game has finished successfully
  checkForSuccess() {
    const areAllMinedCellsFlagged = this.grid.mineCells.reduce((prev, mineCell) => prev ? mineCell.flagged : prev, true);
    if (areAllMinedCellsFlagged || this.grid.unrevealedCellsCount === this.grid.totalMines) {
      this.gameState.isOver = true;
      alert('Congratulations! You Won!');
      // this.reset();
    }
  }

  // analyse the move of the player
  analyseMove(cellCoordinates: { x: number, y: number }, interactionType: UserInteractionType) {
    // get the cell from the coordinates
    const cell = this.grid.getCell(cellCoordinates.x, cellCoordinates.y);

    if (interactionType === UserInteractionType.CLICK) {
      const isRevealed = cell.reveal();
      if (isRevealed !== 1) return;

      this.grid.unrevealedCellsCount--;

      // if cell is mined then reveal all the mines of the grid
      // GAME OVER
      if (cell.mined) {
        // reveal all mines
        this.gameState.isOver = true;
        this.grid.revealAllMines();
        return;
      }

      // if there was no mine in the neighbourhood of the cell,
      // then look for mines in the neighbourhood of the neighbouring cells
      if (!cell.mineCount) {
        this.grid.forEachNeighbourhoodCell(cell, neighbourCell => this.analyseMove(
          { x: neighbourCell.x, y: neighbourCell.y },
          UserInteractionType.CLICK
        ));
      }
    } else if (interactionType === UserInteractionType.CONTEXTMENU) {
      cell.toggleFlag();
    }

    if (!this.gameState.isOver) {
      this.checkForSuccess();
    }
  }

  // reset the game
  reset() {
    this.grid.reset();
    this.gameState.reset();
  }
}
