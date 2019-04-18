import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
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

  async componentDidMount() {}

  render() {
    return (
      <div style={{display: 'flex', flex: 1}}>
        <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
          <button onClick={() => (window as any).runCode()}>Run</button>
          <div id="container" style={{width: 800, height: 600, border: '1px solid grey'}} />
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
