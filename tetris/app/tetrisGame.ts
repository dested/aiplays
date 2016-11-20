export class TetrisAI {
    constructor(private game: IGameInstance) {
    }
    tick() {
        this.game.moveLeft();
    }
}