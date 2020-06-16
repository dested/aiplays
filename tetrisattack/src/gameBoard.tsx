import {IGameInstance} from './tetris-attack';
import {GameCanvas} from './gameCanvas';
import {TileRow} from './tileRow';
import {blockSize} from './store/game/gameInstance';

export class GameBoard {
  rows: TileRow[] = [];
  cursor: {x: number; y: number} = {x: 0, y: 0};

  clone(gameInstance: IGameInstance) {
    const gameBoard = new GameBoard();
    gameBoard.rows = this.rows.map((t) => t.clone(gameBoard));
    return gameBoard;
  }

  topMostRow = 0;
  boardOffsetPosition = 200;
  speed = 10;

  tickCount = 0;

  tick() {
    if (this.tickCount++ % (60 - this.speed) === 0) {
      this.boardOffsetPosition -= 1;
      /*      this.visibleYs[0] = Math.ceil(this.boardOffsetPosition / blockSize);
      this.visibleYs[1] = Math.ceil(this.boardOffsetPosition / blockSize) + 12;*/
    }

    if (this.tickCount % 10 === 0) {
      for (let y = this.topMostRow; y < this.rows.length; y++) {
        const row = this.rows[y];
        if (row.isEmpty()) {
          this.topMostRow = y;
        } else {
          break;
        }
      }

      for (let i = 0; i < 15; i++) {
        if (!this.rows[i + this.topMostRow]) {
          this.rows[i + this.topMostRow] = new TileRow(this, i + this.topMostRow);
          this.rows[i + this.topMostRow].fillRandom();
        }
      }
    }

    for (let y = this.topMostRow; y < this.rows.length; y++) {
      const row = this.rows[y];
      row.tick();
    }
  }

  swap() {
    const row = this.rows[this.cursor.y];
    return row.swap(this.cursor.x);
  }
}
