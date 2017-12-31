import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
// import Form from '../../components/Smartforms';
// import POST from '../../ajax/post';
// import { getFormData } from '../../components/Smartforms/functions';
// import { addTrack } from '../../reducers/tracker';
// import { addProperty } from '../../reducers/properties';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce } from 'lodash';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { addTrack } from '../../reducers/tracker';
import { setCreditRank } from '../../reducers/mortgage';


export default class CreditRankAgency extends Component {
  constructor(props) {
    super(props);

    this.calculateRank = (mortgageId, requestObject) => () => {
      this.setState({calculating: {...this.state.calculating, [mortgageId]: true}})

      // Simulating server response delay
      setTimeout(() => {
        this.setState({calculating: {...this.state.calculating, [mortgageId]: false}})
        setCreditRank({ creditScore: 5, mortgageId});
        addTrack({ type: "Credit score set", data: {mortgageId, creditScore: 5} })
      }, 2000)
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
        Gov
      </div>
    )
  }
}