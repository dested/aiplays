System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var GameBoard;
    return {
        setters: [],
        execute: function () {
            GameBoard = (function () {
                function GameBoard() {
                    this.blockSize = 32;
                    this.boardWidth = 8;
                    this.boardHeight = 10;
                    this.canvas = document.getElementById('board');
                    this.context = this.canvas.getContext("2d");
                    this.canvas.width = (this.boardWidth + 2) + this.blockSize;
                    this.canvas.height = (this.boardHeight + 2) + this.blockSize;
                    this.tick();
                    this.render();
                }
                GameBoard.prototype.tick = function () {
                };
                GameBoard.prototype.render = function () {
                    var _this = this;
                    for (var y = 0; y < this.boardHeight + 2; y++) {
                        for (var x = 0; x < this.boardWidth + 2; x++) {
                            var drawBlock = false;
                            if (x === 0 || x === this.boardWidth + 1 || y === 0 || y === this.boardHeight + 1) {
                                this.context.fillStyle = 'black';
                                drawBlock = true;
                            }
                            if (drawBlock) {
                                this.context.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                            }
                        }
                    }
                    window.requestAnimationFrame(function () { return _this.render(); });
                };
                return GameBoard;
            }());
            exports_1("GameBoard", GameBoard);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUJvYXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2FtZUJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7WUFBQTtnQkFRSTtvQkFKUSxjQUFTLEdBQUcsRUFBRSxDQUFDO29CQUNmLGVBQVUsR0FBRyxDQUFDLENBQUM7b0JBQ2YsZ0JBQVcsR0FBRyxFQUFFLENBQUM7b0JBR3JCLElBQUksQ0FBQyxNQUFNLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2xFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTVDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUMzRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDN0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNaLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQztnQkFFTyx3QkFBSSxHQUFaO2dCQUVBLENBQUM7Z0JBRU8sMEJBQU0sR0FBZDtvQkFBQSxpQkFrQkM7b0JBaEJHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDNUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUMzQyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7NEJBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDaEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO2dDQUNqQyxTQUFTLEdBQUMsSUFBSSxDQUFDOzRCQUNuQixDQUFDOzRCQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0NBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ2xHLENBQUM7d0JBQ0wsQ0FBQztvQkFDTCxDQUFDO29CQUdELE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLE1BQU0sRUFBRSxFQUFiLENBQWEsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2dCQUNMLGdCQUFDO1lBQUQsQ0FBQyxBQXpDRCxJQXlDQzs7UUFBQSxDQUFDIn0=