import {boardWidth} from './store/game/gameInstance';
import {randomElement} from './utilts';
import {GameBoard} from './gameBoard';
import {GameTile} from './gameTile';

export const GameTiles: GameTile['color'][] = ['red', 'blue', 'yellow', 'teal', 'purple'];

export class TileRow {
  tiles: GameTile[] = [];
  active: boolean = false;

  constructor(public gameBoard: GameBoard, public y: number) {
    for (let x = 0; x < boardWidth; x++) {
      this.tiles[x] = new GameTile(this, 'empty', true, x, y);
    }
  }

  fillRandom() {
    for (let x = 0; x < boardWidth; x++) {
      this.tiles[x].color = randomElement(GameTiles);
    }
  }

  clone(gameBoard: GameBoard): TileRow {
    const row = new TileRow(gameBoard, this.y);
    for (let x = 0; x < this.tiles.length; x++) {
      const tile = this.tiles[x];
      row.tiles[x] = tile;
    }
    return row;
  }

  isEmpty() {
    for (const tile of this.tiles) {
      if (tile.color !== 'empty') {
        return false;
      }
    }
    return true;
  }

  tick() {
    for (const tile of this.tiles) {
      tile.tick();
    }
  }

  swap(x: number): boolean {
    if (this.tiles[x].swappable && this.tiles[x + 1].swappable) {
      this.tiles[x].swap(x + 1);
      this.tiles[x + 1].swap(x);
      return true;
    }
    return false;
  }
}
