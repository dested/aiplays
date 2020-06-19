import {GameInstance} from './gameInstance';
import {GameBoard} from '../../gameBoard';
import {seed} from '../../utils/utilts';

export class GameStore {
  aiScript!: {tick: () => void};
  start() {}

  loadAIScript(script: string) {
    const sc = `
  (function (){
    var exports = {TetrisAttackAI: null};
    let console={
      log : function(){
        var mm='';
        for(var i=0;i<arguments.length;i++) {
          mm+=arguments[i]+" ";
        }
        document.getElementById('console').value+=mm+'\\r\\n';
      },
      clear:function(){
      document.getElementById('console').value='';
      }
    }
    ${script}
    return exports;
    })()`;
    const result = (window as any).eval(sc);

    const gameLogic = new GameInstance();
    const maps = {
      sevenCombo: `
bgtgbg
rrbbgg
bbbrbr
rrgybt
rbbryt
yrggbb`,
      weirdDrop: `
ttbrgr
rgrgrg
rgtgrg
rgtrgr
ytytyt
`,
    };
    // seed('a');
    gameLogic.board = new GameBoard(maps.sevenCombo);
    gameLogic.board.tick();
    setInterval(() => {
      gameLogic.board.tick();
    }, 16);
    GameInstance.mainInstance = gameLogic;
    // gameLogic.reset();
    // this.aiScript = new result.TetrisAttackAI(gameLogic);
  }
}

export const gameStore = new GameStore();
export type GameStoreProps = {gameStore?: GameStore};
export const GameStoreName = 'gameStore';
