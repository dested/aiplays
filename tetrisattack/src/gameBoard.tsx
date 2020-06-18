import {IGameInstance} from './tetris-attack';
import {GameCanvas} from './gameCanvas';
import {TileRow} from './tileRow';
import {tileSize, boardHeight, AnimationConstants} from './store/game/gameInstance';
import {GameTile, TileColor, TileColorWithoutEmpty} from './gameTile';
import {unreachable} from './types/unreachable';

export type PopAnimation = {
  queuedPops: GameTile[];
  popAnimationIndex: number;
  matchPhase: 'blink' | 'solid' | 'pop' | 'postPop';
  matchTimer: number;
};

export class GameBoard {
  rows: TileRow[] = [];
  cursor: {x: number; y: number} = {x: 0, y: 0};
  popAnimations: PopAnimation[] = [];

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

  boardOffsetPosition = tileSize * (boardHeight / 2);
  speed = 10;

  tickCount = 0;

  get boardPaused() {
    return this.popAnimations.length > 0;
  }

  tick() {
    if (!this.boardPaused) {
      if (this.tickCount++ % (60 - this.speed) === 0) {
        this.boardOffsetPosition += 1;
      }
    }

    if (this.tickCount % 10 === 0) {
      for (let y = this.topMostRow; y < this.rows.length; y++) {
        const row = this.rows[y];
        if (row.isEmpty()) {
          this.topMostRow = y;
        } else {
          if (boardHeight * tileSize - this.boardOffsetPosition - this.rows[this.topMostRow].tiles[0].drawY < 0) {
            // alert('dead');
          }
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

    for (let y = this.lowestVisibleRow; y >= this.topMostRow; y--) {
      const row = this.rows[y];
      if (row) row.tick();
    }

    for (const popAnimation of this.popAnimations) {
      switch (popAnimation.matchPhase) {
        case 'blink':
          if (popAnimation.matchTimer > 0) {
            popAnimation.matchTimer--;
          } else {
            popAnimation.matchPhase = 'solid';
            popAnimation.matchTimer = AnimationConstants.matchSolidTicks;
          }
          break;
        case 'solid':
          if (popAnimation.matchTimer > 0) {
            popAnimation.matchTimer--;
          } else {
            popAnimation.matchPhase = 'pop';
            popAnimation.matchTimer = AnimationConstants.matchPopTicksEach;
          }
          break;
        case 'pop':
          if (popAnimation.matchTimer > 0) {
            popAnimation.matchTimer--;
          } else {
            if (popAnimation.popAnimationIndex < popAnimation.queuedPops.length) {
              popAnimation.popAnimationIndex++;
              popAnimation.matchPhase = 'pop';
              popAnimation.matchTimer = AnimationConstants.matchPopTicksEach;
            } else {
              popAnimation.matchPhase = 'postPop';
              popAnimation.matchTimer = AnimationConstants.matchPostPopTicks;
            }
          }
          break;
        case 'postPop':
          if (popAnimation.matchTimer > 0) {
            popAnimation.matchTimer--;
          } else {
            this.popAnimations.remove(popAnimation);
            continue;
          }
          break;
      }

      for (const tile of popAnimation.queuedPops) {
        switch (popAnimation.matchPhase) {
          case 'blink':
            tile.drawType = popAnimation.matchTimer % 2 === 0 ? 'matched' : 'matched-blink';
            break;
          case 'solid':
            if (popAnimation.matchTimer > 0) {
              tile.drawType = 'popping';
            }
            break;
          case 'pop':
            if (popAnimation.matchTimer > 0) {
              const topPop = popAnimation.queuedPops[popAnimation.popAnimationIndex];
              if (topPop?.x === tile.x && topPop?.y === tile.y) {
                tile.drawType = 'popped';
              } else {
                if (tile.drawType !== 'popped') tile.drawType = 'popping';
              }
            }
            break;
          case 'postPop':
            tile.drawType = undefined;
            tile.color = 'empty';
            tile.swappable = true;
            break;
          case undefined:
            break;
        }
      }
    }

    const queuedPops: GameTile[] = [];
    for (let y = this.topMostRow; y < this.lowestVisibleRow; y++) {
      const row = this.rows[y];
      for (const tile of row.tiles) {
        if (tile.swappable && tile.color !== 'empty') {
          let total: number;
          if (tile.x < row.tiles.length - 1) {
            total = this.testTile(queuedPops, tile.color, 'right', tile.x + 1, tile.y, 1);
            if (total >= 3) {
              tile.pop();
              queuedPops.push(tile);
            }
          }
          total = this.testTile(queuedPops, tile.color, 'down', tile.x, tile.y + 1, 1);
          if (total >= 3) {
            tile.pop();
            queuedPops.push(tile);
          }
        }
      }
    }
    if (queuedPops.length > 0) {
      const popAnimation: PopAnimation = {
        queuedPops: queuedPops.reverse(),
        popAnimationIndex: 0,
        matchPhase: 'blink',
        matchTimer: AnimationConstants.matchBlinkTicks,
      };
      this.popAnimations.push(popAnimation);
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
              if (this.rows[upY].tiles[tile.x].color !== 'empty' && this.rows[upY].tiles[tile.x].swappable) {
                tilesToDrop.push(this.rows[upY].tiles[tile.x]);
              } else {
                break;
              }
            }

            let lowestY = tile.y;
            for (let downY = tile.y + 1; downY < this.rows.length; downY++) {
              if (this.rows[downY].tiles[tile.x].color === 'empty' && this.rows[downY].tiles[tile.x].swappable) {
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
    queuedPops: GameTile[],
    color: GameTile['color'],
    direction: 'left' | 'right' | 'up' | 'down',
    x: number,
    y: number,
    count: number
  ): number {
    const gameRow = this.rows[y];
    if (!gameRow) return count;
    const gameTile = gameRow.tiles[x];
    if (!gameTile || !gameTile.swappable) return count;

    switch (direction) {
      case 'left':
        if (gameTile.color === color) {
          const total = this.testTile(queuedPops, color, 'left', x - 1, y, count + 1);
          if (total >= 3) {
            queuedPops.push(gameTile);
            gameTile.pop();
          }
          return total;
        }
        return count;
      case 'right':
        if (gameTile.color === color) {
          const total = this.testTile(queuedPops, color, 'right', x + 1, y, count + 1);
          if (total >= 3) {
            queuedPops.push(gameTile);
            gameTile.pop();
          }
          return total;
        }
        return count;
      case 'up':
        if (gameTile.color === color) {
          const total = this.testTile(queuedPops, color, 'up', x, y - 1, count + 1);
          if (total >= 3) {
            queuedPops.push(gameTile);
            gameTile.pop();
          }
          return total;
        }
        return count;
      case 'down':
        if (y < this.lowestVisibleRow && gameTile.color === color) {
          const total = this.testTile(queuedPops, color, 'down', x, y + 1, count + 1);
          if (total >= 3) {
            queuedPops.push(gameTile);
            gameTile.pop();
          }
          return total;
        }
        return count;
      default:
        throw unreachable(direction);
    }
  }

  assets?: {
    regular: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
    falling1: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
    falling2: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
    squash: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
    dark: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
    popped: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
    transparent: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
    black: {[color in TileColorWithoutEmpty]: HTMLCanvasElement};
  };

  loadAssetSheet(assetSheet: HTMLCanvasElement[][]) {
    function convertToColor(assets: HTMLCanvasElement[]): {[color in TileColorWithoutEmpty]: HTMLCanvasElement} {
      return {
        green: assets[0],
        purple: assets[1],
        red: assets[2],
        yellow: assets[3],
        teal: assets[4],
        blue: assets[5],
      };
    }

    this.assets = {
      regular: convertToColor(assetSheet[0]),
      falling1: convertToColor(assetSheet[1]),
      falling2: convertToColor(assetSheet[2]),
      squash: convertToColor(assetSheet[3]),
      dark: convertToColor(assetSheet[4]),
      popped: convertToColor(assetSheet[5]),
      transparent: convertToColor(assetSheet[6]),
      black: convertToColor(assetSheet[7]),
    };
  }
}
