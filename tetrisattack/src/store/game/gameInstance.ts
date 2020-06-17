import {IGameInstance} from '../../tetris-attack';
import {GameBoard} from '../../gameBoard';
import {GameTile} from '../../gameTile';

export const boardWidth = 6;
export const boardHeight = 12;
export const blockSize = 32;
export const AnimationConstants = {
  swapTicks: 4,
  dropStallTicks: 12,
  matchBlinkTicks: 44,
  matchSolidTicks: 20,
  matchPopTicksEach: 9,
  matchPostPopTicks: 3,
};

export class GameInstance implements IGameInstance {
  static mainInstance: GameInstance;

  board!: GameBoard;

  clone(): IGameInstance {
    const gameLogic = new GameInstance();
    gameLogic.board = this.board.clone(gameLogic);
    return gameLogic;
  }

  getCursorPosition(): {x: number; y: number} {
    return {x: 0, y: 0};
  }

  moveDown() {
    if (this.board.cursor.y >= this.board.lowestVisibleRow - 1) {
      return false;
    }
    this.board.cursor.y++;
    return true;
  }

  moveRight() {
    if (this.board.cursor.x >= boardWidth - 2) {
      return false;
    }

    this.board.cursor.x++;
    return true;
  }

  moveLeft() {
    if (this.board.cursor.x <= 0) {
      return false;
    }
    this.board.cursor.x--;
    return true;
  }

  moveUp() {
    if (this.board.cursor.y < 0) {
      return false;
    }
    this.board.cursor.y--;
    return true;
  }

  reset() {
    this.board = new GameBoard();
  }

  tick() {}

  getTiles(x: number, y: number): [GameTile?, GameTile?] {
    return [undefined, undefined];
  }

  swap(): boolean {
    return this.board.swap();
  }
}
