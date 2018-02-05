import React, { Component } from 'react';
// import { Container, Row, Col } from 'reactstrap';
import { addTrack } from '../../../reducers/tracker';
import { sGet } from '../../../data/constants';
import { setData } from '../../../reducers/generalData';
// import { addOffer } from '../../../reducers/mortgage';
import { isEmpty, map, reduce } from 'lodash';
import POST from '../../../ajax/post';
import GET from '../../../ajax/get';
import MortgageSmartContract from './MortgageSmartContract';
import numeral from 'numeral';
import LoadingIndicator from '../../../components/common/LoadingIndicator';


export default class Fi extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.pull = () => {
      if (this.state.loading) return;
      this.setState({ loading: true })
      setData({ fiPullData: false });


      POST(`bank/pendingForOffer`, { buyerHash: sGet('data.buyerHash') },
        (r, s) => this.setState({ data: (s === 200) ? r : false, loading: false }))
    }

    this.pullPending4FinalApproval = () => {
      if (this.state.loading) return;
      this.setState({ loading: true });
      setData({reloadBankSmartContract : false});

      GET(`bank/pendingForFinalApproval?swiftNumber=12345`,
        (r, s) => {
          console.log(r, s);
          this.setState({ loading: false });
          if (s !== 200) {
            return alert("Oops, status " + s);
          }
          if(r != null && r.length > 0)
          {
            let lastRequest = r[r.length - 1]
            this.setState({ pending4approval: [lastRequest] });
          }
        });
    }

    this.sendMortgageProposal = () => {


      this.setState({ calculating: true, loading: true })

      POST(`bank/calculate`, {
        name: 'Bank test',
        swiftNumber: '12345',
        interest: Math.floor(Math.random() * 10).toFixed(2),
        requestHash: this.state.data.Hash,
        userHash: sGet('data.buyerHash'),
      },
        (r, s) => {
          addTrack({ type: "Offer served", data: this.state.data.Hash })
          setData({ UiState: 'buyerGotOffers' })
          // addOffer(mortgageId, amount, bankId);
          this.setState({ data: (s === 200) ? r : false, calculating: false, loading: false })
        })
    }
  }
  render() {

    let uiState = sGet('data.UiState');
    let shouldPull = sGet('data.fiPullData');
    if (shouldPull === true)
      this.pull()

    if (this.state.loading) return <LoadingIndicator />

    if (uiState === 'FinancialInstitution')
      return (
        <div>
          {/* <div onClick={this.pull}>PULL</div> */}
          {this.state.data && (
            <div>
              <strong style={{margin: '10px 0'}}>A new mortgage request is waiting for an offer</strong>
              <div className="d-flex flex-column align-items-start justify-content-start" style={{background: '#eee', borderRadius: '3px', padding: '15px'}}>
                <div className="d-flex flex-row align-items-center" style={{height: '40px'}}><span style={{padding: '0 15px'}}>Buyer: </span><input style={{border: 'none', maxWidth: '300px', background: 'transparent'}} readOnly value={this.state.data.BuyerHash} /></div>
                <div className="d-flex flex-row align-items-center" style={{height: '40px'}}><span style={{padding: '0 15px'}}>Credit score: </span><span>{this.state.data.CreditScore}</span></div>
                <div className="d-flex flex-row align-items-center" style={{height: '40px'}}><span style={{padding: '0 15px'}}>Loan amount: </span><span>{numeral(this.state.data.LoanAmount).format()}</span></div>
                <div className="w-100 d-flex flex-row justify-content-center">
                  <div className="btn btn-primary" style={{maxWidth: '350px'}} onClick={this.sendMortgageProposal}>Serve offer</div>
                </div>                  
              </div>
            </div>
          )}
        </div>
      );
    else if (uiState == 'GovernmentSettedOffer') {

      // let mortgages = { ...sGet('mortgage') };

      if (isEmpty(this.state.pending4approval) || sGet('data.reloadBankSmartContract') == true)
        this.pullPending4FinalApproval();

      // mortgages = reduce(mortgages, (result, row, key) => {
      //   if (row.STATUS === 'waitingForProposal') result[key] = row
      //   return result
      // }, {})

      // let approvals = { ...sGet('mortgage') };
      let approvals = this.state.pending4approval;

      // approvals = reduce(approvals, (result, row, key) => {
      //   if (row.STATUS === 'waitingForApprovals') result[key] = row
      //   if (row.STATUS === 'waitingForInsurance') result[key] = row
      //   return result
      // }, {})

      // if (this.state.pending4approval != null && this.state.pending4RunChaincode == null)
      //   approvals = this.state.pending4approval;

      // if (this.state.pending4approval == null && this.state.pending4RunChaincode != null)
      //   approvals = this.state.pending4RunChaincode;

      // if (this.state.pending4approval != null && this.state.pending4RunChaincode != null)
      //   approvals = this.state.pending4approval.concat(this.state.pending4RunChaincode);

      if (!isEmpty(approvals))
        return (
          <div>
            {map(approvals, (v, k) =>
              <MortgageSmartContract key={k} requestId={k} data={v} />
            )}
          </div>
        )
    }

    return null;
  }
}