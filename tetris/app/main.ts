import {CodeEditor} from "./codeEditor";
import {GameCanvas} from "./gameCanvas";
export class Main {

    constructor() {
        let gameCanvas = new GameCanvas();
        new CodeEditor((script) => {
            gameCanvas.loadAIScript(script);
        });
    }
}


new Main();

