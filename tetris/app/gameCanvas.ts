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
        this.board.slots[4][3] = new GameSlot('red');
        this.board.slots[4][4] = new GameSlot('red');
        this.board.slots[4][5] = new GameSlot('red');
        this.board.slots[5][5] = new GameSlot('red');


        this.tick();
        this.render();


    }

    private tick() {

    }

    private render() {

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
}

export class GameSlot {
    constructor(public color: string) {
    }
}