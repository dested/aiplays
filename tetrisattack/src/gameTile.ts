import {TileRow} from './tileRow';
import {AnimationConstants, tileSize} from './store/game/gameInstance';
import {GameCanvas} from './gameCanvas';
import {PopAnimation} from './gameBoard';

export type TileColor = 'green' | 'purple' | 'red' | 'yellow' | 'teal' | 'blue' | 'empty';
export type TileColorWithoutEmpty = Exclude<TileColor, 'empty'>;

export class GameTile {
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
      case undefined:
        context.drawImage(this.row.gameBoard.assets!.regular[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
    }
  }

  drawX: number;
  drawY: number;

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

  drawType?: 'matched' | 'matched-blink' | 'popping' | 'popped';

  drop(newY: number) {
    this.newY = newY;
    this.swappable = false;
    this.dropTickCount = AnimationConstants.dropStallTicks;
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
    if (this.dropTickCount > 0) {
      this.dropTickCount--;
    } else if (this.dropTickCount === 0 && this.newY !== undefined) {
      this.row.gameBoard.rows[this.newY].tiles[this.x].color = this.color;
      this.color = 'empty';
      this.newY = undefined;
      this.swappable = true;
    }
  }

  pop() {
    this.swappable = false;
  }
}
