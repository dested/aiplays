export class GameCanvas {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private blockSize = 32;
    private boardWidth = 10;
    private boardHeight = 22;
    private board: GameBoard;

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById('board');
        this.context = this.canvas.getContext("2d");

        this.canvas.width = (this.boardWidth + 2) * this.blockSize;
        this.canvas.height = (this.boardHeight + 2) * this.blockSize;
        this.board = new GameBoard();
        this.board.currentPiece = GamePiece.pieces[(Math.random() * GamePiece.pieces.length) | 0];

        this.board.currentPosition.x = 5;
        this.board.currentPosition.y = 0;

        setInterval(() => {
            this.tick();
        }, 100);


        this.render();


    }

    private tick() {
        this.board.currentPosition.y++;

        if (this.collides()) {
            this.board.currentPosition.y--;

            for (let y = -1; y < this.boardHeight + 1; y++) {
                for (let x = -1; x < this.boardWidth + 1; x++) {
                    if (this.board.currentPiece) {
                        if (this.board.currentPiece.slot[this.board.currentPosition.x - x] &&
                            this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y]) {

                            let slot = this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y];
                            this.board.slots[x][y] = slot;
                        }
                    }
                }
            }


            this.board.currentPiece = GamePiece.pieces[(Math.random() * GamePiece.pieces.length) | 0];
            this.board.currentPosition.x = 5;
            this.board.currentPosition.y = 0;
        }
    }

    private collides() {
        for (let y = -1; y < this.boardHeight + 1; y++) {
            for (let x = -1; x < this.boardWidth + 1; x++) {
                let solid = false;
                if (y === this.boardHeight) {
                    solid = true;
                }
                if (this.board.slots[x] && (this.board.slots[x][y])) {
                    solid = true;
                }

                if (this.board.currentPiece) {

                    if (this.board.currentPiece.slot[this.board.currentPosition.x - x] &&
                        this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y]) {
                        if (solid) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = -1; y < this.boardHeight + 1; y++) {
            for (let x = -1; x < this.boardWidth + 1; x++) {
                let drawBlock = false;
                let color: string;
                if (x === -1 || x === this.boardWidth || y === -1 || y === this.boardHeight) {
                    this.context.fillStyle = 'black';
                    drawBlock = true;
                } else {
                    let slot: GameSlot;
                    if (this.board.slots[x] && (slot = this.board.slots[x][y])) {
                        color = slot.color;
                        drawBlock = true;
                    }

                    if (this.board.currentPiece) {
                        if (this.board.currentPiece.slot[this.board.currentPosition.x - x] &&
                            this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y]) {
                            slot = this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y];
                            color = slot.color;
                            drawBlock = true;
                        }
                    }
                }


                if (drawBlock) {
                    if (color == null) {
                        this.context.fillRect((x + 1) * this.blockSize, (y + 1) * this.blockSize, this.blockSize, this.blockSize);
                    }
                    else {
                        this.context.fillStyle = 'white';
                        this.context.fillRect((x + 1) * this.blockSize, (y + 1) * this.blockSize, this.blockSize, this.blockSize);
                        this.context.fillStyle = color;
                        this.context.fillRect((x + 1) * this.blockSize + 5, (y + 1) * this.blockSize + 5, this.blockSize - 10, this.blockSize - 10);

                    }
                    if (color == null) {
                        this.context.strokeStyle = 'white';
                    } else {
                        this.context.strokeStyle = 'black';
                    }
                    this.context.strokeRect((x + 1) * this.blockSize, (y + 1) * this.blockSize, this.blockSize, this.blockSize);
                }
            }
        }


        window.requestAnimationFrame(() => this.render());
    }

}

export class GameBoard {
    constructor() {
        this.slots = [];
        for (let x = 0; x < 10; x++) {
            this.slots[x] = [];
            for (let y = 0; y < 22; y++) {
                this.slots[x][y] = null;
            }
        }
    }

    slots: GameSlot[][];
    currentPiece: GamePiece;
    currentPosition: {x: number,y: number} = {x: 0, y: 0};
}

export class GameSlot {
    constructor(public color: string) {
    }
}
export class GamePiece {
    static pieces: GamePiece[] = [
        new GamePiece([
            [null, new GameSlot('red'), null, null],
            [null, new GameSlot('red'), null, null],
            [null, new GameSlot('red'), null, null],
            [null, new GameSlot('red'), new GameSlot('red'), null],
        ]),
        new GamePiece([
            [null, null, null, null],
            [null, new GameSlot('blue'), new GameSlot('blue'), null],
            [null, new GameSlot('blue'), new GameSlot('blue'), null],
            [null, null, null, null],
        ]),
        new GamePiece([
            [null, null, null, null],
            [new GameSlot('green'), new GameSlot('green'), null],
            [null, new GameSlot('green'), new GameSlot('green'), null],
            [null, null, null, null],
        ]),
        new GamePiece([
            [null, null, null, null],
            [null, new GameSlot('yellow'), new GameSlot('yellow'), null],
            [null, null, new GameSlot('yellow'), new GameSlot('yellow')],
            [null, null, null, null],
        ]),
        new GamePiece([
            [new GameSlot('purple'), null, null, null],
            [new GameSlot('purple'), null, null, null],
            [new GameSlot('purple'), null, null, null],
            [new GameSlot('purple'), null, null, null],
        ]),
        new GamePiece([
            [new GameSlot('pink'), new GameSlot('pink'), new GameSlot('pink'), null],
            [null, new GameSlot('pink'), null, null],
            [null, null, null, null],
            [null, null, null, null],
        ])

    ];

    constructor(slot: GameSlot[][]) {
        this.slot = slot;
    }

    slot: GameSlot[][];
}
