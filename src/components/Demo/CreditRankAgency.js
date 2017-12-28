import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
// import Form from '../../components/Smartforms';
// import POST from '../../ajax/post';
// import { getFormData } from '../../components/Smartforms/functions';
// import { addTrack } from '../../reducers/tracker';
// import { addProperty } from '../../reducers/properties';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce } from 'lodash';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { addTrack } from '../../reducers/tracker';
import { setCreditRank } from '../../reducers/mortgage';


export default class CreditRankAgency extends Component {
  constructor(props) {
    super(props);
    this.state = {calculating: {}}

    // this.addTrack = (trackType) => () => {
    //   POST(`http://localhost:3000/api/v1/seller/confirmed-requests`, getFormData("sell"), (r, s) => {
    //     addTrack(trackType)
    //     addProperty(r)
    //   })
    // }


    this.calculateRank = (mortgageId, requestObject) => () => {
      this.setState({calculating: {...this.state.calculating, [mortgageId]: true}})

      // Simulating server response delay
      setTimeout(() => {
        this.setState({calculating: {...this.state.calculating, [mortgageId]: false}})
        setCreditRank({ creditScore: 5, mortgageId});
        addTrack({ type: "Credit score set", data: {mortgageId, creditScore: 5} })
      }, 5000)
    }

  }
  render() {
    const { calculating } = this.state;
    let pendingForCreditScore = {...sGet('mortgage')};

    console.log("pendingForCreditScore", pendingForCreditScore);
    pendingForCreditScore = reduce(pendingForCreditScore, (result, row, key) => {
      if(row.STATUS === 'pendingForCreditScore') result.push(row)
      return result
    }, [])

    console.log("after: ", pendingForCreditScore);

    if( isEmpty(pendingForCreditScore)) return null;

    return (
      <div>
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
              <Col xs="3">{v.data.mortgageAmount} / {v.data.repaymentYears}</Col>
              <Col xs="3">{v.data.salary}</Col>
              <Col xs="3">{calculating[k] ? <LoadingIndicator /> : <div className="btn btn-primary" onClick={this.calculateRank(k, v)}>Calculate rank</div>}</Col>
            </Row>
          )}
        </Container>
      </div>
    )
  }
}