import {AnimationConstants, tileSize} from './store/game/gameInstance';
import {unreachable} from './types/unreachable';
import {GameBoard} from './gameBoard';

export type TileColor = 'green' | 'purple' | 'red' | 'yellow' | 'teal' | 'blue';

export class GameTile {
  private dropBounceTick = 0;
  private dropBouncePhase?: 'regular' | 'low' | 'high' | 'mid';
  private dropState?: 'stalled' | 'falling';

  draw(context: CanvasRenderingContext2D) {
    switch (this.drawType) {
      case 'matched':
        context.drawImage(this.gameBoard.assets!.regular[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'matched-blink':
        context.fillStyle = '#D6D7D6';
        context.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        context.drawImage(this.gameBoard.assets!.transparent[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'popping':
        context.drawImage(this.gameBoard.assets!.popped[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'popped':
        break;
      case 'bounce-low':
        context.drawImage(this.gameBoard.assets!.bounceLow[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'bounce-high':
        context.drawImage(this.gameBoard.assets!.bounceHigh[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'bounce-mid':
        context.drawImage(this.gameBoard.assets!.bounceMid[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'regular':
        context.drawImage(this.gameBoard.assets!.regular[this.color], this.drawX, this.drawY, tileSize, tileSize);
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
    public gameBoard: GameBoard,
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
      this.x = this.newX;
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
      if (this.gameBoard.getTile(this.x, this.newY + 1) !== undefined) {
        this.startBounce();
        this.dropState = undefined;
      } else {
        this.dropState = 'falling';
      }
      this.y = this.newY;
      this.dropState = undefined;
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
