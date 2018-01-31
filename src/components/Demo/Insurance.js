import React, { Component } from 'react';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce, get } from 'lodash';
import { addInsuranceOffer } from "../../reducers/mortgage";
import { addTrack } from "../../reducers/tracker";
import numeral from 'numeral';
import Form from '../../components/Smartforms';
import GET from '../../ajax/get';
import { getFormData } from '../../components/Smartforms/functions';
import POST from '../../ajax/post';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { setData } from '../../reducers/generalData'


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
      GET(`http://10.0.0.31:3000/api/v1/insurance/pull?licenceNumber=${insuranceLicenceNumber}`, (r, s) => {
        console.log(r, s);

        this.setState({ pendingOffers: r });
      });
    }

    this.sendInsuranceOffer = (buyerHash, mortgage) => () => {
      this.setState({ loading: true });
      const formData = getFormData(mortgage);
      const amount = formData.monthlyInsuranceAmount;

      POST(`http://localhost:3000/api/v1/insurance/putOffer`, {
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
  }
  render() {

    if (sGet('data.UiState') !== 'insurancePutOffer') return null;
    if (this.state.loading) return <LoadingIndicator />

    let pendingForInsurance = this.state.pendingOffers;
    if (pendingForInsurance == null)
      this.pullData();

    // pendingForInsurance = reduce(pendingForInsurance, (result, row, key) => {
    //   if (row.STATUS === 'waitingForInsurance') result[key] = row
    //   return result
    // }, {})

    //if( isEmpty(pendingForInsurance) || true) return null;


    return (
      <div>
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