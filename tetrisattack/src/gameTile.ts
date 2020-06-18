import {TileRow} from './tileRow';
import {AnimationConstants, tileSize} from './store/game/gameInstance';
import {GameCanvas} from './gameCanvas';
import {PopAnimation} from './gameBoard';
import {unreachable} from './types/unreachable';

export type TileColor = 'green' | 'purple' | 'red' | 'yellow' | 'teal' | 'blue' | 'empty';
export type TileColorWithoutEmpty = Exclude<TileColor, 'empty'>;

export class GameTile {
  private dropBounceTick = 0;
  private dropBouncePhase?: 'regular' | 'low' | 'high' | 'mid';
  private dropState?: 'stalled' | 'falling';

  draw(context: CanvasRenderingContext2D) {
    if (this.color === 'empty') return;

    switch (this.drawType) {
      case 'matched':
        context.drawImage(this.row.gameBoard.assets!.regular[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'matched-blink':
        context.fillStyle = '#D6D7D6';
        context.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        context.drawImage(
          this.row.gameBoard.assets!.transparent[this.color],
          this.drawX,
          this.drawY,
          tileSize,
          tileSize
        );
        break;
      case 'popping':
        context.drawImage(this.row.gameBoard.assets!.popped[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'popped':
        break;
      case 'bounce-low':
        context.drawImage(this.row.gameBoard.assets!.bounceLow[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'bounce-high':
        context.drawImage(
          this.row.gameBoard.assets!.bounceHigh[this.color],
          this.drawX,
          this.drawY,
          tileSize,
          tileSize
        );
        break;
      case 'bounce-mid':
        context.drawImage(this.row.gameBoard.assets!.bounceMid[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'regular':
        context.drawImage(this.row.gameBoard.assets!.regular[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;

      default:
        throw unreachable(this.drawType);
    }
  }

  drawX: number;
  drawY: number;

  get droppable() {
    return this.swappable || this.dropState === 'falling';
  }

  constructor(
    public row: TileRow,
    public color: TileColor,
    public swappable: boolean,
    public x: number,
    public y: number
  ) {
    this.drawX = this.x * tileSize;
    this.drawY = this.y * tileSize;
  }

  newX: number | undefined;
  newY: number | undefined;
  swapTickCount: number = 0;
  dropTickCount: number = 0;

  swap(newX: number) {
    if (!this.swappable) return;
    this.newX = newX;
    this.swappable = false;
    this.swapTickCount = AnimationConstants.swapTicks;
  }

  drawType:
    | 'regular'
    | 'matched'
    | 'matched-blink'
    | 'popping'
    | 'popped'
    | 'bounce-low'
    | 'bounce-high'
    | 'bounce-mid' = 'regular';

  drop(newY: number) {
    if (this.dropState === 'stalled') return;
    this.swappable = false;
    if (!this.dropState) {
      this.dropTickCount = AnimationConstants.dropStallTicks;
      this.dropState = 'stalled';
    } else {
      this.dropTickCount = 0;
      this.dropState = 'falling';
    }
    this.newY = newY;
  }

  tick() {
    this.drawX = this.x * tileSize;
    this.drawY = this.y * tileSize;
    if (this.swapTickCount > 0) {
      this.swapTickCount--;
      const swapPercent = 1 - this.swapTickCount / AnimationConstants.swapTicks;
      if (this.newX! > this.x) {
        this.drawX = this.x * tileSize + tileSize * swapPercent;
      } else {
        this.drawX = this.x * tileSize - tileSize * swapPercent;
      }
    } else if (this.swapTickCount === 0 && this.newX !== undefined) {
      if (this.x < this.newX) {
        const newCol = this.row.tiles[this.newX].color;
        this.row.tiles[this.newX].color = this.color;
        this.color = newCol;
      }
      this.newX = undefined;
      this.swappable = true;
    }

    if (this.dropBounceTick > 0) {
      this.dropBounceTick--;
    } else if (this.dropBounceTick === 0) {
      switch (this.dropBouncePhase) {
        case 'regular':
          this.dropBounceTick = AnimationConstants.dropBounceTicks;
          this.dropBouncePhase = 'low';
          this.drawType = 'bounce-low';
          break;
        case 'low':
          this.dropBounceTick = AnimationConstants.dropBounceTicks;
          this.dropBouncePhase = 'high';
          this.drawType = 'bounce-high';
          break;
        case 'high':
          this.dropBounceTick = AnimationConstants.dropBounceTicks;
          this.dropBouncePhase = 'mid';
          this.drawType = 'bounce-mid';
          break;
        case 'mid':
          this.dropBounceTick = 0;
          this.dropBouncePhase = undefined;
          this.drawType = 'regular';
          break;
      }
    }

    if (this.dropTickCount > 0) {
      this.dropTickCount--;
    } else if (this.dropTickCount === 0 && this.newY !== undefined) {
      const gameTile = this.row.gameBoard.rows[this.newY].tiles[this.x];
      if (this.row.gameBoard.rows[this.newY + 1].tiles[this.x].color !== 'empty') {
        gameTile.startBounce();
        gameTile.dropState = undefined;
      } else {
        gameTile.dropState = 'falling';
      }
      gameTile.color = this.color;
      this.dropState = undefined;
      this.color = 'empty';
      this.newY = undefined;
      this.swappable = true;
    }
  }

  pop() {
    this.swappable = false;
  }

  private startBounce() {
    this.dropBounceTick = 1;
    this.dropBouncePhase = 'regular';
  }
}
