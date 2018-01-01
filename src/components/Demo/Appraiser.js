import React, { Component } from 'react';
// import { Container, Row, Col } from 'reactstrap';
import Form from '../../components/Smartforms';
// import POST from '../../ajax/post';
import { getFormData } from '../../components/Smartforms/functions';
// import { addTrack } from '../../reducers/tracker';
// import { addProperty } from '../../reducers/properties';
// import LoadingIndicator from '../../components/common/LoadingIndicator';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce, get } from 'lodash';
import { addTrack } from '../../reducers/tracker';
import { appraiserEvaluation } from '../../reducers/mortgage';


const propertyWorth = {
  fields: [
    {name: 'worth', default: 0,type: 'number', label: 'Property overall worth'},
  ]
}

export default class Government extends Component {
  constructor(props) {
    super(props);

    this.approveCondition = (mortgageId) => () => {
      const val = getFormData('worth')
      appraiserEvaluation(mortgageId, val.worth);
      addTrack({ type: `Appraiser evaluated property`, data: {mortgageId, value: val.worth} })
    }

  }
  render() {
    let pendingForApproval = {...sGet('mortgage')};

    pendingForApproval = reduce(pendingForApproval, (result, row, key) => {
      if(row.STATUS === 'waitingForApprovals') {
        // Check if appraiser is chosen
        if(get(row, ['appraiser']))
          result[key] = row;
      }
      return result
    }, {})

    if( isEmpty(pendingForApproval)) return null;

    return (
      <div>
        {
          map(pendingForApproval, (v, mortgageId) => {
            const mortgage = sGet(['mortgage', mortgageId]);
            const property = sGet(['properties', mortgage['propertyId']])

            const evaluation = get(v, ['appraiser', 'value']) || false;

            if(evaluation) return <div key={mortgageId}><strong>Request {mortgageId} is evaluated!</strong></div>;
            return (
              <div key={mortgageId} style={{textAlign: 'justify'}}>
                Mortgage id {mortgageId} is ready for inspection:
                <div style={{margin: '10px'}}><strong>Address: </strong>{property['address']}</div>
                  {evaluation ? null :
                    <div>
                      <Form data={propertyWorth} name="worth" />
                      {sGet(['forms', 'worth', 'worth']) >= parseInt(property.price, 10) ?
                        <div onClick={this.approveCondition(mortgageId, "approve3")} className={`btn btn-primary w-100 mt-2 ${sGet(['forms', 'worth', 'worth']) < 100 ? 'disabled' : ''}`}>The property is worth at least {property['price']} amount</div>:
                        <div className="btn btn-danger w-100 mt-2" style={{border: 'none'}} onClick={() => alert("This will terminate the contract!")}>The property is worth less than {property['price']}</div>
                      }
                    </div>
                  }
              </div>
            )
          })
        }
      </div>
    )
  }
}