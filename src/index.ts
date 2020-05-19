import Game from './modules/GameModule/Game';

// setting parameters for the game and creating UI
new Game({
  gridSize: {
    rowCount: 10,
    columnCount: 10
  },
  totalMines: 15
});


