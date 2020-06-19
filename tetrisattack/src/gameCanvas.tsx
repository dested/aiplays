import keyboardJS from 'keyboardjs';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {tileSize, boardHeight, boardWidth, GameInstance} from './store/game/gameInstance';
import {gameStore} from './store/game/store';
import {MainStoreName, MainStoreProps} from './store/main/store';
import {makeSheet, TetrisAttackAssets} from './assetManager';
import blocks from './assets/game/blocks.png';
import comboBoxes from './assets/game/comboBoxes.png';
import numbers from './assets/game/numbers.png';
import {JoyStick} from './components/joystick';
import {isMobile} from './utils/utilts';
import {FC, useCallback} from 'react';
import {EventData, JoystickManager, JoystickOutputData} from 'nipplejs';

interface Props extends MainStoreProps {}
interface State {
  isSlow: boolean;
}

const leftJoystickOptions = {
  mode: 'static',
  color: 'white',
  size: 70,
  position: {
    top: '70%',
    left: '50%',
  },
} as const;
const rightJoystickOptions = {
  mode: 'static',
  color: 'white',
  size: 70,
  position: {
    top: '70%',
    left: '50%',
  },
  lockX: true,
  lockY: true,
} as const;
const styles = {
  leftJoyStick: {
    position: 'absolute',
    height: '50%',
    width: '30%',
    bottom: 0,
    left: 0,
    background: 'transparent',
  },
  rightJoystick: {
    position: 'absolute',
    height: '50%',
    width: '30%',
    bottom: 0,
    right: 0,
    background: 'transparent',
  },
} as const;

@inject(MainStoreName)
@observer
export class GameCanvas extends React.Component<Props, State> {
  firstRender = false;

  logicInterval: any;
  scriptInterval: any;
  private blockAssetSheet?: HTMLCanvasElement[][];

  private canvas = React.createRef<HTMLCanvasElement>();
  private canvasContext!: CanvasRenderingContext2D;
  private comboBoxesAssetSheet?: HTMLCanvasElement[][];
  private numbersAssetSheet?: HTMLCanvasElement[][];
  constructor(props: Props) {
    super(props);

    this.state = {isSlow: true};
  }
  canvasRender() {
    this.canvasContext.clearRect(0, 0, this.canvas.current!.width, this.canvas.current!.height);
    if (!GameInstance.mainInstance || !this.blockAssetSheet || !this.comboBoxesAssetSheet || !this.numbersAssetSheet) {
      window.requestAnimationFrame(() => this.canvasRender());
      return;
    }
    if (!this.firstRender) {
      GameInstance.mainInstance.board.loadAssetSheets(
        this.blockAssetSheet,
        this.comboBoxesAssetSheet,
        this.numbersAssetSheet
      );
      this.firstRender = true;
    }
    const board = GameInstance.mainInstance.board;

    board.draw(this.canvasContext);

    window.requestAnimationFrame(() => this.canvasRender());
  }

  async componentDidMount() {
    const sheets = await Promise.all([
      makeSheet(blocks, {width: 16, height: 16}, {width: 3, height: 3}),
      makeSheet(comboBoxes, {width: 16, height: 15}, {width: 0, height: 0}),
      makeSheet(numbers, {width: 10, height: 9}, {width: 0, height: 0}),
      TetrisAttackAssets.load(),
    ]);
    this.blockAssetSheet = sheets[0];
    this.comboBoxesAssetSheet = sheets[1];
    this.numbersAssetSheet = sheets[2];
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
      'a',
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

  render() {
    return (
      <>
        {/*
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
*/}
        <canvas
          ref={this.canvas}
          style={{display: 'flex', flex: 1, imageRendering: 'pixelated', border: 'solid 2px black'}}
          width={boardWidth * tileSize}
          height={boardHeight * tileSize}
        />
        {isMobile() && <MobileControls />}
      </>
    );
  }
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

const MobileControls: FC = () => {
  const managerListenerMove = useCallback((manager: JoystickManager) => {
    let canMove = true;
    const onMove = (evt: EventData, stick: JoystickOutputData) => {
      if (!canMove) return;
      canMove = false;
      switch (true) {
        case stick.vector.x < -0.3:
          GameInstance.mainInstance.moveLeft();
          break;
        case stick.vector.x > 0.3:
          GameInstance.mainInstance.moveRight();
          break;
        case stick.vector.y > 0.3:
          GameInstance.mainInstance.moveUp();
          break;
        case stick.vector.y < -0.3:
          GameInstance.mainInstance.moveDown();
          break;
      }
    };

    const onEnd = () => {
      canMove = true;
    };

    manager.on('move', onMove);
    manager.on('end', onEnd);
    return () => {
      manager.off('move', onMove);
      manager.off('end', onEnd);
    };
  }, []);

  const managerListenerShoot = useCallback((manager: any) => {
    let canSwap = true;
    const onMove = (e: any, stick: any) => {
      if (!canSwap) return;
      canSwap = false;
      GameInstance.mainInstance.swap();
    };

    const onEnd = () => {
      canSwap = true;
    };

    manager.on('move', onMove);
    manager.on('end', onEnd);
    return () => {
      manager.off('move', onMove);
      manager.off('end', onEnd);
    };
  }, []);

  return (
    <>
      <JoyStick
        options={leftJoystickOptions}
        containerStyle={styles.leftJoyStick}
        managerListener={managerListenerMove}
      />
      <JoyStick
        options={rightJoystickOptions}
        containerStyle={styles.rightJoystick}
        managerListener={managerListenerShoot}
      />
    </>
  );
};
