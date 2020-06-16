import {GameBoard, GameCanvas, GamePieceData, GamePieceInstance, GameSlot} from '../../gameCanvas';
import {IGameInstance, IGamePieceInstance, PieceRotation} from '../../tetris';

export class GameInstance implements IGameInstance {
  static mainInstance: GameInstance;
  static boardWidth = 10;
  static boardHeight = 22;

  private bagSlotIndexes: number[] = [0, 1, 2, 3, 4, 5, 6];
  board: GameBoard;
  get boardWidth() {
    return GameInstance.boardWidth;
  }
  get boardHeight() {
    return GameInstance.boardHeight;
  }

  clone(): GameInstance {
    const gameLogic = new GameInstance();
    gameLogic.board = this.board.clone(gameLogic);
    return gameLogic;
  }

  isBlocked(x: number, y: number, includeCurrentPiece?: boolean): boolean {
    const b = !!this.board.slots[x][y];
    if (b) {
      return true;
    }
    if (includeCurrentPiece) {
      const piece = this.getCurrentPiece();
      return piece.slot[x - piece.x] && piece.slot[x - piece.x][y - piece.y];
    }
    return false;
  }

  isOnBoard(x: number, y: number): boolean {
    return x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight;
  }

  swap(): void {
    this.newPiece(true);
  }

  drop(): void {
    while (this.moveDown()) {}
  }

  getPiece(index: number): GamePieceInstance {
    return this.board.currentPieces[this.board.bagPiece + index];
  }

  getCurrentPiece(): GamePieceInstance {
    return this.board.currentPiece;
  }

  getPosition(): {x: number; y: number; width: number; height: number} {
    const pos = {x: 0, y: 0, width: 0, height: 0};

    let lowestX = 100;
    let lowestY = 100;
    let highestX = 0;
    let highestY = 0;

    const currentPiece = this.board.currentPiece;
    const slot = currentPiece.slot;
    const px = currentPiece.x;
    const py = currentPiece.y;

    for (let y = -1; y < this.boardHeight + 1; y++) {
      for (let x = -1; x < this.boardWidth + 1; x++) {
        if (currentPiece) {
          if (slot[px - x] && slot[px - x][py - y]) {
            if (lowestX > x) {
              lowestX = x;
            }
            if (lowestY > y) {
              lowestY = y;
            }
            if (highestX < x) {
              highestX = x;
            }
            if (highestY < y) {
              highestY = y;
            }
          }
        }
      }
    }

    pos.x = lowestX;
    pos.y = lowestY;

    pos.width = highestX - lowestX;
    pos.height = highestY - lowestY;
    return pos;
  }

  getSwap(): IGamePieceInstance {
    return this.board.swapPiece;
  }

  getRotation(): PieceRotation {
    return this.board.currentPiece.rotation;
  }

  rotatePiece() {
    const origSlot = this.board.currentPiece.rotation;
    this.board.currentPiece.rotation = (this.board.currentPiece.rotation + 1) % 4;
    if (this.collidesWalls()) {
      this.board.currentPiece.rotation = origSlot;
      return false;
    }
    let fail = false;
    this.checkCollision(() => {
      this.board.currentPiece.rotation = origSlot;
      fail = true;
    });
    return !fail;
  }

  moveDown() {
    this.board.currentPiece.y++;
    let fail = false;
    this.checkCollision(() => {
      this.board.currentPiece.y--;
      fail = true;
    });
    return !fail;
  }

  moveRight() {
    this.board.currentPiece.x++;
    if (this.collidesWalls()) {
      this.board.currentPiece.x--;
      return false;
    } else {
      let fail = false;
      this.checkCollision(() => {
        this.board.currentPiece.x--;
        fail = true;
      });
      if (fail) {
        return false;
      }
    }
  }

  moveLeft() {
    this.board.currentPiece.x--;
    if (this.collidesWalls()) {
      this.board.currentPiece.x++;
      return false;
    } else {
      let fail = false;
      this.checkCollision(() => {
        this.board.currentPiece.x++;
        fail = true;
      });
      if (fail) {
        return false;
      }
    }
    return true;
  }

  reset() {
    this.board = new GameBoard();
    this.newPiece(false);
  }

  tick() {
    this.board.currentPiece.y++;

    this.checkCollision(() => {
      this.board.currentPiece.y--;
    });
  }

  private checkCollision(undoMove: () => void) {
    if (this.collides()) {
      undoMove();
      for (let y = -1; y < this.boardHeight + 1; y++) {
        for (let x = -1; x < this.boardWidth + 1; x++) {
          if (this.board.currentPiece) {
            if (
              this.board.currentPiece.slot[this.board.currentPiece.x - x] &&
              this.board.currentPiece.slot[this.board.currentPiece.x - x][this.board.currentPiece.y - y]
            ) {
              this.board.slots[x][y] = this.board.currentPiece.piece.gameSlot;
            }
          }
        }
      }

      this.newPiece(false);
    }
  }

  private collides() {
    for (let y = -1; y < this.boardHeight + 1; y++) {
      for (let x = -1; x < this.boardWidth + 1; x++) {
        let solid = false;
        if (y === this.boardHeight) {
          solid = true;
        }
        if (this.board.slots[x] && this.board.slots[x][y]) {
          solid = true;
        }

        if (this.board.currentPiece) {
          if (
            this.board.currentPiece.slot[this.board.currentPiece.x - x] &&
            this.board.currentPiece.slot[this.board.currentPiece.x - x][this.board.currentPiece.y - y]
          ) {
            if (solid) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private collidesWalls() {
    for (let y = -1; y < this.boardHeight + 1; y++) {
      for (let x = -1; x < this.boardWidth + 1; x++) {
        let solid = false;
        if (x === -1 || x === this.boardWidth) {
          solid = true;
        }
        if (this.board.slots[x] && this.board.slots[x][y]) {
          solid = true;
        }

        if (this.board.currentPiece) {
          if (
            this.board.currentPiece.slot[this.board.currentPiece.x - x] &&
            this.board.currentPiece.slot[this.board.currentPiece.x - x][this.board.currentPiece.y - y]
          ) {
            if (solid) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  newPiece(swap: boolean) {
    for (let y = this.boardHeight - 1; y >= 0; y--) {
      let bad = false;
      for (let x = 0; x < this.boardWidth; x++) {
        if (!this.board.slots[x][y]) {
          bad = true;
          break;
        }
      }
      if (!bad) {
        for (let subY = y; subY > 0; subY--) {
          for (let x = 0; x < this.boardWidth; x++) {
            this.board.slots[x][subY] = this.board.slots[x][subY - 1];
          }
        }
        y++;
      }
    }

    if (swap) {
      if (this.board.swapPiece) {
        [this.board.currentPiece, this.board.swapPiece] = [this.board.swapPiece, this.board.currentPiece];
      } else {
        this.board.swapPiece = this.board.currentPiece;
        this.nextPiece();
      }

      this.board.currentPiece.x = 5;
      this.board.currentPiece.y = this.board.currentPiece.slot.length - 1;
      if (this.collides()) {
        this.reset();
      }
    } else {
      this.nextPiece();

      this.board.currentPiece.x = 5;
      this.board.currentPiece.y = this.board.currentPiece.slot.length - 1;
      if (this.collides()) {
        this.reset();
      }
    }
  }

  private nextPiece() {
    this.board.bagPiece++;
    if (this.board.bagPiece === 7) {
      this.board.bagPiece = 0;
      this.bagSlotIndexes.sort((a, b) => Math.random() * 100 - 50);

      for (let i = 0; i < this.bagSlotIndexes.length; i++) {
        const ind = this.bagSlotIndexes[i];
        this.board.currentPieces[i] = new GamePieceInstance(
          this,
          5,
          0,
          0,
          GamePieceData.pieces[this.bagSlotIndexes[ind]]
        );
      }
    }
  }
}

/*gamepiece should be an abstraction
  it shou8ld have things like rotate

  does a piece currently fit at xy
  can the piece rotate
  can the piece move left
  can the piece move right
  it shouldnt expose slots
  rename slots
  the bag should be all gamepieceinstances

  */
