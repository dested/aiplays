import {IGameInstance, IGamePieceInstance} from './tetris';

export class TetrisAI {
  constructor(private game: IGameInstance) {}

  tick() {
    console.clear();
    const scores: number[] = [];
    for (let i = 0; i < 4; i++) {
      const testGame = this.game.clone();
      testGame.rotatePiece();
      for (let y = testGame.boardHeight - 1; y >= 0; y--) {
        for (let x = 0; x < testGame.boardWidth; x++) {
          if (this.testPiece(testGame, x, y)) {
            return;
          }
        }
      }
    }
  }

  testPiece(instance: IGameInstance, x: number, y: number) {
    const piece = instance.getCurrentPiece();
    if (this.pieceFits(piece, x, y)) {
      let blocked = false;
      for (let subY = y - 1; subY >= 0; subY--) {
        if (!this.pieceFits(piece, x, subY)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        this.moveTowards(x, y);
        return true;
      }
    }
    return false;
  }

  pieceFits(piece: IGamePieceInstance, x: number, y: number) {
    for (let px = 0; px < piece.slot.length; px++) {
      for (let py = 0; py < piece.slot[px].length; py++) {
        if (piece.slot[px][py]) {
          if (!this.game.isOnBoard(x + px, y + py) || this.game.isBlocked(x + px, y + py)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  moveTowards(x: number, y: number) {
    const position = this.game.getPosition();
    console.log(x, y, position.x, position.y);
    if (x === position.x) {
      this.game.drop();
      return;
    }

    if (x < position.x) {
      this.game.moveLeft();
    } else if (x > position.x) {
      this.game.moveRight();
    }
  }
}
