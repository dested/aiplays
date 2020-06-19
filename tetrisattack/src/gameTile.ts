import {tileSize} from './store/game/gameInstance';
import {unreachable} from './types/unreachable';
import {GameBoard} from './gameBoard';

export type TileColor = 'green' | 'purple' | 'red' | 'yellow' | 'teal' | 'blue';

export class GameTile {
  draw(context: CanvasRenderingContext2D) {
    switch (this.drawType) {
      case 'matched':
        context.drawImage(this.gameBoard.assets!.block.regular[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'matched-blink':
        context.fillStyle = '#D6D7D6';
        context.fillRect(this.drawX, this.drawY, tileSize, tileSize);
        context.drawImage(
          this.gameBoard.assets!.block.transparent[this.color],
          this.drawX,
          this.drawY,
          tileSize,
          tileSize
        );
        break;
      case 'popping':
        context.drawImage(this.gameBoard.assets!.block.popped[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;
      case 'popped':
        break;
      case 'bounce-low':
        context.drawImage(
          this.gameBoard.assets!.block.bounceLow[this.color],
          this.drawX,
          this.drawY,
          tileSize,
          tileSize
        );
        break;
      case 'bounce-high':
        context.drawImage(
          this.gameBoard.assets!.block.bounceHigh[this.color],
          this.drawX,
          this.drawY,
          tileSize,
          tileSize
        );
        break;
      case 'bounce-mid':
        context.drawImage(
          this.gameBoard.assets!.block.bounceMid[this.color],
          this.drawX,
          this.drawY,
          tileSize,
          tileSize
        );
        break;
      case 'regular':
        context.drawImage(this.gameBoard.assets!.block.regular[this.color], this.drawX, this.drawY, tileSize, tileSize);
        break;

      default:
        throw unreachable(this.drawType);
    }
  }

  drawX: number;
  drawY: number;

  /* get droppable() {
    return this.swappable || this.dropState === 'falling';
  }*/

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

  setX(x: number) {
    this.x = x;
    this.drawX = this.x * tileSize;
  }
  setY(y: number) {
    this.y = y;
    this.drawY = this.y * tileSize;
  }

  setSwappable(swappable: boolean) {
    this.swappable = swappable;
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

  tick() {}

  pop() {
    this.swappable = false;
  }
}
