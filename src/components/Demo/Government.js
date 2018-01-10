import React, { Component } from 'react';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce, get } from 'lodash';
import { addTrack } from '../../reducers/tracker';
import { setApproveCondition, finishContract } from '../../reducers/mortgage';


const execFinishContract = (mortgageId) => () => {
  addTrack({ type: `Government approved ownership title transferal`, data: {mortgageId} })
  finishContract(mortgageId);
  addTrack({ type: `Financial institution has transferred funds to seller`, data: {mortgageId} })
  addTrack({ type: `Mortgage process is now active, monthly payments are required`, data: {mortgageId} })
  addTrack({ type: `Smart contract sealed`, data: {mortgageId} })
}

export default class Government extends Component {
  constructor(props) {
    super(props);

    this.approveCondition = (mortgageId, approveString) => () => {
      setApproveCondition(mortgageId, approveString);
      addTrack({ type: `Government approved ${approveString}`, data: {mortgageId} })
    }

  }
  render() {
    let pendingForApproval = {...sGet('mortgage')};
    let readyToTransferTitle = {...sGet('mortgage')};

    pendingForApproval = reduce(pendingForApproval, (result, row, key) => {
      if(row.STATUS === 'waitingForApprovals') result[key] = row
      return result
    }, {})


    readyToTransferTitle = reduce(readyToTransferTitle, (result, row, key) => {
      if(row.STATUS === 'inContract') result[key] = row
      return result
    }, {})


    if( !isEmpty(readyToTransferTitle)) return (
      <div>
        {map(readyToTransferTitle, (v, k) =>
          <div key={k} onClick={execFinishContract(k)} className="btn btn-primary">
            Approve title ownership transfer to {v.user.fullName}
          </div>
        )}
      </div>
    );


    if( isEmpty(pendingForApproval)) return null;


    return (
      <div>
        {
          map(pendingForApproval, (v, mortgageId) => {
            const mortgage = sGet(['mortgage', mortgageId]);
            const property = sGet(['data', 'properties', mortgage['propertyId']])

            const approve1 = get(v, ['conditions', 'approve1']) || false;
            const approve2 = get(v, ['conditions', 'approve2']) || false;

            const propertyValue = get(v, ['appraiser', 'value']) || false;

            if(!propertyValue) return null;

            if(approve1 && approve2) return <div key={mortgageId}><strong>Request {mortgageId} is approved!</strong></div>;
            return (
              <div key={mortgageId} style={{textAlign: 'justify'}}>
                Mortgage id {mortgageId} is ready for approval:
                <div style={{margin: '10px'}}><strong>Address: </strong>{property['address']}</div>
                <div>{approve1 ? null : <div onClick={this.approveCondition(mortgageId, "approve1")} className="btn btn-primary w-100 mt-2">Seller is the rightful owner of the property</div>}</div>
                <div>{approve2 ? null : <div onClick={this.approveCondition(mortgageId, "approve2")} className="btn btn-primary w-100 mt-2">The property is not bound to any debt</div>}</div>
              </div>
            )
          })
        }
      </div>
    )
  }
}