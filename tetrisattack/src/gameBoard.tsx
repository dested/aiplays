import {IGameInstance} from './tetris-attack';
import {GameCanvas} from './gameCanvas';
import {TileRow} from './tileRow';
import {blockSize, boardHeight} from './store/game/gameInstance';
import {GameTile} from './gameTile';
import {unreachable} from './types/unreachable';

export class GameBoard {
  rows: TileRow[] = [];
  cursor: {x: number; y: number} = {x: 0, y: 0};

  clone(gameInstance: IGameInstance) {
    const gameBoard = new GameBoard();
    gameBoard.rows = this.rows.map((t) => t.clone(gameBoard));
    return gameBoard;
  }

  topMostRow = 0;
  get lowestVisibleRow() {
    for (let y = this.topMostRow; y < this.rows.length; y++) {
      const row = this.rows[y];
      if (this.boardOffsetPosition - row.tiles[0].drawY <= 0) {
        return y - 1;
      }
    }
    return this.rows.length;
  }

  boardOffsetPosition = blockSize * (boardHeight / 4);
  speed = 50;

  tickCount = 0;

  tick() {
    if (this.tickCount++ % (60 - this.speed) === 0) {
      this.boardOffsetPosition += 1;
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

    for (let y = this.topMostRow; y < this.lowestVisibleRow; y++) {
      const row = this.rows[y];
      row.tick();
    }
    for (let y = this.topMostRow; y < this.lowestVisibleRow; y++) {
      const row = this.rows[y];
      for (const tile of row.tiles) {
        if (tile.swappable) {
          let total: number;
          if (tile.x > 0) {
            total = this.testTile(tile.color, 'left', tile.x - 1, tile.y, 1);
            if (total >= 3) {
              tile.pop();
            }
          }
          if (tile.x < row.tiles.length - 1) {
            total = this.testTile(tile.color, 'right', tile.x + 1, tile.y, 1);
            if (total >= 3) {
              tile.pop();
            }
          }
          total = this.testTile(tile.color, 'up', tile.x, tile.y - 1, 1);
          if (total >= 3) {
            tile.pop();
          }
          total = this.testTile(tile.color, 'down', tile.x, tile.y + 1, 1);
          if (total >= 3) {
            tile.pop();
          }
        }
      }
    }

    for (let y = this.topMostRow; y < this.lowestVisibleRow; y++) {
      const row = this.rows[y];
      for (const tile of row.tiles) {
        if (tile.swappable) {
          if (
            this.rows[tile.y + 1].tiles[tile.x].color === 'empty' &&
            this.rows[tile.y].tiles[tile.x].color !== 'empty'
          ) {
            const tilesToDrop: GameTile[] = [];
            for (let upY = tile.y; upY >= this.topMostRow; upY--) {
              if (this.rows[upY].tiles[tile.x].color !== 'empty') {
                tilesToDrop.push(this.rows[upY].tiles[tile.x]);
              } else {
                break;
              }
            }

            let lowestY = tile.y;
            for (let downY = tile.y + 1; downY < this.rows.length; downY++) {
              if (this.rows[downY].tiles[tile.x].color === 'empty') {
                lowestY = downY;
              } else {
                break;
              }
            }

            for (let i = 0; i < tilesToDrop.length; i++) {
              const tilesToDropElement = tilesToDrop[i];
              tilesToDropElement.drop(lowestY - i);
            }
          }
        }
      }
    }
  }

  swap() {
    const row = this.rows[this.cursor.y];
    return row.swap(this.cursor.x);
  }

  private testTile(
    color: GameTile['color'],
    direction: 'left' | 'right' | 'up' | 'down',
    x: number,
    y: number,
    count: number
  ): number {
    switch (direction) {
      case 'left':
        if (this.rows[y].tiles[x].color === color) {
          if (x > 0) {
            const total = this.testTile(color, 'left', x - 1, y, count + 1);
            if (total >= 3) {
              this.rows[y].tiles[x].pop();
            }
            return total;
          }
        }
        return count;
      case 'right':
        if (this.rows[y].tiles[x].color === color) {
          if (x < this.rows[y].tiles.length - 1) {
            const total = this.testTile(color, 'right', x + 1, y, count + 1);
            if (total >= 3) {
              this.rows[y].tiles[x].pop();
            }
            return total;
          }
        }
        return count;

      case 'up':
        if (this.rows[y] && this.rows[y].tiles[x].color === color) {
          const total = this.testTile(color, 'up', x, y - 1, count + 1);
          if (total >= 3) {
            this.rows[y].tiles[x].pop();
          }
          return total;
        }
        return count;

      case 'down':
        if (y < this.lowestVisibleRow && this.rows[y].tiles[x].color === color) {
          const total = this.testTile(color, 'down', x, y + 1, count + 1);
          if (total >= 3) {
            this.rows[y].tiles[x].pop();
          }
          return total;
        }
        return count;
      default:
        throw unreachable(direction);
    }
  }
}
