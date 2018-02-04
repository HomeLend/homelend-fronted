import React, { Component } from 'react';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce, get } from 'lodash';
import { addInsuranceOffer } from "../../reducers/mortgage";
import { addTrack } from "../../reducers/tracker";
import numeral from 'numeral';
import { Tooltip } from 'reactstrap';
import Form from '../../components/Smartforms';
import GET from '../../ajax/get';
import { getFormData } from '../../components/Smartforms/functions';
import POST from '../../ajax/post';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { setData } from '../../reducers/generalData'


const newInsForm = {
  fields: [
    { name: 'companyName', type: 'text', label: 'New insurance company name' },
  ]
}

const insFromData = {
  fields: [
    { name: 'monthlyInsuranceAmount', default: 0, type: 'number', label: 'Monthly insurance amount' },
  ]
}

export default class Insurance extends Component {
  constructor(props) {
    super(props);
    const insuranceId = 1234;
    const insuranceLicenceNumber = 1234;

    this.state = {};
    this.state.loading = false;

    this.state.pendingOffers = null;
    this.pullData = () => {
      GET(`insurance/pull?licenceNumber=${insuranceLicenceNumber}`, (r, s) => {
        console.log(r, s);

        this.setState({ pendingOffers: r });
      });
    }

    this.sendInsuranceOffer = (buyerHash, mortgage) => () => {
      this.setState({ loading: true });
      const formData = getFormData(mortgage);
      const amount = formData.monthlyInsuranceAmount;

      POST(`insurance/putOffer`, {
        userHash: buyerHash,
        requestHash: mortgage,
        amount: amount,
        licenseNumber: insuranceLicenceNumber,
      }, (r, s) => {
        if (s !== 200) { this.setState({ loading: false }); return alert("Oops, status " + s); }
        this.setState({ loading: false });
        setData({ currentScreen: "insurance" });
        addTrack({ type: "Insurance offer served", data: { buyerHash, mortgage, amount, insuranceId } });
        addInsuranceOffer(mortgage, formData, insuranceId);
        setData({ UiState: 'buyerGotInsuranceOffers' });
      });
    }

    this.createNewCompany = () => {
      this.setState({ loading: true });
      const formData = getFormData('newInsuranceCompany');

      POST(`insurance/register`, formData, (r, s) => {
        if (s !== 200) { this.setState({ loading: false }); return alert("Oops, status " + s); }
        this.setState({ loading: false });
        addTrack({ type: "New insurance company joined", data: { name: formData.companyName, licenseNumber: r.licenseNumber } });
      });
    }
    this.showDropdown = () => {
      this.setState({showDropdown: !this.state.showDropdown})
    }
  }
  render() {

    const { insertNewInsurer } = this.state;

    if (sGet('data.UiState') !== 'insurancePutOffer') return null;
    if (this.state.loading) return <LoadingIndicator />

    let pendingForInsurance = this.state.pendingOffers;
    if (pendingForInsurance === null)
      this.pullData();

    // pendingForInsurance = reduce(pendingForInsurance, (result, row, key) => {
    //   if (row.STATUS === 'waitingForInsurance') result[key] = row
    //   return result
    // }, {})

    //if( isEmpty(pendingForInsurance) || true) return null;


    return (
      <div>
        {
					insertNewInsurer &&
          <div style={{position: 'absolute', top: 0, right: 0, width: '100%', height: '150px', background: 'white', marginTop: '100px'}}>
            <Form data={newInsForm} name={'newInsuranceCompany'} />
            <div className="d-flex flex-row justify-content-around">
              <div className="btn btn-primary" onClick={this.createNewCompany}>Create</div>
              <div className="btn btn-danger" onClick={() => this.setState({insertNewInsurer: false})}>Cancel</div>
            </div>
          </div>
        }
        <div id="InsuranceSwitchDropdown" style={{padding: '10px 15px', margin: '8px', position: 'absolute', top: 0, left: 0, height: "40px", display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={this.showDropdown}>
          Switch company
        </div>
        <Tooltip placement="bottom" target="InsuranceSwitchDropdown" isOpen={this.state.showDropdown} autohide={false} toggle={() => this.setState({showDropdown: false})}>
          <div style={{padding: '10px 15px', width: '100px'}}>First</div>
          <div style={{padding: '10px 15px', width: '100px'}}>Second</div>
          <div style={{padding: '10px 15px', width: '100px', background: 'green'}} onClick={() => this.setState({insertNewInsurer: true})}>Add new</div>
        </Tooltip>
        {
          map(pendingForInsurance, (v, mortgageId) => {
            const buyerHash = v.BuyerHash;
            const mortgage = v.RequestHash;
            const address = v.PropertyItem.Address;
            const loanAmount = v.LoanAmount;
            // const insuranceOfferOk = get(v, ['conditions', 'insuranceOfferOk']) || false;
            // if (insuranceOfferOk) return <div key={mortgageId}><strong>Request {mortgageId} is approved!</strong></div>;
            return (
              <div key={mortgage} style={{ textAlign: 'justify' }}>
                Mortgage id {mortgage} is waiting for insurance offers:
                <div style={{ margin: '10px' }}><strong>Address: </strong>{address}</div>
                <div style={{ margin: '10px' }}><strong>Mortgage amount: </strong>{numeral(loanAmount).format()}</div>
                <Form data={insFromData} name={mortgage} />
                <div className="btn btn-primary" onClick={this.sendInsuranceOffer(buyerHash, mortgage)}>Send offer</div>
              </div>
            )
          })
        }
      </div>
    )
  }
}