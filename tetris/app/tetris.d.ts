interface GameInstance {
    moveLeft(): boolean;
    moveRight(): boolean;
    moveDown(): boolean;
    rotate(): boolean;
    getRotation(): PieceRotation;
}

declare enum PieceRotation{
    _0, _90, _180, _270
}

declare module "game" {
    export = Game;
}
declare var Game: GameInstance;

