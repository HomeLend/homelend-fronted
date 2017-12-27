import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from 'react-router-dom'
import { store } from '../../data/constants';
import GET from '../../ajax/get';
import POST from '../../ajax/post';
import PUT from '../../ajax/put';
import './style.css';

export default class Header extends Component {
  render() {
    return (
      <div id="footer">
        <Container className={'d-flex flex-column'} >
          <div onClick={() =>console.log("STORE STATE: ", store.getState())}>Footer</div>
          <div onClick={() => GET('https://api.homelend.co/api/v1/address/city')}>Test get</div>
          <div onClick={() => POST('https://api.homelend.co/api/v1/address/city')}>Test post</div>
          <div onClick={() => PUT('https://api.homelend.co/api/v1/address/city')}>Test put</div>
          <Link to="/insertDetails">Insert Details</Link>
        </Container>
      </div>
    )
  }
}