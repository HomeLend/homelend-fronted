import React, { Component } from 'react';
import Form from '../../components/Smartforms';
import POST from '../../ajax/post';
import GET from '../../ajax/get';
import { getFormData } from '../../components/Smartforms/functions';
import { sGet } from '../../data/constants';
import { map, isEmpty } from 'lodash';
import { addTrack } from '../../reducers/tracker';
import { appraiserEvaluation } from '../../reducers/mortgage';
import numeral from 'numeral';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { setData } from '../../reducers/generalData';


const insFromData = {
  fields: [
    { name: 'worth', default: 0, type: 'number', label: 'Property overall worth' },
  ]
}
export default class Appraiser extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.email = "luk@luk.com";

    this.state.loading = false;
    this.fetchData = () => {
      if (this.state.loading) return;
      this.setState({ loading: true });


      GET(`appraiser/pendingRequests?email=${this.email}`, (r, s) => {
        console.log(r, s);
        if (s !== 200) {
          this.setState({ loading: false });
          return alert("Oops, status " + s);
        }

        this.setState({ loading: false });
        if(r != null && r.length > 0)
        {
          let lastRequest = r[r.length - 1]
          this.setState({ appraisalData: [lastRequest] });
        }
      });
    }

    this.approveCondition = (buyerHash, requestHash) => () => {
      const formData = getFormData('worth_' + requestHash)

      this.setState({ loading: true });
      POST(`appraiser/estimation`, {
        email: this.email,
        buyerHash: buyerHash,
        requestHash: requestHash,
        amount: formData.worth,
      }, (r, s) => {
        if (s !== 200) { this.setState({ loading: false }); return alert("Oops, status " + s); }

        appraiserEvaluation(requestHash, formData.worth);
        addTrack({ type: `Appraiser evaluated property`, data: { mortgageId: requestHash, value: formData.worth } })
        this.setState({ loading: false });
        this.setState({ appraisalData: null });
        setData({ UiState: 'insurancePutOffer' });
      });
    }

  }
  render() {
    if (this.state.loading) return <LoadingIndicator />
    
    if (sGet('data.UiState') !== 'appraiserAppraisalWaiting') return null;

    const { appraisalData, loading } = this.state;


    let pendingForApproval = [];
    if (appraisalData == null) this.fetchData();

    return (
      <div>
        {
          map(appraisalData, (v, index) => {
            const buyerHash = v.BuyerHash
            const requestHash = v.RequestHash
            const property = v.PropertyItem;
            const mortgageId = requestHash;
            const formName = 'worth_' + requestHash;
            let val = sGet(['forms', formName, 'worth']);
            return (
              <div key={formName + " 5"} style={{ textAlign: 'justify' }}>
                <div>
                  <div style={{fontWeight: 'bold', textAlign: 'left', marign: '10px 0'}}>Please estimate the property's value</div>
                  <Form data={insFromData} name={formName} />
                  {val >= parseInt(property.SellingPrice, 10) ?
                    <div onClick={this.approveCondition(buyerHash, requestHash)} className={`btn btn-primary w-100 mt-2 ${val < 100 ? 'disabled' : ''}`}>Current selling price {numeral(property['SellingPrice']).format()} amount</div> :
                    <div className="btn btn-danger w-100 mt-2" style={{ border: 'none' }} onClick={this.approveCondition(buyerHash, requestHash)}>Current selling price {numeral(property['SellingPrice']).format()}</div>
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}