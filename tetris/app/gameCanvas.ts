declare var require;

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
        this.reset();

        require(['libs/keyboard.js'], (keyboardJS) => {
            keyboardJS.bind('left', (e) => {
                this.board.currentPosition.x--;
                if (this.collidesWalls()) {
                    this.board.currentPosition.x++;
                }
                else {
                    this.checkCollision(() => {
                        this.board.currentPosition.x++;
                    });
                }
            });

            keyboardJS.bind('right', (e) => {
                this.board.currentPosition.x++;
                if (this.collidesWalls()) {
                    this.board.currentPosition.x--;
                } else {
                    this.checkCollision(() => {
                        this.board.currentPosition.x--;
                    });
                }
            });

            keyboardJS.bind('down', (e) => {
                this.board.currentPosition.y++;
                this.checkCollision(() => {
                    this.board.currentPosition.y--;
                });
            });
            keyboardJS.bind('up', (e) => {
                let origSlot = this.board.currentPiece.currentSlot;
                this.board.currentPiece.currentSlot = (this.board.currentPiece.currentSlot + 1) % 4;
                if (this.collidesWalls()) {
                    this.board.currentPiece.currentSlot = origSlot;
                }
                this.checkCollision(() => {
                    this.board.currentPiece.currentSlot = origSlot;
                });
            });
        });


        setInterval(() => {
            this.tick();
        }, 500);


        this.render();


    }

    private reset() {
        this.board = new GameBoard();
        this.newPiece();
    }

    private tick() {
        this.board.currentPosition.y++;

        this.checkCollision(() => {
            this.board.currentPosition.y--;
        });
    }

    private checkCollision(undoMove: ()=>void) {
        if (this.collides()) {
            undoMove();
            for (let y = -1; y < this.boardHeight + 1; y++) {
                for (let x = -1; x < this.boardWidth + 1; x++) {
                    if (this.board.currentPiece) {
                        if (this.board.currentPiece.slot[this.board.currentPosition.x - x] &&
                            this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y]) {
                            this.board.slots[x][y] = this.board.currentPiece.gameSlot;
                        }
                    }
                }
            }


            this.newPiece();
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


    private collidesWalls() {
        for (let y = -1; y < this.boardHeight + 1; y++) {
            for (let x = -1; x < this.boardWidth + 1; x++) {
                let solid = false;
                if (x === -1 || x === this.boardWidth) {
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

    private newPiece() {

        for (let y = this.boardHeight - 1; y >= 0; y--) {
            let bad = false;
            for (let x = 0; x < this.boardWidth; x++) {
                if (!this.board.slots[x][y]) {
                    bad = true;
                    break;
                }
            }
            if (!bad) {
                for (let _y = y; _y > 0; _y--) {
                    for (let x = 0; x < this.boardWidth; x++) {
                        this.board.slots[x][_y] = this.board.slots[x][_y - 1];
                    }
                }
                y++;
            }
        }

        this.board.currentPiece = GamePiece.pieces[(Math.random() * GamePiece.pieces.length) | 0];
        this.board.currentPiece.currentSlot = 0;
        this.board.currentPosition.x = 5;
        this.board.currentPosition.y = 0;
        if (this.collides()) {
            this.reset();
        }
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
                            slot = this.board.currentPiece.gameSlot;
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
                        this.context.fillRect((x + 1) * this.blockSize + 2, (y + 1) * this.blockSize + 2, this.blockSize - 4, this.blockSize - 4);

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
        new GamePiece(new GameSlot('orange'), [
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ], [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1],
            ], [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0],
            ], [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0],
            ]
        ]),
        new GamePiece(new GameSlot('blue'), [
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ], [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0],
            ], [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1],
            ], [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0],
            ]
        ]),
        new GamePiece(new GameSlot('yellow'), [
            [
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ], [
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ], [
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ], [
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        ]),
        new GamePiece(new GameSlot('green'), [
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ], [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1],
            ], [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0],
            ], [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
            ]
        ]),
        new GamePiece(new GameSlot('red'), [
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ], [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0],
            ], [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
            ], [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
            ]
        ]),
        new GamePiece(new GameSlot('cyan'), [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ], [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ], [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
            ], [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ]
        ])
        ,
        new GamePiece(new GameSlot('purple'), [
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ], [
                [0, 1, 0],
                [0, 1, 1],
                [0, 1, 0],
            ], [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ], [
                [0, 1, 0],
                [1, 1, 0],
                [0, 1, 0],
            ]
        ])

    ];

    constructor(public gameSlot: GameSlot, public slots: number[][][]) {
    }

    public currentSlot: number = 0;

    public get slot() {
        return this.slots[this.currentSlot];
    }

}
