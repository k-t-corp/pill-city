import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux'
import 'semantic-ui-css/semantic.min.css';
import 'react-image-lightbox/style.css';
import App from './App';
import register from './registerServiceWorker';
import store from "./store/store";
import {PersistGate} from "redux-persist/integration/react";
import {persistStore} from "redux-persist";

const persistor = persistStore(store);

ReactDOM.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
register();
