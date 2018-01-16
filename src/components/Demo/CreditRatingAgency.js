import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce } from 'lodash';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { addTrack } from '../../reducers/tracker';
import { setCreditRating } from '../../reducers/mortgage';
import numeral from 'numeral';
import POST from '../../ajax/post';
import { socket } from '../../index';


export default class CreditRatingAgency extends Component {
  constructor(props) {
    super(props);
    this.state = {calculating: {}}

    // this.addTrack = (trackType) => () => {
    //   POST(`http://localhost:3000/api/v1/seller/confirmed-requests`, getFormData("sell"), (r, s) => {
    //     addTrack(trackType)
    //     addProperty(r)
    //   })
    // }

    this.fetchData = () => {
      console.log("fetched");
      // socket.emit('getCreditRankList');


			POST(`${'http://localhost:3000'}/api/v1/creditscore/pull`, {buyerHash: sGet('data.buyerHash')}, (r, s) => {
        console.log("RES", r, s);
			});
    }

    this.calculateRating = (requestObject) => () => {

			console.log(requestObject);

      POST(`${'http://localhost:3000'}/api/v1/creditscore/calculate`, {
        licenseNumber: '125',
        name: 'DummyCreditRankAgency',
        userHash: sGet('data.userHash'),
        requestHash: requestObject.propertyId,
      }, (r, s) => {
        console.log(r, s)
      });

      // this.setState({calculating: {...this.state.calculating, [mortgageId]: true}})
			//
      // // Simulating server response delay
      // setTimeout(() => {
      //   this.setState({calculating: {...this.state.calculating, [mortgageId]: false}})
      //   setCreditRating({ creditScore: 5, mortgageId});
      //   addTrack({ type: "Credit score set", data: {mortgageId, creditScore: 5} })
      // }, 2000)
    }

  }
  render() {
    const { calculating } = this.state;
    let pendingForCreditScore = {...sGet('mortgage')};

    pendingForCreditScore = reduce(pendingForCreditScore, (result, row, key) => {
      if (row.STATUS === 'pendingForCreditScore') result[key] = row
      return result
    }, {})

    if( isEmpty(pendingForCreditScore)) return null;

    return (
      <div>
        <div onClick={this.fetchData}>FETCH</div>
        <Container style={{marginTop: '20px'}}>
          <Row>
            <Col xs="3">Client ID</Col>
            <Col xs="3">Mortgage amount / Years</Col>
            <Col xs="3">Monthly Salary</Col>
            <Col xs="3">Action</Col>
          </Row>
          <hr />
          {map(pendingForCreditScore, (v, k) =>
            <Row key={k} className="d-flex align-items-center">
              <Col xs="3">{v.user.idnumber}</Col>
              <Col xs="3">{numeral(v.data.mortgageAmount).format()} / {v.data.repaymentYears}</Col>
              <Col xs="3">{v.data.salary}</Col>
              <Col xs="3">{calculating[k] ? <LoadingIndicator /> : <div className="btn btn-primary" onClick={this.calculateRating(v)}>Calculate rating</div>}</Col>
            </Row>
          )}
        </Container>
      </div>
    )
  }
}