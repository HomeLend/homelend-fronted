import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { store } from '../../data/constants';
import './style.css';

export default class Footer extends Component {
  render() {
    return (
      <div id="footer">
        <Container className={'d-flex flex-column'} >
          <div onClick={() =>console.log("STORE STATE: ", store.getState())}>Get store content</div>
        </Container>
      </div>
    )
  }
}