import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {configure} from 'mobx';
import {Provider} from 'mobx-react';
import {Fragment} from 'react';
import {Route} from 'react-router';
import {HashRouter} from 'react-router-dom';
import {Builder} from './builder';
import {stores} from './store/stores';

configure({enforceActions: 'always'});

ReactDOM.render(
  <React.StrictMode>
    <Provider {...stores}>
      <HashRouter>
        <Fragment>
          <Route exact path="/" component={Builder} />
        </Fragment>
      </HashRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
