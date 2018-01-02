import React, { Component } from 'react';
// import { Container, Row, Col } from 'reactstrap';
// import Form from '../../components/Smartforms';
// import POST from '../../ajax/post';
// import { getFormData } from '../../components/Smartforms/functions';
// import { addTrack } from '../../reducers/tracker';
// import { addProperty } from '../../reducers/properties';
// import LoadingIndicator from '../../components/common/LoadingIndicator';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce } from 'lodash';
// import { addTrack } from '../../reducers/tracker';
// import { setApproveCondition } from '../../reducers/mortgage';


export default class Insurance extends Component {
  // constructor(props) {
  //   super(props);
  //
  // }
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

            return (
              <div key={mortgageId} style={{textAlign: 'justify'}}>
                Mortgage id {mortgageId} is waiting for insurance offers:
                <div style={{margin: '10px'}}><strong>Address: </strong>{property['address']}</div>
                <div style={{margin: '10px'}}><strong>Price: </strong>{property['price']}</div>
              </div>
            )
          })
        }
      </div>
    )
  }
}