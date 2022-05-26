import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux'
import 'semantic-ui-css/semantic.min.css';
import 'react-image-lightbox/style.css';
import App from './App';
import register from './registerServiceWorker';
import store from "./store/store";

ReactDOM.render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  document.getElementById('root')
);
register();
