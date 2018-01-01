import React, { Component } from 'react';
// import { Container, Row, Col } from 'reactstrap';
// import Form from '../../components/Smartforms';
// import POST from '../../ajax/post';
// import { getFormData } from '../../components/Smartforms/functions';
// import { addTrack } from '../../reducers/tracker';
// import { addProperty } from '../../reducers/properties';
// import LoadingIndicator from '../../components/common/LoadingIndicator';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce, get } from 'lodash';
import { addTrack } from '../../reducers/tracker';
import { setApproveCondition } from '../../reducers/mortgage';


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

    pendingForApproval = reduce(pendingForApproval, (result, row, key) => {
      if(row.STATUS === 'waitingForApprovals') result[key] = row
      return result
    }, {})

    if( isEmpty(pendingForApproval)) return null;


    return (
      <div>
        {
          map(pendingForApproval, (v, mortgageId) => {
            const mortgage = sGet(['mortgage', mortgageId]);
            const property = sGet(['properties', mortgage['propertyId']])

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