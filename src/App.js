import React, { Component } from 'react';
import fontawesome from '@fortawesome/fontawesome'
import { faPencilAlt } from '@fortawesome/fontawesome-free-solid'
import Footer from './components/Footer';
import { Route } from 'react-router-dom'
import { withRouter } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';
import config from 'react-global-configuration';

fontawesome.library.add(faPencilAlt)
config.set({ serverBaseUrl: 'http://localhost:3000/api/v1/' });
//config.set({ serverBaseUrl: 'http://demo.homelend.io:3000/api/v1/' });


class App extends Component {
  render() {
    let routerPath = this.props.location.pathname;
    routerPath = (routerPath === '/') ? 'home' : routerPath.replace('/', ' ');

    return (
      <div className={`d-flex align-items-center flex-column ${routerPath}`}>
        <div className="site-content w-100">
          <div style={{minHeight: 'calc(100vh)'}}>
            <Route exact path="/" component={Home}/>
          </div>
          <Footer />
        </div>
      </div>
    )
  }
}

export default withRouter(props => <App {...props}/>);