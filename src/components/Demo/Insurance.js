import React, { Component } from 'react';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce, get } from 'lodash';
import {addInsuranceOffer} from "../../reducers/mortgage";
import {addTrack} from "../../reducers/tracker";
import numeral from 'numeral';

export default class Insurance extends Component {
  constructor(props) {
    super(props);
    const insuranceId = 1;
    this.sendInsuranceOffer = (mortgageId,offer) => () => {
      addTrack({type: "Insurance offer served", data:{mortgageId,offer, insuranceId } });
      addInsuranceOffer(mortgageId,offer, insuranceId);
    }
  }
  render() {
    let pendingForInsurance = {...sGet('mortgage')};

    pendingForInsurance = reduce(pendingForInsurance, (result, row, key) => {
      if(row.STATUS === 'waitingForInsurance') result[key] = row
      return result
    }, {})

    if( isEmpty(pendingForInsurance)) return null;


    return (
      <div>
        {
          map(pendingForInsurance, (v, mortgageId) => {
            const mortgage = sGet(['mortgage', mortgageId]);
            const property = sGet(['data', 'properties', mortgage['propertyId']])
            const insuranceOfferOk = get(v, ['conditions', 'insuranceOfferOk']) || false;
            if(insuranceOfferOk) return <div key={mortgageId}><strong>Request {mortgageId} is approved!</strong></div>;
            return (
              <div key={mortgageId} style={{textAlign: 'justify'}}>
                Mortgage id {mortgageId} is waiting for insurance offers:
                <div style={{margin: '10px'}}><strong>Full Name: </strong>{mortgage.user.fullName}</div>
                <div style={{margin: '10px'}}><strong>Address: </strong>{property['address']}</div>
                <div style={{margin: '10px'}}><strong>Mortgage amount: </strong>{numeral(mortgage.data.mortgageAmount).format()}</div>
                <div className="btn btn-primary" onClick={this.sendInsuranceOffer(mortgageId, "Offer 1")}>Send offer</div>
              </div>
            )
          })
        }
      </div>
    )
  }
}