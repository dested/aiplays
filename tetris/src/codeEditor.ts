import * as keyboardJS from 'keyboardjs';
import * as monaco from 'monaco-editor';
import * as ts from 'typescript';

import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

export class CodeEditor {
  constructor(private loadAiScript: (script: string) => void) {}

  async start() {
    let editor: IStandaloneCodeEditor;
    const text = await (await fetch('./src/tetris.d.ts')).text();
    let script = localStorage.getItem('tetris-script');
    if (!script) {
      script = await (await fetch('./src/tetrisGame.ts')).text();
    }
    monaco.editor.setTheme('vs-dark');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(text, './src/tetris.d.ts');

    editor = monaco.editor.create(document.getElementById('container'), {
      value: script,
      language: 'typescript',
    });

    editor.onDidChangeModelContent(e => {
      localStorage.setItem('tetris-script', editor.getValue());
    });

    (window as any).runCode = () => {
      (document.getElementById('console') as HTMLTextAreaElement).value = '';
      const game = editor.getValue();

      const sourceFile = ts.createSourceFile('game.ts', game, ts.ScriptTarget.ES5);
      let outputText;
      const program = ts.createProgram(
        ['game.ts'],
        {},
        {
          getSourceFile: fileName => {
            return fileName.indexOf('game.ts') === 0 ? sourceFile : undefined;
          },
          writeFile: (fileName, filText) => {
            outputText = filText;
          },
          getDefaultLibFileName: () => {
            return 'lib.d.ts';
          },
          useCaseSensitiveFileNames: () => {
            return false;
          },
          getCanonicalFileName: fileName => {
            return fileName;
          },
          getCurrentDirectory: () => {
            return '';
          },
          getNewLine: () => {
            return '\r\n';
          },
          fileExists: fileName => {
            return fileName === 'game.ts';
          },
          readFile: () => {
            return '';
          },
          directoryExists: () => {
            return true;
          },
          getDirectories: () => {
            return [];
          },
        }
      );
      // Emit
      program.emit();

      this.loadAiScript(outputText);
    };
  }
}

keyboardJS.bind('ctrl + s', e => {
  e.preventDefault();
  (window as any).runCode();
  return false;
});

// window.onbeforeunload = () => 'Are you sure you want to leave?';
