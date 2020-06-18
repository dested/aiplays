import {tileSize, boardHeight, AnimationConstants, boardWidth} from './store/game/gameInstance';
import {GameTile, TileColor} from './gameTile';
import {unreachable} from './types/unreachable';
import {randomElement} from './utils/utilts';

export type PopAnimation = {
  queuedPops: GameTile[];
  popAnimationIndex: number;
  matchPhase: 'blink' | 'solid' | 'pop' | 'postPop';
  matchTimer: number;
};

export type SwapAnimation = {
  y: number;
  x1: number;
  x2: number;
  swapTickCount: number;
};

export const GameTiles: GameTile['color'][] = ['red', 'blue', 'yellow', 'teal', 'purple'];

export class GameBoard {
  constructor() {
    for (let i = 0; i < 15; i++) {
      if (!this.getTile(0, i)) {
        this.fillRandom(i);
      }
    }
  }
  tiles: GameTile[] = [];
  cursor: {x: number; y: number} = {x: 0, y: 0};
  popAnimations: PopAnimation[] = [];
  swapAnimation?: SwapAnimation;

  topMostRow = 0;
  get lowestVisibleRow() {
    let lowestY = Number.MAX_SAFE_INTEGER;
    for (const tile of this.tiles) {
      if (this.boardOffsetPosition - tile.drawY <= 0) {
        lowestY = Math.min(lowestY, tile.y - 1);
      }
    }
    return lowestY;
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
      /*for (let y = this.topMostRow; y < this.rows.length; y++) {
        const row = this.rows[y];
        if (row.isEmpty()) {
          this.topMostRow = y;
        } else {
          if (boardHeight * tileSize - this.boardOffsetPosition - this.rows[this.topMostRow].tiles[0].drawY < 0) {
            // alert('dead');
          }
          break;
        }
      }*/
      for (let i = 0; i < 15; i++) {
        if (!this.getTile(0, this.topMostRow + i)) {
          this.fillRandom(this.topMostRow + i);
        }
      }
    }

    for (let y = this.lowestVisibleRow; y >= this.topMostRow; y--) {
      for (let x = 0; x < boardWidth; x++) {
        const tile = this.getTile(x, y);
        tile?.tick();
      }
    }

    if (this.swapAnimation) {
      const tile1 = this.getTile(this.swapAnimation.x1, this.swapAnimation.y);
      const tile2 = this.getTile(this.swapAnimation.x2, this.swapAnimation.y);
      if (this.swapAnimation.swapTickCount > 0) {
        this.swapAnimation.swapTickCount--;
        const swapPercent = 1 - this.swapAnimation.swapTickCount / AnimationConstants.swapTicks;
        if (tile1) {
          tile1.drawX = tile1.x * tileSize + tileSize * swapPercent;
        }
        if (tile2) {
          tile2.drawX = tile2.x * tileSize - tileSize * swapPercent;
        }
      } else if (this.swapAnimation.swapTickCount === 0) {
        if (tile1) {
          tile1.x = this.swapAnimation.x2;
          tile1.setSwappable(true);
        }
        if (tile2) {
          tile2.x = this.swapAnimation.x1;
          tile2.setSwappable(true);
        }
        this.swapAnimation = undefined;
      }
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
            this.tiles.remove(tile);
            break;
          case undefined:
            break;
        }
      }
    }

    const queuedPops: GameTile[] = [];
    for (let y = this.topMostRow; y < this.lowestVisibleRow; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const tile = this.getTile(x, y);
        if (!tile || !tile.swappable || tile.newY !== undefined) continue;
        let total: number;
        if (tile.x < boardWidth - 1) {
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
      for (let x = 0; x < boardWidth; x++) {
        const tile = this.getTile(x, y);
        if (tile && tile.droppable) {
          if (!this.getTile(tile.x, tile.y + 1)) {
            const tilesToDrop: GameTile[] = [];
            for (let upY = tile.y; upY >= this.topMostRow; upY--) {
              const tileUp = this.getTile(tile.x, upY);
              if (tileUp && tileUp.droppable) {
                tilesToDrop.push(tileUp);
              } else {
                break;
              }
            }

            for (const gameTile of tilesToDrop) {
              gameTile.drop(gameTile.y + 1);
            }
          }
        }
      }
    }
  }

  private testTile(
    queuedPops: GameTile[],
    color: GameTile['color'],
    direction: 'left' | 'right' | 'up' | 'down',
    x: number,
    y: number,
    count: number
  ): number {
    const gameTile = this.getTile(x, y);
    if (!gameTile || !gameTile.swappable || gameTile.newY !== undefined) return count;

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
    regular: {[color in TileColor]: HTMLCanvasElement};
    bounceLow: {[color in TileColor]: HTMLCanvasElement};
    bounceHigh: {[color in TileColor]: HTMLCanvasElement};
    bounceMid: {[color in TileColor]: HTMLCanvasElement};
    dark: {[color in TileColor]: HTMLCanvasElement};
    popped: {[color in TileColor]: HTMLCanvasElement};
    transparent: {[color in TileColor]: HTMLCanvasElement};
    black: {[color in TileColor]: HTMLCanvasElement};
  };

  loadAssetSheet(assetSheet: HTMLCanvasElement[][]) {
    function convertToColor(assets: HTMLCanvasElement[]): {[color in TileColor]: HTMLCanvasElement} {
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
      bounceHigh: convertToColor(assetSheet[1]),
      bounceMid: convertToColor(assetSheet[2]),
      bounceLow: convertToColor(assetSheet[3]),
      dark: convertToColor(assetSheet[4]),
      popped: convertToColor(assetSheet[5]),
      transparent: convertToColor(assetSheet[6]),
      black: convertToColor(assetSheet[7]),
    };
  }

  fillRandom(y: number) {
    for (let x = 0; x < boardWidth; x++) {
      this.tiles.push(new GameTile(this, randomElement(GameTiles), true, x, y));
    }
  }

  isEmpty(y: number) {
    for (let x = 0; x < boardWidth; x++) {
      if (this.getTile(x, y)) {
        return false;
      }
    }
    return true;
  }

  swap(): boolean {
    const x = this.cursor.x;
    const y = this.cursor.y;
    const tile = this.getTile(x, y);
    const tileRight = this.getTile(x + 1, y);
    if ((!tile || tile.swappable) && (!tileRight || tileRight.swappable)) {
      this.swapAnimation = {
        swapTickCount: AnimationConstants.swapTicks,
        x1: x,
        x2: x + 1,
        y,
      };
      tile?.setSwappable(false);
      tileRight?.setSwappable(false);
      return true;
    }
    return false;
  }

  getTile(x: number, y: number) {
    return this.tiles.find((a) => a.x === x && a.y === y);
  }
}
