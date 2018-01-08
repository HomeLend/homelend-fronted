import React from 'react';
import { sGet } from '../../../data/constants'
import { map, template } from 'lodash'
import Fa from '@fortawesome/react-fontawesome';
import { faCheck, faCircle } from '@fortawesome/fontawesome-free-solid'
import { addTrack } from '../../../reducers/tracker';
import { createContract } from '../../../reducers/mortgage';
import numeral from 'numeral';

const conditions = [
  { condition: 'propertyValueOk', text: 'The property is worth at least ${propertyPrice} amount' }, // eslint-disable-line
  { condition: 'insuranceOfferOk', text: 'The buyer purchased an insurance for the mortgage' },
  { condition: 'approve1', text: 'Seller is the rightful owner of the property' },
  { condition: 'approve2', text: 'The property is not bound to any debt' },
]

const createNewContract = (mortgageId) => () => {
  addTrack({type: "Created Smart Contract between seller, buyer and financial institution", data:{mortgageId} })
  createContract(mortgageId)
}

const MortgageSmartContract = ({ requestId }) => {
  let isNotSatisfied = false;
  const mortgage = sGet(['mortgage', requestId]);
  map(conditions, v => {isNotSatisfied = isNotSatisfied || !sGet(['mortgage', requestId, 'conditions', v.condition])})
  return (
    <div>
      <h5>The mortgage request is pending for approval</h5>
      <div className="d-flex flex-column text-justify mt-5">
        {
          map(conditions, (v, k) =>
            <div key={k}>
              {sGet(['mortgage', requestId, 'conditions', v.condition]) ?
                <Fa icon={faCheck} style={{margin: '0 10px'}} /> :
                <Fa icon={faCircle} style={{margin: '0 10px'}} />} {template(v.text)({ propertyPrice: numeral(mortgage.data.mortgageAmount).format() })}
            </div>
          )
        }
        {!isNotSatisfied && <div>
          <div className="btn btn-primary" onClick={createNewContract(requestId)}>Create contract between seller - buyer - financial institution</div>
        </div>}
      </div>
    </div>
  )
}

export default MortgageSmartContract;