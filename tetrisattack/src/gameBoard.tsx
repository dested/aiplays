import {AnimationConstants, boardHeight, boardWidth, tileSize} from './store/game/gameInstance';
import {GameTile} from './gameTile';
import {unreachable} from './types/unreachable';
import {randomElement} from './utils/utilts';
import {TetrisAttackAssets} from './assetManager';

export type PopAnimation = {
  queuedPops: GameTile[];
  popAnimationIndex: number;
  matchPhase: 'blink' | 'solid' | 'pop' | 'postPop';
  matchTimer: number;
  popAnimation: {
    comboCount: number;
    x: number;
    startingY: number;
    tick: number;
  };
};

export type SwapAnimation = {
  y: number;
  x1: number;
  x2: number;
  swapTickCount: number;
};
export type DroppingAnimation = {
  bouncingTiles: GameTile[];
  bottomY: number;
  x: number;
  dropTickCount: number;

  dropBounceTick: number;
  dropBouncePhase: 'not-started' | 'regular' | 'low' | 'high' | 'mid';
};

export type TileColor = 'green' | 'purple' | 'red' | 'yellow' | 'teal' | 'blue';
export const GameTiles: TileColor[] = ['green', 'purple', 'red' /*, 'yellow', 'teal', 'blue'*/];

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
  droppingColumns: DroppingAnimation[] = [];

  topMostRow = 0;
  get lowestVisibleRow() {
    for (let y = this.topMostRow; y < 10000; y++) {
      if (this.boardOffsetPosition - y * tileSize <= 0) {
        return y - 1;
      }
    }
    return 10000;
  }

  boardOffsetPosition = tileSize * (boardHeight / 2);
  speed = 10;

  tickCount = 0;

  get boardPaused() {
    return this.popAnimations.length > 0;
  }

  tick() {
    this.tickCount++;
    if (!this.boardPaused) {
      if (this.tickCount % (60 - this.speed) === 0) {
        this.boardOffsetPosition += 1;
      }
    }

    if (this.tickCount % 10 === 0) {
      const currentLowestY = this.lowestVisibleRow;
      for (let y = this.topMostRow; y < currentLowestY; y++) {
        if (this.isEmpty(y)) {
          this.topMostRow = y;
        } else {
          /*
          if (boardHeight * tileSize - this.boardOffsetPosition - this.rows[this.topMostRow].tiles[0].drawY < 0) {
            // alert('dead');
          }
*/
          break;
        }
      }

      const maxY = Math.max(...this.tiles.map((a) => a.y)) + 1;
      console.log(maxY, this.topMostRow, maxY - this.topMostRow, maxY - this.topMostRow < 15);
      if (maxY - this.topMostRow < 15) {
        for (let y = maxY; y < maxY + this.topMostRow; y++) {
          this.fillRandom(y);
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
          tile1.setX(this.swapAnimation.x2);
          tile1.setSwappable(true);
        }
        if (tile2) {
          tile2.setX(this.swapAnimation.x1);
          tile2.setSwappable(true);
        }
        this.swapAnimation = undefined;
      }
    }

    for (let i = this.popAnimations.length - 1; i >= 0; i--) {
      const popAnimation = this.popAnimations[i];
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
            this.popAnimations.splice(i, 1);
            for (const tile of popAnimation.queuedPops) {
              this.popTile(tile);
            }
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
        if (!tile || !tile.swappable || !this.getTile(x, y + 1)) continue;
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
      const topMostLeftMostTile = [...queuedPops].sort((a, b) => a.y * boardWidth + a.x - (b.y * boardWidth + b.x))[0];
      const popAnimation: PopAnimation = {
        queuedPops: queuedPops.reverse(),
        popAnimationIndex: 0,
        matchPhase: 'blink',
        matchTimer: AnimationConstants.matchBlinkTicks,
        popAnimation: {
          startingY: topMostLeftMostTile.drawY,
          x: topMostLeftMostTile.drawX,
          comboCount: 4,
          tick: 0,
        },
      };
      this.popAnimations.push(popAnimation);
    }

    for (let i = this.droppingColumns.length - 1; i >= 0; i--) {
      const droppingPiece = this.droppingColumns[i];

      if (droppingPiece.dropBouncePhase !== 'not-started') {
        if (droppingPiece.dropBounceTick > 0) {
          droppingPiece.dropBounceTick--;
        } else if (droppingPiece.dropBounceTick === 0) {
          if (this.popAnimations.length > 0) {
            for (let j = droppingPiece.bouncingTiles.length - 1; j >= 0; j--) {
              const gameTile = droppingPiece.bouncingTiles[j];
              if (this.popAnimations.find((a) => a.queuedPops.some((t) => t === gameTile))) {
                droppingPiece.bouncingTiles.splice(j, 1);
              }
            }
          }

          switch (droppingPiece.dropBouncePhase) {
            case 'regular':
              droppingPiece.dropBounceTick = AnimationConstants.dropBounceTicks;
              droppingPiece.dropBouncePhase = 'low';
              for (const gameTile of droppingPiece.bouncingTiles) {
                gameTile.drawType = 'bounce-low';
              }
              break;
            case 'low':
              droppingPiece.dropBounceTick = AnimationConstants.dropBounceTicks;
              droppingPiece.dropBouncePhase = 'high';
              for (const gameTile of droppingPiece.bouncingTiles) {
                gameTile.drawType = 'bounce-high';
                gameTile.setSwappable(true);
              }
              break;
            case 'high':
              droppingPiece.dropBounceTick = AnimationConstants.dropBounceTicks;
              droppingPiece.dropBouncePhase = 'mid';
              for (const gameTile of droppingPiece.bouncingTiles) {
                gameTile.drawType = 'bounce-mid';
              }
              break;
            case 'mid':
              for (const gameTile of droppingPiece.bouncingTiles) {
                gameTile.drawType = 'regular';
              }
              this.droppingColumns.splice(i, 1);
              break;
          }
        }
      } else {
        if (droppingPiece.dropTickCount > 0) {
          droppingPiece.dropTickCount--;
        } else if (droppingPiece.dropTickCount === 0) {
          for (let y = droppingPiece.bottomY; y >= this.topMostRow; y--) {
            const tile = this.getTile(droppingPiece.x, y);
            if (tile) {
              tile.setY(tile.y + 1);
            }
          }
          droppingPiece.bottomY += 1;
          if (this.getTile(droppingPiece.x, droppingPiece.bottomY + 1) !== undefined) {
            droppingPiece.bouncingTiles = [];

            for (let y = this.topMostRow + 1; y <= droppingPiece.bottomY; y++) {
              const tile = this.getTile(droppingPiece.x, y);
              if (tile) {
                droppingPiece.bouncingTiles.push(tile);
                tile.setSwappable(false);
              }
            }
            droppingPiece.dropBounceTick = 1;
            droppingPiece.dropBouncePhase = 'regular';
          } else {
            droppingPiece.dropTickCount = 0;
          }
        }
      }
    }

    for (let y = this.topMostRow; y < this.lowestVisibleRow; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const tile = this.getTile(x, y);
        if (tile && tile.swappable) {
          if (!this.getTile(tile.x, tile.y + 1)) {
            tile.setSwappable(false);
            this.droppingColumns.push({
              dropTickCount: AnimationConstants.dropStallTicks,
              bouncingTiles: [],
              dropBounceTick: 0,
              x: tile.x,
              bottomY: tile.y,
              dropBouncePhase: 'not-started',
            });
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
    if (!gameTile || !gameTile.swappable || !this.getTile(x, y + 1)) return count;

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

  assets!: {
    block: {
      regular: {[color in TileColor]: HTMLCanvasElement};
      bounceLow: {[color in TileColor]: HTMLCanvasElement};
      bounceHigh: {[color in TileColor]: HTMLCanvasElement};
      bounceMid: {[color in TileColor]: HTMLCanvasElement};
      dark: {[color in TileColor]: HTMLCanvasElement};
      popped: {[color in TileColor]: HTMLCanvasElement};
      transparent: {[color in TileColor]: HTMLCanvasElement};
      black: {[color in TileColor]: HTMLCanvasElement};
    };
    boxes: {
      pop: HTMLCanvasElement;
      repeat: HTMLCanvasElement;
    };
    numbers: {
      2: HTMLCanvasElement;
      3: HTMLCanvasElement;
      4: HTMLCanvasElement;
      5: HTMLCanvasElement;
      6: HTMLCanvasElement;
      7: HTMLCanvasElement;
      8: HTMLCanvasElement;
      9: HTMLCanvasElement;
      10: HTMLCanvasElement;
      11: HTMLCanvasElement;
      12: HTMLCanvasElement;
      13: HTMLCanvasElement;
      14: HTMLCanvasElement;
      15: HTMLCanvasElement;
      16: HTMLCanvasElement;
      17: HTMLCanvasElement;
      18: HTMLCanvasElement;
      19: HTMLCanvasElement;
    };
  };

  loadAssetSheets(
    blockAssetSheet: HTMLCanvasElement[][],
    comboBoxesAssetSheet: HTMLCanvasElement[][],
    numbersAssetSheet: HTMLCanvasElement[][]
  ) {
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
      block: {
        regular: convertToColor(blockAssetSheet[0]),
        bounceHigh: convertToColor(blockAssetSheet[1]),
        bounceMid: convertToColor(blockAssetSheet[2]),
        bounceLow: convertToColor(blockAssetSheet[3]),
        dark: convertToColor(blockAssetSheet[4]),
        popped: convertToColor(blockAssetSheet[5]),
        transparent: convertToColor(blockAssetSheet[6]),
        black: convertToColor(blockAssetSheet[7]),
      },
      boxes: {
        pop: comboBoxesAssetSheet[0][0],
        repeat: comboBoxesAssetSheet[0][1],
      },
      numbers: {
        2: numbersAssetSheet[0][0],
        3: numbersAssetSheet[0][1],
        4: numbersAssetSheet[0][2],
        5: numbersAssetSheet[0][3],
        6: numbersAssetSheet[0][4],
        7: numbersAssetSheet[0][5],
        8: numbersAssetSheet[0][6],
        9: numbersAssetSheet[0][7],
        10: numbersAssetSheet[0][8],
        11: numbersAssetSheet[0][9],
        12: numbersAssetSheet[0][10],
        13: numbersAssetSheet[0][11],
        14: numbersAssetSheet[0][13],
        15: numbersAssetSheet[0][14],
        16: numbersAssetSheet[0][15],
        17: numbersAssetSheet[0][16],
        18: numbersAssetSheet[0][17],
        19: numbersAssetSheet[0][18],
      },
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

  private popTile(tile: GameTile) {
    if (this.tiles.indexOf(tile) === -1) {
      throw new Error('bad pop');
    } else {
      this.tiles.splice(this.tiles.indexOf(tile), 1);
    }
  }

  drawBox(
    context: CanvasRenderingContext2D,
    type: 'pop' | 'repeat',
    count: keyof GameBoard['assets']['numbers'],
    x: number,
    y: number
  ) {
    context.drawImage(this.assets.boxes[type], x, y, tileSize, tileSize - 2);
    switch (type) {
      case 'repeat':
        context.drawImage(this.assets.numbers[count], x + 6 * 2, y + 3 * 2, 10 * 2, 9 * 2);
        break;
      case 'pop':
        context.drawImage(this.assets.numbers[count], x + 3 * 2, y + 3 * 2, 10 * 2, 9 * 2);
        break;
      default:
        throw unreachable(type);
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.save();

    context.translate(0, boardHeight * tileSize - this.boardOffsetPosition);
    context.lineWidth = 1;
    for (let y = this.topMostRow; y < this.lowestVisibleRow + 1; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const tile = this.getTile(x, y);
        if (tile) tile.draw(context);
        if (y === this.lowestVisibleRow) {
          context.fillStyle = '#00000099';
          context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    const selectionBox = TetrisAttackAssets.assets['game.selectionBox'].image;
    context.drawImage(
      selectionBox,
      this.cursor.x * tileSize - 4,
      this.cursor.y * tileSize - 4,
      tileSize * 2 + 8,
      tileSize + 8
    );

    for (const popAnimation of this.popAnimations) {
      if (popAnimation.popAnimation.tick > 2) {
        let offset = GameBoard.getBoxOffset(popAnimation.popAnimation.tick);
        if (offset === -1) {
          continue;
        }

        if (popAnimation.queuedPops.length > 3) {
          this.drawBox(
            context,
            'pop',
            popAnimation.queuedPops.length as keyof GameBoard['assets']['numbers'],
            popAnimation.popAnimation.x,
            popAnimation.popAnimation.startingY - offset
          );
          offset += tileSize;
        }
        if (popAnimation.popAnimation.comboCount > 1) {
          this.drawBox(
            context,
            'repeat',
            popAnimation.popAnimation.comboCount as keyof GameBoard['assets']['numbers'],
            popAnimation.popAnimation.x,
            popAnimation.popAnimation.startingY - offset
          );
        }
      }
      popAnimation.popAnimation.tick++;
    }

    context.restore();
  }

  static getBoxOffset(tick: number) {
    if (tick < 7) {
      return tick - 2;
    } else if (tick < 7) {
      return 5 + Math.ceil((tick - 7) / 2);
    } else if (tick < 7 + 8) {
      return 9 + Math.ceil((tick - 7 - 8) / 3);
    } else if (tick < 7 + 8 + 32) {
      return 13 + Math.ceil((tick - 7 - 8 - 8) / 4);
    } else if (tick < 7 + 8 + 32 + 30) {
      return 20;
    } else {
      return -1;
    }
  }
}
