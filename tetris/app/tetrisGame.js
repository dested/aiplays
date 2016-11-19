"use strict";
var TetrisAI = (function () {
    function TetrisAI() {
        var rotation = Game.getRotation();
        switch (rotation) {
            case PieceRotation._0:
                break;
        }
    }
    TetrisAI.prototype.tick = function () {
    };
    return TetrisAI;
}());
exports.TetrisAI = TetrisAI;
