import {CodeEditor} from "./codeEditor";
import {GameCanvas} from "./gameCanvas";
export class Main{

    constructor(){
        new CodeEditor();
        new GameCanvas();
    }
}


new Main();