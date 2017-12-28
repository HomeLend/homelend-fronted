import React, { Component } from 'react';
import Form from '../../Smartforms/index';
import { Container, Row, Col } from 'reactstrap';
import { sGet } from '../../../data/constants'
import { isEmpty, map, uniqueId } from 'lodash'
// import POST from '../../../ajax/post';
import { getFormData } from '../../Smartforms/functions';
import { addTrack } from '../../../reducers/tracker';
import { requestMortgage } from '../../../reducers/mortgage';


const register = {
  fields: [
    {name: 'idnumber', default: '312170632', type: 'number', label: `Government ID`, size: 6},
    {name: 'fullName', default: 'John Green', type: 'text', label: `Full name`, size: 6},
    {name: 'email', default: 'JG@gmail.com', type: 'text', label: `E-mail`},
  ]
}

const buyerRequestMortgage = {
  fields: [
    {name: 'salary', default: '5000', type: 'number', label: `Monthly salary`},
    {name: 'mortgageAmount', default: 1000000, type: 'number', label: `Mortgage amount wanted`, size: 6},
    {name: 'repaymentYears', default: 25, type: 'number', label: `Repayment years`, size: 6},
  ]
}

export default class Seller extends Component {
  constructor(props) {
    super(props);

    this.state = {currentScreen: 'browseProperties'}

    this.buyProperty = (propertyId) => () => {
      // POST(`http://localhost:3000/api/v1/buyer/`, {propertyId}, console.log)
      this.setState({currentScreen: 'buyerRegister', propertyChosen: propertyId})
    }


    this.register = () => {
      const data = getFormData('buyerRegister');
      // POST(`http://localhost:3000/api/v1/buyer/register`, {propertyId}, console.log)
      this.setState({currentScreen: 'requestMortgage'})
      addTrack({type: "New user", data })
    }


    this.requestMortgage = () => {
      const data = getFormData('requestMortgage');
      const newRequest = {[uniqueId()]: {STATUS:'pendingForCreditScore', data, user: getFormData('buyerRegister')}};
      // POST(`http://localhost:3000/api/v1/buyer/register`, {propertyId}, console.log)
      this.setState({currentScreen: 'waiting4Offers'})
      addTrack({type: "Mortgage request", newRequest })
      requestMortgage(newRequest)
    }

  }
  render() {
    const { currentScreen } = this.state;
    const properties = sGet('properties');

    if( isEmpty(properties) ) return null;

    return (
      <div>
        <Container>
          {
            currentScreen === "browseProperties" &&
              map(properties, (v, k) =>
                <Row key={k} style={{marginBottom: '20px'}}>
                  <Col>{v.address}</Col>
                  <Col><div className="btn btn-primary" onClick={this.buyProperty(k)}>Buy now</div></Col>
                  <Col>{v.price}</Col>
                  <Col style={{maxWidth: '75px', padding: 0}}><img style={{maxHeight: '45px'}} src={`/media/images/properties/${k}.jpg`} alt="" /></Col>
                </Row>
              )
          }
        </Container>
        {
          currentScreen === "buyerRegister" &&
            <div>
              Property: {this.state.propertyChosen}
              <Form data={register} name="buyerRegister" />
              <div className="btn btn-secondary" style={{margin: '5px'}} onClick={() => this.setState({currentScreen: 'browseProperties', propertyChosen: false})}>Cancel</div>
              <div className="btn btn-primary" style={{margin: '5px'}} onClick={this.register}>Register</div>
            </div>
        }
        {
          currentScreen === "requestMortgage" &&
            <div>
              <Form data={buyerRequestMortgage} name="requestMortgage" />
              <div className="btn btn-secondary" style={{margin: '5px'}} onClick={() => this.setState({currentScreen: 'buyerRegister'})}>Prev</div>
              <div className="btn btn-primary" style={{margin: '5px'}} onClick={this.requestMortgage}>Request mortgage</div>
            </div>
        }
        {
          currentScreen === "waiting4Offers" &&
            <div>
              Waiting for mortgage offers...
            </div>
        }

      </div>
    )
  }
}