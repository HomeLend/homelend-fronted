import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
// import Form from '../../components/Smartforms';
// import POST from '../../ajax/post';
// import { getFormData } from '../../components/Smartforms/functions';
// import { addProperty } from '../../reducers/properties';
// import LoadingIndicator from '../../components/common/LoadingIndicator';
import { addTrack } from '../../../reducers/tracker';
import { sGet } from '../../../data/constants';
import { addOffer } from '../../../reducers/mortgage';
import { isEmpty, map, reduce } from 'lodash';
import MortgageSmartContract from './MortgageSmartContract';


export default class Fi extends Component {
  constructor(props) {
    super(props);

    const bankId = 1;

    this.sendMortgageProposal = (mortgageId, amount) => () => {
      addTrack({type: "Offer served", data:{mortgageId, bankId} })
      addOffer(mortgageId, amount, bankId);
    }

  }
  render() {
    let mortgages = {...sGet('mortgage')};

    mortgages = reduce(mortgages, (result, row, key) => {
      if(row.STATUS === 'waitingForProposal') result[key] = row
      return result
    }, {})

    let approvals = {...sGet('mortgage')};

    approvals = reduce(approvals, (result, row, key) => {
      if(row.STATUS === 'waitingForApprovals') result[key] = row
      return result
    }, {})


    if( !isEmpty(approvals) ) return (<div>
      {map(approvals, (v, k) =>
        <MortgageSmartContract key={k} requestId={k} />
      )}
    </div>)


    if ( isEmpty(mortgages) ) return null;

    return (
      <div>
        <h5>List of mortgages</h5>
        <Container>
          <Row>
            <Col xs="3">Client ID</Col>
            <Col xs="3">Mortgage amount / Years</Col>
            <Col xs="3">Credit score / Monthly repayment</Col>
            <Col xs="3">Action</Col>
          </Row>
          <hr />
          {map(mortgages, (v, k) => {
            let monthlyPayment = parseInt(v.data.mortgageAmount, 10) / (parseInt(v.data.repaymentYears, 10) * 12);
            monthlyPayment = Math.floor(monthlyPayment*10) / 10;

            return (
              <Row key={k} className="d-flex align-items-center">
                <Col xs="3">{v.user.idnumber}</Col>
                <Col xs="3">{v.data.mortgageAmount} / {v.data.repaymentYears}</Col>
                <Col xs="3">{v.creditScore} / {monthlyPayment}</Col>
                <Col xs="3"><div className="btn btn-primary" onClick={this.sendMortgageProposal(k, monthlyPayment)}>Send Proposal</div></Col>
              </Row>
            )
          }
          )}
        </Container>
      </div>
    )
  }
}