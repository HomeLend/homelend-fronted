import React from 'react';
import { sGet } from '../../../data/constants'
import { map } from 'lodash'
import Fa from '@fortawesome/react-fontawesome';
import { faCheck, faCircle } from '@fortawesome/fontawesome-free-solid'

const conditions = [
  { condition: 'approve1', text: 'Seller is the rightful owner of the property' },
  { condition: 'approve2', text: 'The property is not bound to any debt' },
  { condition: 'approve3', text: 'The property is worth at least XXX amount (Appraiser)' },
  { condition: 'approve4', text: 'The structure is built according to official specifications' },
]

const MortgageSmartContract = ({ requestId }) => {
  let isNotSatisfied = false;
  map(conditions, v => {isNotSatisfied = isNotSatisfied || !sGet(['mortgage', requestId, 'conditions', v.condition])})
  return (
    <div>
      <h5>Your mortgage request is pending for approval</h5>
      <div className="d-flex flex-column text-justify mt-5">
        {map(conditions, (v, k) =>
          <div key={k}>
            {sGet(['mortgage', requestId, 'conditions', v.condition]) ?
              <Fa icon={faCheck} style={{margin: '0 10px'}} /> :
              <Fa icon={faCircle} style={{margin: '0 10px'}} />} {v.text}
          </div>
        )}
        {!isNotSatisfied && "Ok, continue"}
      </div>
    </div>
  )
}

export default MortgageSmartContract;