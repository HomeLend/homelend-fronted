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
import { setData } from './reducers/generalData'

export const socket = io('http://localhost:3000', {
  path: '/sock'
});
socket.on('connect', () => console.log("Socket connection established"))
socket.on('propertiesList', r => setData({"properties": r})
)

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
