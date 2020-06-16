import {IGameInstance, IGamePieceInstance} from './tetris';

type Action = 'initial' | 'down' | 'left' | 'right' | 'rotate';
type Score = {score: number; action: Action; firstAction: Action; game: IGameInstance};

export class TetrisAI {
  constructor(private game: IGameInstance) {}

  tick() {
    console.clear();
    let scores: Score[] = [{score: 0, action: 'initial', firstAction: 'initial', game: this.game.clone()}];
    let tries = 0;
    while (tries < 4) {
      const newScores: Score[] = [];
      for (const score of scores) {
        if (score.game.getCurrentPiece().canMoveDown()) {
          score.game.moveDown();
          const newScore = this.getScore(score.game);
          if (score.score >= newScore) {
            newScores.push({
              score: newScore,
              action: 'down',
              firstAction: tries === 0 ? 'down' : score.firstAction,
              game: score.game.clone(),
            });
          }
        }
        if (score.game.getCurrentPiece().canMoveLeft()) {
          score.game.moveLeft();
          const newScore = this.getScore(score.game);
          if (score.score >= newScore) {
            newScores.push({
              score: newScore,
              action: 'left',
              firstAction: tries === 0 ? 'left' : score.firstAction,
              game: score.game.clone(),
            });
          }
        }
        if (score.game.getCurrentPiece().canMoveRight()) {
          score.game.moveRight();
          const newScore = this.getScore(score.game);
          if (score.score >= newScore) {
            newScores.push({
              score: newScore,
              action: 'right',
              firstAction: tries === 0 ? 'right' : score.firstAction,
              game: score.game.clone(),
            });
          }
        }
        if (score.game.getCurrentPiece().canRotate()) {
          score.game.rotatePiece();
          const newScore = this.getScore(score.game);
          if (score.score >= newScore) {
            newScores.push({
              score: newScore,
              action: 'rotate',
              firstAction: tries === 0 ? 'rotate' : score.firstAction,
              game: score.game.clone(),
            });
          }
        }
      }
      scores = newScores.sort((a, b) => b.score - a.score);
      tries++;
    }
    switch (scores[0].firstAction) {
      case 'down':
        this.game.moveDown();
        break;
      case 'left':
        this.game.moveLeft();
        break;
      case 'right':
        this.game.moveRight();
        break;
      case 'rotate':
        this.game.rotatePiece();
        break;
    }
  }

  private getScore(game: IGameInstance): number {
    let score = 0;
    for (let py = game.boardHeight; py >= 0; py--) {
      for (let px = 0; px < game.boardWidth; px++) {
        if (game.isBlocked(px, py, true)) {
          score += py;
        } else {
          score -= py * 1.1;
        }
      }
    }
    return score;
  }
}
