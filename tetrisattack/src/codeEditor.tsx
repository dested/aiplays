import * as keyboardJS from 'keyboardjs';
import IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
import {inject, observer} from 'mobx-react';
import * as monaco from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {RouteComponentProps} from 'react-router';
import * as ts from 'typescript';
import {gameStore} from './store/game/store';
import {MainStoreName, MainStoreProps} from './store/main/store';

interface Props extends MainStoreProps {}

interface State {
  code: string;
}

export class CodeEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {code: ''};
  }
  async componentWillMount() {
    keyboardJS.bind('ctrl + s', (e) => {
      e?.preventDefault();
      this.runCode();
      return false;
    });

    const text = await (await fetch('./src/tetris-attack.d.ts')).text();
    let code = ''; // localStorage.getItem('tetris-attack-script');
    if (!code) {
      code = await (await fetch('./src/tetrisAttackGame.ts')).text();
    }
    monaco.languages.typescript.typescriptDefaults.addExtraLib(text, './tetris-attack.d.ts');

    this.setState({code});
    this.runCode();
  }

  runCode() {
    (document.getElementById('console') as HTMLTextAreaElement).value = '';

    const sourceFile = ts.createSourceFile('game.ts', this.state.code, ts.ScriptTarget.ES5);
    let outputText: string;
    const program = ts.createProgram(
      ['game.ts'],
      {},
      {
        getSourceFile: (fileName) => {
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
        getCanonicalFileName: (fileName) => {
          return fileName;
        },
        getCurrentDirectory: () => {
          return '';
        },
        getNewLine: () => {
          return '\r\n';
        },
        fileExists: (fileName) => {
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

    gameStore.loadAIScript(outputText!);
  }

  render() {
    return (
      <MonacoEditor
        ref={this.editor}
        language={'typescript'}
        theme={'vs-dark'}
        value={this.state.code}
        options={{automaticLayout: true, formatOnType: true}}
        onChange={this.onChange}
      />
    );
  }
  editor = React.createRef<MonacoEditor>();

  onChange = (code: string) => {
    this.setState({code});
    localStorage.setItem('tetris-attack-script', code);
  };
}

// window.onbeforeunload = () => 'Are you sure you want to leave?';
