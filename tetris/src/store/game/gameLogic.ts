import {GameBoard, GameCanvas, GamePiece, GameSlot} from '../../gameCanvas';

export class GameLogic {
  static instance: GameLogic = new GameLogic();
  boardWidth = 10;
  boardHeight = 22;
  board: GameBoard;
  private slotIndexes: number[] = [0, 1, 2, 3, 4, 5, 6];
  private aiScript: ITetrisAI;

  rotate() {
    const origSlot = this.board.currentPiece.currentSlot;
    this.board.currentPiece.currentSlot = (this.board.currentPiece.currentSlot + 1) % 4;
    if (this.collidesWalls()) {
      this.board.currentPiece.currentSlot = origSlot;
      return false;
    }
    let fail = false;
    this.checkCollision(() => {
      this.board.currentPiece.currentSlot = origSlot;
      fail = true;
    });
    return !fail;
  }

  moveDown() {
    this.board.currentPosition.y++;
    let fail = false;
    this.checkCollision(() => {
      this.board.currentPosition.y--;
      fail = true;
    });
    return !fail;
  }

  moveRight() {
    this.board.currentPosition.x++;
    if (this.collidesWalls()) {
      this.board.currentPosition.x--;
      return false;
    } else {
      let fail = false;
      this.checkCollision(() => {
        this.board.currentPosition.x--;
        fail = true;
      });
      if (fail) {
        return false;
      }
    }
  }

  moveLeft() {
    this.board.currentPosition.x--;
    if (this.collidesWalls()) {
      this.board.currentPosition.x++;
      return false;
    } else {
      let fail = false;
      this.checkCollision(() => {
        this.board.currentPosition.x++;
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
    this.board.currentPosition.y++;

    this.checkCollision(() => {
      this.board.currentPosition.y--;
    });
  }

  private checkCollision(undoMove: () => void) {
    if (this.collides()) {
      undoMove();
      for (let y = -1; y < this.boardHeight + 1; y++) {
        for (let x = -1; x < this.boardWidth + 1; x++) {
          if (this.board.currentPiece) {
            if (
              this.board.currentPiece.slot[this.board.currentPosition.x - x] &&
              this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y]
            ) {
              this.board.slots[x][y] = this.board.currentPiece.gameSlot;
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
            this.board.currentPiece.slot[this.board.currentPosition.x - x] &&
            this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y]
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
            this.board.currentPiece.slot[this.board.currentPosition.x - x] &&
            this.board.currentPiece.slot[this.board.currentPosition.x - x][this.board.currentPosition.y - y]
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

      this.board.currentPosition.x = 5;
      this.board.currentPosition.y = this.board.currentPiece.slot.length - 1;
      if (this.collides()) {
        this.reset();
      }
    } else {
      this.nextPiece();

      this.board.currentPosition.x = 5;
      this.board.currentPosition.y = this.board.currentPiece.slot.length - 1;
      if (this.collides()) {
        this.reset();
      }
    }
  }

  private nextPiece() {
    this.board.bagPiece++;
    if (this.board.bagPiece === 7) {
      this.board.bagPiece = 0;
      this.slotIndexes.sort((a, b) => Math.random() * 100 - 50);
      for (let i = 0; i < this.slotIndexes.length; i++) {
        const ind = this.slotIndexes[i];
        this.board.currentPieces[i] = GamePiece.pieces[this.slotIndexes[ind]];
        this.board.currentPieces[i].currentSlot = 0;
      }
    }
  }
}
export class GameInstance implements IGameInstance {
  get boardHeight(): number {
    return GameLogic.instance.boardHeight;
  }

  get boardWidth(): number {
    return GameLogic.instance.boardWidth;
  }

  moveLeft(): boolean {
    const okay = GameLogic.instance.moveLeft();
    return okay;
  }

  isBlocked(x: number, y: number): boolean {
    return !!GameLogic.instance.board.slots[x][y];
  }

  isOnBoard(x: number, y: number): boolean {
    return x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight;
  }

  swap(): void {
    GameLogic.instance.newPiece(true);
  }

  drop(): void {
    while (GameLogic.instance.moveDown()) {}
  }

  getPiece(index: number): IGamePiece {
    return GameLogic.instance.board.currentPieces[GameLogic.instance.board.bagPiece + index];
  }

  getCurrentPiece(): IGamePiece {
    return this.getPiece(0);
  }

  clone(): GameSlot[][] {
    return GameLogic.instance.board.slots.map(a => a.map(b => b));
  }

  getPosition(): {x: number; y: number; width: number; height: number} {
    const pos = {x: 0, y: 0, width: 0, height: 0};

    let lowestX = 100;
    let lowestY = 100;
    let highestX = 0;
    let highestY = 0;

    const currentPiece = GameLogic.instance.board.currentPiece;
    const slot = currentPiece.slot;
    const px = GameLogic.instance.board.currentPosition.x;
    const py = GameLogic.instance.board.currentPosition.y;

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

  getSwap(): IGamePiece {
    return GameLogic.instance.board.swapPiece;
  }

  moveRight(): boolean {
    const okay = GameLogic.instance.moveRight();
    return okay;
  }

  moveDown(): boolean {
    const okay = GameLogic.instance.moveDown();
    return okay;
  }

  rotate(): boolean {
    const okay = GameLogic.instance.rotate();
    return okay;
  }

  getRotation(): PieceRotation {
    return GameLogic.instance.board.currentPiece.currentSlot as PieceRotation;
  }
}
