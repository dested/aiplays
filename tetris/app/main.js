System.register(["./codeEditor", "./gameBoard"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var codeEditor_1, gameBoard_1, Main;
    return {
        setters: [
            function (codeEditor_1_1) {
                codeEditor_1 = codeEditor_1_1;
            },
            function (gameBoard_1_1) {
                gameBoard_1 = gameBoard_1_1;
            }
        ],
        execute: function () {
            Main = (function () {
                function Main() {
                    new codeEditor_1.CodeEditor();
                    new gameBoard_1.GameBoard();
                }
                return Main;
            }());
            exports_1("Main", Main);
            new Main();
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7WUFFQTtnQkFFSTtvQkFDSSxJQUFJLHVCQUFVLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxxQkFBUyxFQUFFLENBQUM7Z0JBQ3BCLENBQUM7Z0JBQ0wsV0FBQztZQUFELENBQUMsQUFORCxJQU1DOztZQUdELElBQUksSUFBSSxFQUFFLENBQUM7UUFBQSxDQUFDIn0=