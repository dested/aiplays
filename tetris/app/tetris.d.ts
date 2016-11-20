interface IGameInstance {
    moveLeft(): boolean;
    moveRight(): boolean;
    moveDown(): boolean;
    rotate(): boolean;
    getRotation(): PieceRotation;
}

declare enum PieceRotation{
    _0, _90, _180, _270
}

interface ITetrisAI {
    tick(): void;
}