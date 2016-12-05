export class TetrisAI {
    constructor(private game: IGameInstance) {
    }
    tick() {
        console.clear();
        for (let y = this.game.boardHeight - 1; y >= 0; y--) {
            for (let x = 0; x < this.game.boardWidth; x++) {
                let bad=false;

                !this.testPiece(this.game.getCurrentPiece(), x, y) &&
                this.game.rotate() &&
                !this.testPiece(this.game.getCurrentPiece(), x, y) &&
                this.game.rotate() &&
                !this.testPiece(this.game.getCurrentPiece(), x, y) &&
                this.game.rotate() &&
                !this.testPiece(this.game.getCurrentPiece(), x, y) &&
                this.game.rotate() &&
                (bad=true);
                if (!bad) return;

            }
        }
    }

    testPiece(piece: IGamePiece, x: number, y: number) {
        if (this.pieceFits(piece, x, y)) {
            let blocked = false;
            for (let _y = y - 1; _y >= 0; _y--) {
                if (!this.pieceFits(piece, x, _y)) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked) {
                this.moveTowards(x, y);
                return true;
            }
        }
        return false;
    }

    pieceFits(piece: IGamePiece, x: number, y: number) {
        for (let px = 0; px < piece.slot.length; px++) {
            for (let py = 0; py < piece.slot[px].length; py++) {
                if (piece.slot[px][py]) {
                    if (!this.game.isOnBoard(x + px, y + py) || this.game.isBlocked(x + px, y + py)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    moveTowards(x: number, y: number) {
        var position = this.game.getPosition();
        console.log(x, y, position.x, position.y);
        debugger;        if (x == position.x) {
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