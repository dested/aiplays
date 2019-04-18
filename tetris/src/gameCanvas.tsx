import * as keyboardJS from 'keyboardjs';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {GameLogic} from './store/game/gameLogic';
import {gameStore} from './store/game/store';
import {MainStoreName, MainStoreProps} from './store/main/store';

interface Props extends MainStoreProps {}
interface State {}

@inject(MainStoreName)
@observer
export class GameCanvas extends React.Component<Props, State> {
  private canvas = React.createRef<HTMLCanvasElement>();
  private canvasContext: CanvasRenderingContext2D;

  static blockSize = 32;

  componentDidMount() {
    this.canvasContext = this.canvas.current.getContext('2d');

    this.canvas.current.width = (GameLogic.instance.boardWidth + 2) * GameCanvas.blockSize;
    this.canvas.current.height = (GameLogic.instance.boardHeight + 2) * GameCanvas.blockSize;
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

    this.canvasRender();
  }

  render() {
    return <canvas ref={this.canvas} />;
  }

  canvasRender() {
    this.canvasContext.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);

    const boardHeight = GameLogic.instance.boardHeight;
    const boardWidth = GameLogic.instance.boardWidth;
    const board = GameLogic.instance.board;

    for (let y = -1; y < boardHeight + 1; y++) {
      for (let x = -1; x < boardWidth + 1; x++) {
        let drawBlock = false;
        let color: string;
        if (x === -1 || x === boardWidth || y === -1 || y === boardHeight) {
          this.canvasContext.fillStyle = 'black';
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
          const blockSize = GameCanvas.blockSize;
          if (color == null) {
            this.canvasContext.fillRect((x + 1) * blockSize, (y + 1) * blockSize, blockSize, blockSize);
          } else {
            const colorPad = 5;
            this.canvasContext.fillStyle = GameCanvas.colorLuminance(color, -0.3);
            this.canvasContext.fillRect((x + 1) * blockSize, (y + 1) * blockSize, blockSize, blockSize);
            this.canvasContext.fillStyle = color;
            this.canvasContext.fillRect(
              (x + 1) * blockSize + colorPad,
              (y + 1) * blockSize + colorPad,
              blockSize - colorPad * 2,
              blockSize - colorPad * 2
            );
          }
          if (color == null) {
            this.canvasContext.strokeStyle = 'white';
          } else {
            this.canvasContext.strokeStyle = 'black';
          }
          this.canvasContext.strokeRect((x + 1) * blockSize, (y + 1) * blockSize, blockSize, blockSize);
        }
      }
    }

    window.requestAnimationFrame(() => this.canvasRender());
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
