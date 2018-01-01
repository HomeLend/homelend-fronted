import React, { Component } from 'react';
import Form from '../../Smartforms/index';
import { Container, Row, Col } from 'reactstrap';
import { sGet } from '../../../data/constants'
import { isEmpty, map, uniqueId } from 'lodash'
// import POST from '../../../ajax/post';
import { getFormData } from '../../Smartforms/functions';
import { addTrack } from '../../../reducers/tracker';
import { requestMortgage, acceptOffer } from '../../../reducers/mortgage';
import AppraiserStep from './AppraiserStep';
import Fa from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/fontawesome-free-solid'

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

    this.state = {currentScreen: 'browseProperties', requestId: false}

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
      const newId = uniqueId();
      const newRequest = {[newId]: {STATUS:'pendingForCreditScore', data, user: getFormData('buyerRegister'), propertyId: this.state.propertyChosen}};
      // POST(`http://localhost:3000/api/v1/buyer/register`, {propertyId}, console.log)
      this.setState({currentScreen: 'waiting4Offers', requestId: newId})
      addTrack({type: "Mortgage request", newRequest })
      requestMortgage(newRequest)
    }

    this.acceptOffer = (requestId, bankId) => () => {
      this.setState({currentScreen: 'chooseAppraiser'})
      addTrack({type: "Mortgage smart contract created", data:{bankId} })
      acceptOffer(requestId, bankId)
      console.log("Accepted offer from bank id " + bankId);
    }

  }
  componentWillReceiveProps() {
    const status = sGet(['mortgage', this.state.requestId, 'STATUS']);
    if(status === "inContract" && this.state.currentScreen !== 'waitingForContractExecution') {
      this.setState({currentScreen: 'waitingForContractExecution'})
    }

    if(status === "finished" && this.state.currentScreen !== 'acquisitionFinished') {
      this.setState({currentScreen: 'acquisitionFinished'})
    }
  }
  render() {
    const { currentScreen, requestId } = this.state;
    const properties = sGet('properties');

    if( isEmpty(properties) ) return null;

    let mortgageOffers = sGet(['mortgage', requestId, 'offers']);

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
              {
                !mortgageOffers ?
                  "Waiting for mortgage offers..." :
                  <Container>
                    <Row>
                      <Col xs="4">Bank id</Col>
                      <Col xs="4">Monthly payment</Col>
                      <Col xs="4">Action</Col>
                    </Row>
                    {map(mortgageOffers, (v, bankId) =>
                      v && // If offer is not null
                      <Row key={bankId} className="d-flex align-items-center">
                        <Col xs="4">{bankId}</Col>
                        <Col xs="4">{v.amount}</Col>
                        <Col xs="4"><div className="btn btn-primary" onClick={this.acceptOffer(requestId, bankId)}>Accept</div></Col>
                      </Row>
                    )}
                  </Container>
              }
            </div>
        }
        { currentScreen === "chooseAppraiser" && <AppraiserStep mortgageId={requestId} />}
        { currentScreen === "waitingForContractExecution" &&
          <div>
            <h3>CONTRACT IS UNDERWAY</h3>
            <div className="mt-2 text-justify">
              Contract between *seller* and *buyer* and *financial institution* is underway, waiting for execution
            </div>
            <div className="mt-4 text-justify">
              <Fa icon={faCircle} style={{margin: '0 10px'}} /> Government approval of title exchange under *buyer*
            </div>
          </div>
        }
        { currentScreen === "acquisitionFinished" &&
          <div>
            <h3>Congratulations!</h3>
            <div className="mt-2 text-justify">
              You have successfully taken a mortgage with bank *banknumber*, and now own *address*
            </div>
          </div>
        }
      </div>
    )
  }
}