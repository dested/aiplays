export class TetrisAI {
    constructor(private game: IGameInstance) {
    }
    tick() {
        console.clear();
        for (let y = this.game.boardHeight-1; y >=0; y--) {
            for (let x = 0; x < this.game.boardWidth; x++) {
                if (!this.game.isBlocked(x, y)) {
                    this.moveTowards(x, y);
                    return;
                }
            }
        }
    }
    moveTowards(x: number, y: number) {
        var position=this.game.getPosition();

        console.log(x, y,position.x,position.y);
        if (x == position.x) {
            this.game.drop();
            return;
        }

        if (x < position.x) {
            this.game.moveLeft();
        } else if (x > position.x) {
            this.game.moveRight();
        }
    }
}