///<reference path="../libs/monaco/monaco.d.ts"/>
///<reference path="./typings/fetch.d.ts"/>
///<reference path="./typings/promise.d.ts"/>
///<reference path="./typings/typescript.d.ts"/>
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
declare var require;
declare var ts;

export class CodeEditor {
    constructor() {
        let editor: IStandaloneCodeEditor;
        require.config({paths: {'vs': 'libs/monaco/min/vs'}});
        require(['vs/editor/editor.main'], async() => {
            let text = await (await window.fetch('app/tetris.d.ts')).text();
            let defaultApp = await (await window.fetch('app/tetrisGame.ts')).text();

            monaco.languages.typescript.typescriptDefaults.addExtraLib(text, 'app/tetris.d.ts');

            editor = monaco.editor.create(document.getElementById('container'), {
                value: defaultApp,
                language: 'typescript',
            });

        });

        (<any>window).runCode = () => {
            let game = editor.getValue();

            var sourceFile = ts.createSourceFile("game.ts", game, ts.ScriptTarget.ES5);
            var outputText;
            var program = ts.createProgram(["game.ts"], {}, {
                getSourceFile: (fileName) => {
                    return fileName.indexOf("game.ts") === 0 ? sourceFile : undefined;
                },
                writeFile: (_name, text) => {
                    console.log(outputText = text);
                },
                getDefaultLibFileName: () => {
                    return "lib.d.ts";
                },
                useCaseSensitiveFileNames: () => {
                    return false;
                },
                getCanonicalFileName: (fileName) => {
                    return fileName;
                },
                getCurrentDirectory: () => {
                    return "";
                },
                getNewLine: () => {
                    return "\r\n";
                },
                fileExists: (fileName) => {
                    return fileName === "game.ts";
                },
                readFile: () => {
                    return "";
                },
                directoryExists: () => {
                    return true;
                },
                getDirectories: () => {
                    return [];
                }
            });
            // Emit
            program.emit();
            let exports = {TetrisAI: null};
            (<any>window).eval(outputText);
            new exports.TetrisAI()
        };
    }
}