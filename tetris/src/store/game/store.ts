import {action, observable} from 'mobx';
import {GameBoard} from '../../gameCanvas';
import {GameInstance} from './gameInstance';

export class GameStore {
  aiScript: {tick: () => void};
  start() {}

  loadAIScript(script: string) {
    const sc = `
    (function (){
      var exports = {TetrisAI: null};
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
    gameLogic.board = new GameBoard();
    GameInstance.mainInstance = gameLogic;
    gameLogic.reset();
    this.aiScript = new result.TetrisAI(gameLogic);
  }
}

export const gameStore = new GameStore();
export type GameStoreProps = {gameStore?: GameStore};
export const GameStoreName = 'gameStore';
