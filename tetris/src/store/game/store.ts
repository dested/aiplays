import {action, observable} from 'mobx';
import {GameInstance, GameLogic} from './gameLogic';

export class GameStore {
  aiScript: {tick: () => void};
  start() {}

  loadAIScript(script: string) {
    GameLogic.instance.reset();
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

    this.aiScript = new result.TetrisAI(new GameInstance());
  }
}

export const gameStore = new GameStore();
export type GameStoreProps = {gameStore?: GameStore};
export const GameStoreName = 'gameStore';
