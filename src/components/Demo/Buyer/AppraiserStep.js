import React, { Component } from 'react';
// import { Container, Row, Col } from 'reactstrap';
import { sGet } from '../../../data/constants'
import { map, get } from 'lodash'
import { addTrack } from '../../../reducers/tracker';
import { setAppraiser } from '../../../reducers/mortgage';
import numeral from 'numeral';

export default class AppraiserStep extends Component {
  constructor(props) {
    super(props);

    this.getAppraisers = () => ({
      "1": {name: 'Dani Kodady'},
      "2": {name: 'Aji Benbajo'},
    })


    this.chooseAppraiser = id => () => {
      addTrack({type: "Chose Appraiser", data:{appraiserId: id, mortgageId: this.props.mortgageId} })
      setAppraiser(this.props.mortgageId, id)
    }
  }
  render() {
    const appraiserChosen = sGet(['mortgage', this.props.mortgageId, 'appraiser']);

    const evaluation = get(appraiserChosen, 'value') || false;

    if(appraiserChosen) {
      return (
        <div>
          <div>You chose <strong>{this.getAppraisers()[appraiserChosen.appraiserId].name}</strong> to evaluate your desired property.</div>
          {!evaluation ?
            <div className="mt-3 text-justify">Waiting for Appraiser's evaluation...</div> :
            <div>
              Evaluation is set at <strong>{numeral(evaluation).format()}</strong>
            </div>
          }
        </div>
      )
    }
    return (
      <div>
        <strong>Choose an appraiser to estimate the value of the property</strong>
        <div className="mt-4 d-flex flex-column align-items-center">
          {map(this.getAppraisers(), (v,k) =>
            <div key={k} className="btn btn-primary mt-1" style={{width: '80%'}} onClick={this.chooseAppraiser(k)} >Choose {v.name}</div>
          )}
        </div>
      </div>
    )
  }
}