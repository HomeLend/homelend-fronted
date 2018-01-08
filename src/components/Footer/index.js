import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { store } from '../../data/constants';
import './style.css';

export default class Footer extends Component {
  updateServerUrl = e => {
    const val = e.target.value;
    localStorage.setItem('serverUrl', val);
    this.forceUpdate();
  }
  render() {
    return (
      <div id="footer">
        <Container className={'d-flex flex-column'} >
          <div onClick={() =>console.log("STORE STATE: ", store.getState())}>Get store content</div>
          Server url: <input onChange={this.updateServerUrl} value={localStorage.getItem("serverUrl")} style={{width: '300px'}} />
        </Container>
      </div>
    )
  }
}