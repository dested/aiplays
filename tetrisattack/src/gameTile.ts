import {TileRow} from './tileRow';
import {AnimationConstants, blockSize} from './store/game/gameInstance';

export class GameTile {
  drawX: number;
  drawY: number;

  constructor(
    public row: TileRow,
    public color: 'red' | 'blue' | 'yellow' | 'teal' | 'purple' | 'empty',
    public swappable: boolean,
    public x: number,
    public y: number
  ) {
    this.drawX = this.x * blockSize;
    this.drawY = this.y * blockSize;
  }

  newX: number | undefined;
  swapTickCount: number = 0;

  swap(newX: number) {
    if (!this.swappable) return;
    this.newX = newX;
    this.swappable = false;
    this.swapTickCount = AnimationConstants.swapTicks;
  }

  tick() {
    if (this.swapTickCount > 0) {
      this.swapTickCount--;
      const swapPercent = 1 - this.swapTickCount / AnimationConstants.swapTicks;
      if (this.newX! > this.x) {
        this.drawX = this.x * blockSize + blockSize * swapPercent;
      } else {
        this.drawX = this.x * blockSize - blockSize * swapPercent;
      }
    }
    if (this.swapTickCount === 0 && this.newX !== undefined) {
      this.row.tiles[this.newX] = this;
      this.x = this.newX;
      this.drawX = this.x * blockSize;
      this.newX = undefined;
      this.swappable = true;
    }
  }
}
