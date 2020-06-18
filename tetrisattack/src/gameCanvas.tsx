import keyboardJS from 'keyboardjs';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {tileSize, boardHeight, boardWidth, GameInstance} from './store/game/gameInstance';
import {gameStore} from './store/game/store';
import {MainStoreName, MainStoreProps} from './store/main/store';
import {makeSheet, TetrisAttackAssets} from './assetManager';
import blocks from './assets/game/blocks.png';

interface Props extends MainStoreProps {}
interface State {
  isSlow: boolean;
}

@inject(MainStoreName)
@observer
export class GameCanvas extends React.Component<Props, State> {
  private assetSheet?: HTMLCanvasElement[][];
  constructor(props: Props) {
    super(props);

    this.state = {isSlow: true};
  }

  private canvas = React.createRef<HTMLCanvasElement>();
  private canvasContext!: CanvasRenderingContext2D;

  async componentDidMount() {
    await TetrisAttackAssets.load();
    this.assetSheet = await makeSheet(blocks, {width: 16, height: 16}, {width: 3, height: 3});
    this.canvasContext = this.canvas.current!.getContext('2d')!;
    this.canvasContext.imageSmoothingEnabled = false;

    let leftDown = false;
    let rightDown = false;
    let downDown = false;
    let upDown = false;
    let shiftDown = false;
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

    keyboardJS.bind(
      'shift',
      () => {
        if (shiftDown) {
          return;
        }
        shiftDown = true;
        for (let i = 0; i < tileSize; i++) {
          setTimeout(() => {
            GameInstance.mainInstance.board.boardOffsetPosition += 1;
          }, i * 15);
        }
      },
      () => (shiftDown = false)
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
          style={{display: 'flex', flex: 1, imageRendering: 'pixelated'}}
          width={boardWidth * tileSize}
          height={boardHeight * tileSize}
        />
      </>
    );
  }

  firstRender = false;
  canvasRender() {
    this.canvasContext.clearRect(0, 0, this.canvas.current!.width, this.canvas.current!.height);
    if (!GameInstance.mainInstance || !this.assetSheet) {
      window.requestAnimationFrame(() => this.canvasRender());
      return;
    }
    if (!this.firstRender) {
      GameInstance.mainInstance.board.loadAssetSheet(this.assetSheet);
      this.firstRender = true;
    }
    const board = GameInstance.mainInstance.board;
    this.canvasContext.save();

    try {
      this.canvasContext.translate(0, boardHeight * tileSize - board.boardOffsetPosition);
      this.canvasContext.lineWidth = 1;

      for (let y = board.topMostRow; y < board.lowestVisibleRow + 1; y++) {
        const row = board.rows[y];
        if (!row) continue;
        for (let x = 0; x < boardWidth; x++) {
          const tile = row.tiles[x];
          tile.draw(this.canvasContext);
        }
      }

      const selectionBox = TetrisAttackAssets.assets['game.selectionBox'].image;
      this.canvasContext.drawImage(
        selectionBox,
        board.cursor.x * tileSize - 4,
        board.cursor.y * tileSize - 4,
        tileSize * 2 + 8,
        tileSize + 8
      );
    } catch (ex) {
      console.error(ex);
    }

    this.canvasContext.restore();

    window.requestAnimationFrame(() => this.canvasRender());
  }

  static colorLuminance(hex: string, lum: number) {
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
