import {CodeEditor} from "./codeEditor";
import {GameBoard} from "./gameBoard";
export class Main{

    constructor(){
        new CodeEditor();
        new GameBoard();
    }
}


new Main();