export class GameBoard {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private blockSize = 64;
    private boardWidth = 8;
    private boardHeight = 10;

    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById('board');
        this.context = this.canvas.getContext("2d");

        this.canvas.width = (this.boardWidth + 2) * this.blockSize;
        this.canvas.height = (this.boardHeight + 2) * this.blockSize;
        this.tick();
        this.render();
    }

    private tick() {

    }

    private render() {

        for (let y = 0; y < this.boardHeight + 2; y++) {
            for (let x = 0; x < this.boardWidth + 2; x++) {
                let drawBlock = false;
                if (x === 0 || x === this.boardWidth + 1 || y === 0 || y === this.boardHeight + 1) {
                    this.context.fillStyle = 'black';
                    drawBlock=true;
                }

                if (drawBlock) {
                    this.context.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                }
            }
        }


        window.requestAnimationFrame(() => this.render());
    }
}