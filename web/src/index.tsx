import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux'
import 'semantic-ui-css/semantic.min.css';
import App from './App';
import {unregister} from './registerServiceWorker';
import store from "./store/store";

ReactDOM.render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  document.getElementById('root')
);
unregister();
