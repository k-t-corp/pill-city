import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css';
import * as Sentry from "@sentry/react";
import App from './App';
import registerServiceWorker from './registerServiceWorker';

if (process.env.REACT_APP_SENTRY_DSN) {
  console.log("Enable sentry")
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN
  });
} else {
  console.log("Not enable sentry")
}

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
