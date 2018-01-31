import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { store } from './data/constants';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css';
import io from 'socket.io-client';
//import socketEventsLoad from './socket/load';

// export const socket = io('localhost:3000', {
//   path: '/sock'
// });
// socketEventsLoad(socket)

function mapStateToProps(state) {
  return {
    forms: state.forms,
    data: state.data,
    tracker: state.tracker,
    mortgage: state.mortgage,
  };
}

const AppContent = connect(mapStateToProps)(
  () => <Router>
          <App />
        </Router>);

ReactDOM.render(
  <Provider store={store}>
    <AppContent/>
  </Provider>, document.getElementById('root'));

registerServiceWorker();
