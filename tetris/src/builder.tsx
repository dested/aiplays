import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {CodeEditor} from './codeEditor';
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
        <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
          <button onClick={() => this.codeEditor.current.runCode()}>Run</button>
          <CodeEditor ref={this.codeEditor} />
          <textarea id="console" style={{width: 800, height: 200}} />
        </div>

        <div style={{}}>
          <canvas id="board" />
        </div>
      </div>
    );
  }
}

export let Builder = withRouter(Component);
