import * as keyboardJS from 'keyboardjs';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {blockSize, boardHeight, boardWidth, GameInstance} from './store/game/gameInstance';
import {gameStore} from './store/game/store';
import {MainStoreName, MainStoreProps} from './store/main/store';

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
  private canvasContext!: CanvasRenderingContext2D;

  componentDidMount() {
    this.canvasContext = this.canvas.current!.getContext('2d')!;

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
        if (enterDown) {
          return;
        }
        enterDown = true;
        GameInstance.mainInstance.swap();
      },
      () => (enterDown = false)
    );

    keyboardJS.bind(
      'down',
      () => {
        if (downDown) {
          return;
        }
        downDown = true;
        GameInstance.mainInstance.moveDown();
      },
      () => (downDown = false)
    );
    keyboardJS.bind(
      'up',
      () => {
        if (upDown) {
          return;
        }
        upDown = true;
        GameInstance.mainInstance.moveUp();
      },
      () => (upDown = false)
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
            height: '5rem',
          }}
        >
          {this.state.isSlow ? 'fast' : 'slow'}
        </button>
        <canvas
          ref={this.canvas}
          style={{display: 'flex', flex: 1}}
          width={boardWidth * blockSize}
          height={boardHeight * blockSize}
        />
      </>
    );
  }

  canvasRender() {
    this.canvasContext.clearRect(0, 0, this.canvas.current!.width, this.canvas.current!.height);
    if (!GameInstance.mainInstance) {
      window.requestAnimationFrame(() => this.canvasRender());
      return;
    }
    const board = GameInstance.mainInstance.board;
    this.canvasContext.save();

    try {
      this.canvasContext.translate(0, board.boardOffsetPosition);
      this.canvasContext.lineWidth = 1;

      for (let y = 0; y < boardHeight; y++) {
        const row = board.rows[y];
        for (let x = 0; x < boardWidth; x++) {
          const tile = row.tiles[x];
          let color: string;
          switch (tile.color) {
            case 'red':
              color = '#ff0000';
              break;
            case 'blue':
              color = '#1900ff';
              break;
            case 'yellow':
              color = '#ffea00';
              break;
            case 'teal':
              color = '#2ee5c2';
              break;
            case 'purple':
              color = '#3816a9';
              break;
            case 'empty':
              continue;
          }
          const colorPad = 5;
          this.canvasContext.fillStyle = GameCanvas.colorLuminance(color, 0.3);
          this.canvasContext.fillRect(tile.drawX, tile.drawY, blockSize, blockSize);
          this.canvasContext.fillStyle = color;
          this.canvasContext.fillRect(
            tile.drawX + colorPad,
            tile.drawY + colorPad,
            blockSize - colorPad * 2,
            blockSize - colorPad * 2
          );
          this.canvasContext.strokeStyle = 'black';
          this.canvasContext.strokeRect(tile.drawX, tile.drawY, blockSize, blockSize);
        }
      }

      this.canvasContext.lineWidth = 4;
      this.canvasContext.strokeStyle = 'grey';
      this.canvasContext.strokeRect(
        board.cursor.x * blockSize - blockSize * 0.1,
        board.cursor.y * blockSize - blockSize * 0.1,
        blockSize * 2 + blockSize * 0.2,
        blockSize + blockSize * 0.2
      );
    } catch (ex) {
      console.error(ex);
    }

    this.canvasContext.restore();

    window.requestAnimationFrame(() => this.canvasRender());
  }

  private static colorLuminance(hex: string, lum: number) {
    hex = hex.replace(/[^0-9a-f]/gi, '');
    let rgb = '#';
    for (let i = 0; i < 3; i++) {
      const c = parseInt(hex.substr(i * 2, 2), 16);
      const cStr = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      rgb += ('00' + cStr).substr(cStr.length);
    }

    return rgb;
  }
}
