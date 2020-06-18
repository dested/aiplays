import {TileRow} from './tileRow';
import {AnimationConstants, tileSize} from './store/game/gameInstance';
import {GameCanvas} from './gameCanvas';

export class GameTile {
  draw(context: CanvasRenderingContext2D) {
    let color: string;
    switch (this.color) {
      case 'red':
        color = '#ff0000';
        break;
      case 'blue':
        color = '#1900ff';
        break;
      case 'yellow':
        color = '#ffea00';
        break;
      case 'teal':
        color = '#2ee5c2';
        break;
      case 'purple':
        color = '#3816a9';
        break;
      case 'empty':
        return;
    }
    const colorPad = 5;

    switch (this.drawType) {
      case 'matched':
        context.fillStyle = GameCanvas.colorLuminance(color, 0.2);
        context.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        context.fillStyle = color;
        context.fillRect(
          this.drawX + colorPad,
          this.drawY + colorPad,
          tileSize - colorPad * 2,
          tileSize - colorPad * 2
        );
        context.strokeStyle = 'black';
        context.strokeRect(this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'matched-blink':
        context.fillStyle = GameCanvas.colorLuminance(color, 0.7);
        context.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        context.fillStyle = color;
        context.fillRect(
          this.drawX + colorPad,
          this.drawY + colorPad,
          tileSize - colorPad * 2,
          tileSize - colorPad * 2
        );
        context.strokeStyle = 'white';
        context.strokeRect(this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'pop':
        context.fillStyle = GameCanvas.colorLuminance(color, 0.7);
        context.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        context.fillStyle = color;
        context.fillRect(
          this.drawX + colorPad * 2,
          this.drawY + colorPad * 2,
          tileSize - colorPad * 2 * 2,
          tileSize - colorPad * 2 * 2
        );
        context.strokeStyle = 'white';
        context.strokeRect(this.drawX, this.drawY, tileSize, tileSize);
        break;
      case undefined:
        context.fillStyle = GameCanvas.colorLuminance(color, 0.3);
        context.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        context.fillStyle = color;
        context.fillRect(
          this.drawX + colorPad,
          this.drawY + colorPad,
          tileSize - colorPad * 2,
          tileSize - colorPad * 2
        );
        context.strokeStyle = 'black';
        context.strokeRect(this.drawX, this.drawY, tileSize, tileSize);
        break;
    }
  }

  drawX: number;
  drawY: number;

  constructor(
    public row: TileRow,
    public color: 'red' | 'blue' | 'yellow' | 'teal' | 'purple' | 'empty',
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

  private matchTimer: number = 0;
  matchPhase?: 'blink' | 'solid' | 'pop' | 'postPop';
  drawType?: 'matched' | 'matched-blink' | 'pop';

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

    switch (this.matchPhase) {
      case 'blink':
        if (this.matchTimer > 0) {
          this.matchTimer--;
          this.drawType = this.matchTimer % 2 === 0 ? 'matched-blink' : 'matched';
        } else {
          this.matchPhase = 'solid';
          this.matchTimer = AnimationConstants.matchSolidTicks;
        }
        break;
      case 'solid':
        if (this.matchTimer > 0) {
          this.drawType = 'matched';
          this.matchTimer--;
        } else {
          this.matchPhase = 'pop';
          this.matchTimer = AnimationConstants.matchPopTicksEach;
        }
        break;
      case 'pop':
        if (this.matchTimer > 0) {
          this.drawType = 'pop';
          this.matchTimer--;
        } else {
          this.matchPhase = 'postPop';
          this.matchTimer = AnimationConstants.matchPostPopTicks;
        }
        break;
      case 'postPop':
        if (this.matchTimer > 0) {
          this.drawType = 'matched';
          this.matchTimer--;
        } else {
          this.matchPhase = undefined;
          this.drawType = undefined;
          this.color = 'empty';
          this.swappable = true;
        }
        break;
      case undefined:
        break;
    }
  }

  pop() {
    this.matchPhase = 'blink';
    this.matchTimer = AnimationConstants.matchBlinkTicks;
    this.swappable = false;
  }
}
