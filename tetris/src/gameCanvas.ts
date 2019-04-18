import * as keyboardJS from 'keyboardjs';
import {GameLogic} from './store/game/gameLogic';
import {gameStore} from './store/game/store';
declare var exports: any;

export class GameCanvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private blockSize = 32;

  constructor() {
    this.canvas = document.getElementById('board') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');

    this.canvas.width = (GameLogic.instance.boardWidth + 2) * this.blockSize;
    this.canvas.height = (GameLogic.instance.boardHeight + 2) * this.blockSize;
    GameLogic.instance.reset();

    let leftDown = false;
    let rightDown = false;
    let downDown = false;
    let upDown = false;
    let enterDown = false;

    keyboardJS.bind(
      'left',
      () => {
        if (leftDown) {
          return;
        }
        leftDown = true;
        GameLogic.instance.moveLeft();
      },
      () => (leftDown = false)
    );

    keyboardJS.bind(
      'right',
      () => {
        if (rightDown) {
          return;
        }
        rightDown = true;
        GameLogic.instance.moveRight();
      },
      () => (rightDown = false)
    );

    keyboardJS.bind(
      'enter',
      () => {
        if (downDown) {
          return;
        }
        downDown = true;
        GameLogic.instance.newPiece(true);
      },
      () => (downDown = false)
    );

    keyboardJS.bind(
      'down',
      () => {
        if (upDown) {
          return;
        }
        upDown = true;
        GameLogic.instance.moveDown();
      },
      () => (upDown = false)
    );
    keyboardJS.bind(
      'up',
      () => {
        if (enterDown) {
          return;
        }
        enterDown = true;
        GameLogic.instance.rotate();
      },
      () => (enterDown = false)
    );

    const tetrisTickDuration = 10;
    setInterval(() => {
      GameLogic.instance.tick();
    }, tetrisTickDuration);

    setInterval(() => {
      if (gameStore.aiScript) {
        gameStore.aiScript.tick();
      }
    }, tetrisTickDuration / 5);

    this.render();
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const boardHeight = GameLogic.instance.boardHeight;
    const boardWidth = GameLogic.instance.boardWidth;
    const board = GameLogic.instance.board;

    for (let y = -1; y < boardHeight + 1; y++) {
      for (let x = -1; x < boardWidth + 1; x++) {
        let drawBlock = false;
        let color: string;
        if (x === -1 || x === boardWidth || y === -1 || y === boardHeight) {
          this.context.fillStyle = 'black';
          drawBlock = true;
        } else {
          let slot: GameSlot;
          if (board.slots[x] && (slot = board.slots[x][y])) {
            color = slot.color;
            drawBlock = true;
          }

          if (board.currentPiece) {
            if (
              board.currentPiece.slot[board.currentPosition.x - x] &&
              board.currentPiece.slot[board.currentPosition.x - x][board.currentPosition.y - y]
            ) {
              slot = board.currentPiece.gameSlot;
              color = slot.color;
              drawBlock = true;
            }
          }
        }

        if (drawBlock) {
          if (color == null) {
            this.context.fillRect((x + 1) * this.blockSize, (y + 1) * this.blockSize, this.blockSize, this.blockSize);
          } else {
            const colorPad = 5;
            this.context.fillStyle = GameCanvas.colorLuminance(color, -0.3);
            this.context.fillRect((x + 1) * this.blockSize, (y + 1) * this.blockSize, this.blockSize, this.blockSize);
            this.context.fillStyle = color;
            this.context.fillRect(
              (x + 1) * this.blockSize + colorPad,
              (y + 1) * this.blockSize + colorPad,
              this.blockSize - colorPad * 2,
              this.blockSize - colorPad * 2
            );
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

  private static colorLuminance(hex: string, lum: number) {
    // validate hex string
    hex = hex.replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    let rgb = '#';
    for (let i = 0; i < 3; i++) {
      const c = parseInt(hex.substr(i * 2, 2), 16);
      const cStr = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ('00' + cStr).substr(cStr.length);
    }

    return rgb;
  }
}

export class GameBoard {
  bagPiece: number = 6;
  swapPiece: GamePiece;

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
  currentPieces: GamePiece[] = [];

  get currentPiece(): GamePiece {
    return this.currentPieces[this.bagPiece];
  }

  set currentPiece(value: GamePiece) {
    this.currentPieces[this.bagPiece] = value;
  }

  currentPosition: {x: number; y: number} = {x: 0, y: 0};
}

export class GameSlot {
  constructor(public color: string) {}
}

export class GamePiece implements IGamePiece {
  static pieces: GamePiece[] = [
    new GamePiece(new GameSlot('#FFD800'), [
      // orange L
      GamePiece.flip([[!!0, !!0, !!1], [!!1, !!1, !!1], [!!0, !!0, !!0]]),
      GamePiece.flip([[!!0, !!1, !!0], [!!0, !!1, !!0], [!!0, !!1, !!1]]),
      GamePiece.flip([[!!0, !!0, !!0], [!!1, !!1, !!1], [!!1, !!0, !!0]]),
      GamePiece.flip([[!!1, !!1, !!0], [!!0, !!1, !!0], [!!0, !!1, !!0]]),
    ]),
    new GamePiece(new GameSlot('#0026FF'), [
      // blue L
      GamePiece.flip([[!!1, !!0, !!0], [!!1, !!1, !!1], [!!0, !!0, !!0]]),
      GamePiece.flip([[!!0, !!1, !!1], [!!0, !!1, !!0], [!!0, !!1, !!0]]),
      GamePiece.flip([[!!0, !!0, !!0], [!!1, !!1, !!1], [!!0, !!0, !!1]]),
      GamePiece.flip([[!!0, !!1, !!0], [!!0, !!1, !!0], [!!1, !!1, !!0]]),
    ]),
    new GamePiece(new GameSlot('#FFE97F'), [
      // yellow square
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
    ]),
    new GamePiece(new GameSlot('#00FF21'), [
      // green s
      GamePiece.flip([[!!0, !!1, !!1], [!!1, !!1, !!0], [!!0, !!0, !!0]]),
      GamePiece.flip([[!!0, !!1, !!0], [!!0, !!1, !!1], [!!0, !!0, !!1]]),
      GamePiece.flip([[!!0, !!0, !!0], [!!0, !!1, !!1], [!!1, !!1, !!0]]),
      GamePiece.flip([[!!1, !!0, !!0], [!!1, !!1, !!0], [!!0, !!1, !!0]]),
    ]),
    new GamePiece(new GameSlot('#FF0000'), [
      // red s
      GamePiece.flip([[!!1, !!1, !!0], [!!0, !!1, !!1], [!!0, !!0, !!0]]),
      GamePiece.flip([[!!0, !!0, !!1], [!!0, !!1, !!1], [!!0, !!1, !!0]]),
      GamePiece.flip([[!!0, !!0, !!0], [!!1, !!1, !!0], [!!0, !!1, !!1]]),
      GamePiece.flip([[!!1, !!0, !!0], [!!1, !!1, !!0], [!!0, !!1, !!0]]),
    ]),
    new GamePiece(new GameSlot('#00FFFF'), [
      // cyan l
      GamePiece.flip([[!!0, !!0, !!0, !!0], [!!1, !!1, !!1, !!1], [!!0, !!0, !!0, !!0], [!!0, !!0, !!0, !!0]]),
      GamePiece.flip([[!!0, !!0, !!1, !!0], [!!0, !!0, !!1, !!0], [!!0, !!0, !!1, !!0], [!!0, !!0, !!1, !!0]]),
      GamePiece.flip([[!!0, !!0, !!0, !!0], [!!0, !!0, !!0, !!0], [!!1, !!1, !!1, !!1], [!!0, !!0, !!0, !!0]]),
      GamePiece.flip([[!!0, !!1, !!0, !!0], [!!0, !!1, !!0, !!0], [!!0, !!1, !!0, !!0], [!!0, !!1, !!0, !!0]]),
    ]),
    new GamePiece(new GameSlot('#B200FF'), [
      // purple t
      GamePiece.flip([[!!0, !!1, !!0], [!!1, !!1, !!1], [!!0, !!0, !!0]]),
      GamePiece.flip([[!!0, !!1, !!0], [!!0, !!1, !!1], [!!0, !!1, !!0]]),
      GamePiece.flip([[!!0, !!0, !!0], [!!1, !!1, !!1], [!!0, !!1, !!0]]),
      GamePiece.flip([[!!0, !!1, !!0], [!!1, !!1, !!0], [!!0, !!1, !!0]]),
    ]),
  ];

  private static flip(box: boolean[][]): boolean[][] {
    const bbox: boolean[][] = [];
    for (let x = 0; x < box.length; x++) {
      bbox[x] = [];
    }

    for (let x = 0; x < box.length; x++) {
      for (let y = 0; y < box[x].length; y++) {
        bbox[x][y] = box[y][x];
      }
    }
    return bbox;
  }

  currentSlot: number = 0;

  constructor(public gameSlot: GameSlot, public slots: boolean[][][]) {}

  get slot(): boolean[][] {
    return this.slots[this.currentSlot];
  }

  set slot(piece: boolean[][]) {
    throw new Error('Cannot set slot.');
  }

  get color(): string {
    return this.gameSlot.color;
  }

  set color(color: string) {
    throw new Error('Cannot set color.');
  }
}
