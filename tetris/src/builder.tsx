import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {CodeEditor} from './codeEditor';
import {GameCanvas} from './gameCanvas';
import {GameLogic} from './store/game/gameLogic';
import {MainStoreName, MainStoreProps} from './store/main/store';

interface Props extends RouteComponentProps<{}>, MainStoreProps {}

interface State {}

@inject(MainStoreName)
@observer
export class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {};
  }

  codeEditor = React.createRef<CodeEditor>();
  async componentDidMount() {}

  render() {
    return (
      <div style={{display: 'flex', flex: 1}}>
        <div style={{display: 'flex', height: '100vh', flex: 1, flexDirection: 'column'}}>
          <CodeEditor ref={this.codeEditor} />
          <textarea id="console" style={{width: '100%', height: 200}} />
        </div>

        <div
          style={{
            width: (GameLogic.instance.boardWidth + 2) * GameCanvas.blockSize,
            flexDirection: 'column',
            display: 'flex',
          }}
        >
          <GameCanvas />
          <button
            style={{border: 0, backgroundColor: 'red', color: 'white', fontSize: 40, height: '100%'}}
            onClick={() => this.codeEditor.current.runCode()}
          >
            Run Code
          </button>
        </div>
      </div>
    );
  }
}

export let Builder = withRouter(Component);
