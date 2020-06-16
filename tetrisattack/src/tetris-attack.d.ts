import {AnimationConstants, blockSize} from './store/game/gameInstance';
import {TileRow} from './tileRow';


export interface IGameInstance {
  clone(): IGameInstance;
  moveLeft(): boolean;
  moveRight(): boolean;
  moveDown(): boolean;
  moveUp(): boolean;
  swap(): boolean;
  getCursorPosition(): {x: number; y: number};
  getTiles(x: number, y: number): [GameTile?, GameTile?];
}

export interface ITetrisAttackAI {
  tick(): void;
}
