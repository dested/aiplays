interface IGameInstance {
    moveLeft(): boolean;
    moveRight(): boolean;
    moveDown(): boolean;
    rotate(): boolean;
    getRotation(): PieceRotation;
    isBlocked(x: number, y: number): boolean ;
    getPiece(index: number): IGamePiece ;
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