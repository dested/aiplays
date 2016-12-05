interface IGameInstance {
    moveLeft(): boolean;
    isBlocked(x: number, y: number): boolean;
    isOnBoard(x: number, y: number): boolean;
    swap(): void;
    getPiece(index: number): IGamePiece;
    getSwap(): IGamePiece;
    moveRight(): boolean;
    moveDown(): boolean;
    rotate(): boolean;
    drop(): void;
    getRotation(): PieceRotation;
    getCurrentPiece(): IGamePiece;
    getPosition(): {x: number,y: number,width: number,height: number};
    boardHeight: number;
    boardWidth: number;

}
interface IGamePiece {
    slot: boolean[][];
    color: string;
}

declare enum PieceRotation{
    _0, _90, _180, _270
}

interface ITetrisAI {
    tick(): void;
}