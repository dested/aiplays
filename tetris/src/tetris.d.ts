import {GamePieceData, GamePieceInstance} from './gameCanvas';

interface IGameInstance {
  clone(): IGameInstance;
  moveLeft(): boolean;
  isBlocked(x: number, y: number, includeCurrentPiece?: boolean): boolean;
  isOnBoard(x: number, y: number): boolean;
  swap(): void;
  getPiece(index: number): IGamePieceInstance;
  getSwap(): IGamePieceInstance;
  moveRight(): boolean;
  moveDown(): boolean;
  rotatePiece(): boolean;
  drop(): void;
  getRotation(): PieceRotation;
  getCurrentPiece(): IGamePieceInstance;
  getPosition(): {x: number; y: number; width: number; height: number};
  boardHeight: number;
  boardWidth: number;
}

interface IGamePieceInstance {
  x: number;
  y: number;
  rotation: PieceRotation;
  piece: GamePieceData;
  slot: boolean[][];

  canMoveDown(): boolean;
  canMoveLeft(): boolean;
  canMoveRight(): boolean;
  canRotate(): boolean;

  moveDown(): boolean;
  moveLeft(): boolean;
  moveRight(): boolean;
  rotatePiece(): boolean;
}

declare enum PieceRotation {
  _0 = 0,
  _90 = 1,
  _180 = 2,
  _270 = 3,
}

interface ITetrisAI {
  tick(): void;
}
