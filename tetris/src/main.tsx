import {configure} from 'mobx';
import {Provider} from 'mobx-react';
import * as React from 'react';
import {Fragment} from 'react';
import * as ReactDOM from 'react-dom';
import {Route} from 'react-router';
import {HashRouter} from 'react-router-dom';
import {Builder} from './builder';
import {CodeEditor} from './codeEditor';
import {GameCanvas} from './gameCanvas';
import {stores} from './store/stores';

configure({enforceActions: 'always'});

async function main() {
  ReactDOM.render(
    <Provider {...stores}>
      <HashRouter>
        <Fragment>
          <Route exact path="/" component={Builder} />
        </Fragment>
      </HashRouter>
    </Provider>,
    document.getElementById('main')
  );
}

main();
