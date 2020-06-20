import {GameInstance} from './gameInstance';
import {GameBoard} from '../../gameBoard';
import {seed} from '../../utils/utilts';

export class GameStore {
  aiScript!: {tick: () => void};

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
      slide: `
tt tgr
rg grg
rg grg
grtrgr
ytytyt
`,
      puzzles: {
        original1: [
          {board: ' r rr ', moves: 1},
          {board: '  t   \n tt t ', moves: 1},
          {board: '  gr  \n  rg  \n  rg  ', moves: 1},
          {board: '  by  \n  by  \n  yb  \n  by  \n  by  ', moves: 1},
          {board: '  g   \nggtt t', moves: 1},
          {board: '      \nrrprpp', moves: 1},
          {board: '  r   \n  r   \n  t   \n  r   \n  r   \n  tt  ', moves: 1},
          {board: '    y \n    y \n ppyp ', moves: 1},
          {board: '  t   \n  gt  \n  ggt ', moves: 1},
          {board: '  yr  \n  ry  \n  yr  \n  ry  \n  yr  ', moves: 3},
        ],
        original2: [
          {board: '  y   \n  r   \n  r   \n  y   \n  ryy ', moves: 1},
          {board: ' b    \n gb   \n bgg  ', moves: 1},
          {board: '  tt  \n pptp ', moves: 1},
          {board: '  rg  \n  rgrg', moves: 2},
          {board: '      \ntbtbtb', moves: 3},
          {board: '  t   \nttg   \nggy   \nyyr   \nrrp   \nppb   \nbbt   \nttg   \nggy   \nyyrb  \nrrbb  ', moves: 1},
          {board: '   b  \n  gb  \n bgg  ', moves: 2},
          {board: '  p   \n  p   \n  r   \n  rp  \n  pr  ', moves: 2},
          {board: '  gg  \n  yy  \n  yg  ', moves: 2},
          {board: ' rt   \n tr   \n rtrr ', moves: 2},
        ],
        original3: [
          {board: '  y   \n  r   \n  r   \n yy   \n yr y ', moves: 2},
          {board: '  t   \n  g   \n  g   \n  tgg \n  tgt ', moves: 2},
          {board: '  ty  \n  yt  \nt ty y', moves: 2},
          {board: '  r   \n  b   \n  y   \n  yb  \n  br  \n ryr  ', moves: 2},
          {board: '   y  \n   bp \n  ppb \n pyybp', moves: 3},
          {board: '   y  \n   r  \n   pyy\n   yrr\n   bpp\n   tbb\n   gtt\n   ygg\n   ryy\n  yyrr', moves: 2},
          {board: '   r  \n   p  \n   r  \n   r  \n   p  \n  pr  \n  prpp', moves: 2},
          {board: ' gr   \n rgrg ', moves: 3},
          {board: '   t  \n   t  \n  bp  \n  tt  \n  pb  \n bpb  ', moves: 2},
          {board: '   p  \n  gp  \n ggb  \n bbp  ', moves: 2},
        ],
        original4: [
          {board: '  r   \n  y   \n  r   \n brr  \n yyb  \n rbr  ', moves: 2},
          {board: '  yy  \n  bp  \n  yb  \n bpp  ', moves: 2},
          {board: '  y   \n  b   \n  b   \n  g   \n  ggy \n  byy ', moves: 3},
          {board: '  rr  \n  gtt \n  grgt', moves: 2},
          {board: '   t  \n  tp  \n  gp  \n  tg  \n  pg  \nttgp  ', moves: 3},
          {board: '      \ngbt   \npry   \nyyp   \nprt   \npggrb \nbrbbg \nttgrg \nttprp \nggbbg ', moves: 1},
          {board: '  g   \n  y   \n  y   \nyyt   \ngyggtt', moves: 2},
          {board: '  y   \n  yb  \n  rry \n  brb ', moves: 3},
          {board: '  r   \n  yr  \n  ry  \n  tt  \n  yg  \n tgg  ', moves: 3},
          {board: '    y \n    y \n    r \n   ry \n  rgt \n ggyy \n tyyt ', moves: 3},
        ],
        original5: [
          {board: '   p  \n   g  \n   g  \n   r  \n   r  \n   g  \n   r  \n   g  \n ppgpp', moves: 2},
          {board: '   pp \n  rgp \n  rbr \n bbgg ', moves: 3},
          {board: '  p   \n  yp  \n  by  \n  bt  \n  tb  \n  ptyy', moves: 3},
          {board: '  rrt \n  ryp \n  ypp \n  ptt \n  ypp ', moves: 3},
          {board: '      \nbbttbb\npgrygp\nprggyp\ntrttyt\npbggbp', moves: 5},
          {board: '      \nb b b \ny r y \np r p \ny g y \np g g \nybrby ', moves: 3},
          {board: '   b  \n   g  \n r b  \n grg  \n rgbg ', moves: 3},
          {board: '   y  \n  gg  \n  rb  \n  ry  \n ybg  \n gbr  ', moves: 3},
          {board: '  b   \n  p   \n pt   \n yy   \n tbp  \n ytb  ', moves: 3},
          {board: '  yty \nttytty\nyppypt', moves: 3},
        ],
        original6: [
          {board: ' tg   \n tb   \n br   \n gtrr \n gbgg ', moves: 3},
          {board: ' gp   \nrbp   \nbtb   \npbp   \nbgtg  \nbrrp  \npptp  ', moves: 3},
          {board: '    b \n   br \n  ybr \n  grb \n ygbr \n gyby ', moves: 4},
          {board: ' p    \n yy   \n rp   \n ry   \n tt   \n rry  \n tpyy ', moves: 4},
          {board: ' tp   \n rg   \n rr   \n gg   \n tp   \n rttp ', moves: 4},
          {board: '    t \n    b \n b  y \n t by \n typt \n pptb \n tbby ', moves: 3},
          {board: ' y    \n py   \n rr   \n yyp  \n rprr ', moves: 4},
          {board: '   r  \n ggb  \n rrg  \n trb  \n rttbr', moves: 4},
          {board: '  g   \n  p   \n  t   \n pb   \n yby  \n bpg  \n ypg  \n ptp  \n ptp  ', moves: 4},
          {board: '   b  \n  by  \n  gty \n  ryt \n  rtr \n ttrb \n grgt ', moves: 4},
        ],
      },
      big: `ytyy t\nygpttp\npprtrr\npgpggt\ntgtppg\ngppggt\npggppt\ngttpyg\ngpptpp\nyggppg\ngppttg`,
    } as const;

    // seed('a');
    gameLogic.board = new GameBoard('puzzle', maps.big);
    gameLogic.board.tick();
    setInterval(() => {
      gameLogic.board.tick();
    }, 16);
    GameInstance.mainInstance = gameLogic;
    // gameLogic.reset();
    // this.aiScript = new result.TetrisAttackAI(gameLogic);
  }
  start() {}
}

export const gameStore = new GameStore();
export type GameStoreProps = {gameStore?: GameStore};
export const GameStoreName = 'gameStore';
