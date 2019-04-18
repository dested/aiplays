import * as keyboardJS from 'keyboardjs';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {GameInstance} from './store/game/gameInstance';
import {gameStore} from './store/game/store';
import {MainStoreName, MainStoreProps} from './store/main/store';
import {IGameInstance, IGamePieceInstance, PieceRotation} from './tetris';

interface Props extends MainStoreProps {}
interface State {
  isSlow: boolean;
}

@inject(MainStoreName)
@observer
export class GameCanvas extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {isSlow: true};
  }

  private canvas = React.createRef<HTMLCanvasElement>();
  private canvasContext: CanvasRenderingContext2D;

  static blockSize = 32;

  componentDidMount() {
    this.canvasContext = this.canvas.current.getContext('2d');

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
        GameInstance.mainInstance.moveLeft();
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
        GameInstance.mainInstance.moveRight();
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
        GameInstance.mainInstance.newPiece(true);
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
        GameInstance.mainInstance.moveDown();
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
        GameInstance.mainInstance.rotatePiece();
      },
      () => (enterDown = false)
    );
    this.toggleSpeed();
    this.canvasRender();
  }

  logicInterval: any;
  scriptInterval: any;
  toggleSpeed = () => {
    clearInterval(this.logicInterval);
    clearInterval(this.scriptInterval);
    this.setState({isSlow: !this.state.isSlow});
    const tetrisTickDuration = this.state.isSlow ? 5000 : 100;
    this.logicInterval = setInterval(() => {
      GameInstance.mainInstance.tick();
    }, tetrisTickDuration);

    this.scriptInterval = setInterval(() => {
      if (gameStore.aiScript) {
        gameStore.aiScript.tick();
      }
    }, tetrisTickDuration / 5);
  };

  render() {
    return (
      <>
        <button
          onClick={this.toggleSpeed}
          style={{
            border: 0,
            backgroundColor: this.state.isSlow ? 'red' : 'blue',
            color: 'white',
            fontSize: 40,
            height: '100%',
          }}
        >
          {this.state.isSlow ? 'fast' : 'slow'}
        </button>
        <canvas
          ref={this.canvas}
          width={(GameInstance.boardWidth + 2) * GameCanvas.blockSize}
          height={(GameInstance.boardHeight + 2) * GameCanvas.blockSize}
        />
      </>
    );
  }

  canvasRender() {
    this.canvasContext.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
    if (!GameInstance.mainInstance) {
      window.requestAnimationFrame(() => this.canvasRender());
      return;
    }
    const boardHeight = GameInstance.boardHeight;
    const boardWidth = GameInstance.boardWidth;
    const board = GameInstance.mainInstance.board;

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
              board.currentPiece.slot[board.currentPiece.x - x] &&
              board.currentPiece.slot[board.currentPiece.x - x][board.currentPiece.y - y]
            ) {
              slot = board.currentPiece.piece.gameSlot;
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

export class GamePieceInstance implements IGamePieceInstance {
  constructor(
    private gameInstance: IGameInstance,
    public x: number,
    public y: number,
    public rotation: PieceRotation,
    public piece: GamePieceData
  ) {}

  get slot() {
    return this.piece.slots[this.rotation];
  }

  canMoveDown(): boolean {
    const canMoveDown = this.gameInstance.moveDown();
    if (canMoveDown) {
      this.y--;
    }
    return canMoveDown;
  }

  canMoveLeft(): boolean {
    const canMoveLeft = this.gameInstance.moveLeft();
    if (canMoveLeft) {
      this.x++;
    }
    return canMoveLeft;
  }

  canMoveRight(): boolean {
    const canMoveRight = this.gameInstance.moveRight();
    if (canMoveRight) {
      this.x--;
    }
    return canMoveRight;
  }

  canRotate(): boolean {
    const rotate = this.rotation;
    const canRotate = this.gameInstance.rotatePiece();
    if (canRotate) {
      this.rotation = rotate;
    }
    return canRotate;
  }

  moveDown(): boolean {
    return this.gameInstance.moveDown();
  }

  moveLeft(): boolean {
    return this.gameInstance.moveLeft();
  }

  moveRight(): boolean {
    return this.gameInstance.moveRight();
  }

  rotatePiece(): boolean {
    return this.gameInstance.rotatePiece();
  }
}

export class GameBoard {
  bagPiece: number = 6;
  swapPiece: GamePieceInstance;
  slots: GameSlot[][];
  currentPieces: GamePieceInstance[] = [];

  constructor() {
    this.slots = [];
    for (let x = 0; x < 10; x++) {
      this.slots[x] = [];
      for (let y = 0; y < 22; y++) {
        this.slots[x][y] = null;
      }
    }
  }

  get currentPiece(): GamePieceInstance {
    const gamePiece = this.currentPieces[this.bagPiece];
    if (!gamePiece) {
      return undefined;
    }
    return gamePiece;
  }

  set currentPiece(value: GamePieceInstance) {
    this.currentPieces[this.bagPiece] = value;
  }

  clone(gameInstance: IGameInstance) {
    const gameBoard = new GameBoard();
    gameBoard.bagPiece = this.bagPiece;
    gameBoard.swapPiece = this.swapPiece;
    gameBoard.slots = this.slots.map(arr => arr.slice());
    gameBoard.currentPieces = this.currentPieces.map(
      a => new GamePieceInstance(gameInstance, a.x, a.y, a.rotation, a.piece)
    );
    return gameBoard;
  }
}

export class GameSlot {
  constructor(public color: string) {}
}

export class GamePieceData {
  static pieces: GamePieceData[] = [
    new GamePieceData(new GameSlot('#FFD800'), [
      // orange L
      GamePieceData.flip([[!!0, !!0, !!1], [!!1, !!1, !!1], [!!0, !!0, !!0]]),
      GamePieceData.flip([[!!0, !!1, !!0], [!!0, !!1, !!0], [!!0, !!1, !!1]]),
      GamePieceData.flip([[!!0, !!0, !!0], [!!1, !!1, !!1], [!!1, !!0, !!0]]),
      GamePieceData.flip([[!!1, !!1, !!0], [!!0, !!1, !!0], [!!0, !!1, !!0]]),
    ]),
    new GamePieceData(new GameSlot('#0026FF'), [
      // blue L
      GamePieceData.flip([[!!1, !!0, !!0], [!!1, !!1, !!1], [!!0, !!0, !!0]]),
      GamePieceData.flip([[!!0, !!1, !!1], [!!0, !!1, !!0], [!!0, !!1, !!0]]),
      GamePieceData.flip([[!!0, !!0, !!0], [!!1, !!1, !!1], [!!0, !!0, !!1]]),
      GamePieceData.flip([[!!0, !!1, !!0], [!!0, !!1, !!0], [!!1, !!1, !!0]]),
    ]),
    new GamePieceData(new GameSlot('#FFE97F'), [
      // yellow square
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
      [[!!0, !!1, !!1, !!0], [!!0, !!1, !!1, !!0], [!!0, !!0, !!0, !!0]],
    ]),
    new GamePieceData(new GameSlot('#00FF21'), [
      // green s
      GamePieceData.flip([[!!0, !!1, !!1], [!!1, !!1, !!0], [!!0, !!0, !!0]]),
      GamePieceData.flip([[!!0, !!1, !!0], [!!0, !!1, !!1], [!!0, !!0, !!1]]),
      GamePieceData.flip([[!!0, !!0, !!0], [!!0, !!1, !!1], [!!1, !!1, !!0]]),
      GamePieceData.flip([[!!1, !!0, !!0], [!!1, !!1, !!0], [!!0, !!1, !!0]]),
    ]),
    new GamePieceData(new GameSlot('#FF0000'), [
      // red s
      GamePieceData.flip([[!!1, !!1, !!0], [!!0, !!1, !!1], [!!0, !!0, !!0]]),
      GamePieceData.flip([[!!0, !!0, !!1], [!!0, !!1, !!1], [!!0, !!1, !!0]]),
      GamePieceData.flip([[!!0, !!0, !!0], [!!1, !!1, !!0], [!!0, !!1, !!1]]),
      GamePieceData.flip([[!!1, !!0, !!0], [!!1, !!1, !!0], [!!0, !!1, !!0]]),
    ]),
    new GamePieceData(new GameSlot('#00FFFF'), [
      // cyan l
      GamePieceData.flip([[!!0, !!0, !!0, !!0], [!!1, !!1, !!1, !!1], [!!0, !!0, !!0, !!0], [!!0, !!0, !!0, !!0]]),
      GamePieceData.flip([[!!0, !!0, !!1, !!0], [!!0, !!0, !!1, !!0], [!!0, !!0, !!1, !!0], [!!0, !!0, !!1, !!0]]),
      GamePieceData.flip([[!!0, !!0, !!0, !!0], [!!0, !!0, !!0, !!0], [!!1, !!1, !!1, !!1], [!!0, !!0, !!0, !!0]]),
      GamePieceData.flip([[!!0, !!1, !!0, !!0], [!!0, !!1, !!0, !!0], [!!0, !!1, !!0, !!0], [!!0, !!1, !!0, !!0]]),
    ]),
    new GamePieceData(new GameSlot('#B200FF'), [
      // purple t
      GamePieceData.flip([[!!0, !!1, !!0], [!!1, !!1, !!1], [!!0, !!0, !!0]]),
      GamePieceData.flip([[!!0, !!1, !!0], [!!0, !!1, !!1], [!!0, !!1, !!0]]),
      GamePieceData.flip([[!!0, !!0, !!0], [!!1, !!1, !!1], [!!0, !!1, !!0]]),
      GamePieceData.flip([[!!0, !!1, !!0], [!!1, !!1, !!0], [!!0, !!1, !!0]]),
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

  constructor(public gameSlot: GameSlot, public slots: boolean[][][]) {}

  slot(rotation: PieceRotation): boolean[][] {
    return this.slots[rotation];
  }

  get color(): string {
    return this.gameSlot.color;
  }
}
