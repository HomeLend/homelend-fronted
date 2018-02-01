import React, { Component } from 'react';
// import { Container, Row, Col } from 'reactstrap';
import { setData } from '../../../reducers/generalData'
import POST from '../../../ajax/post';
import { sGet } from '../../../data/constants'
import { map, get } from 'lodash'
import { addTrack } from '../../../reducers/tracker';
import numeral from 'numeral';
import LoadingIndicator from '../../../components/common/LoadingIndicator';

export default class AppraiserStep extends Component {
  constructor(props) {
    super(props);

		const { requestHash } = this.props;
    this.state = {};

    this.chooseAppraiser = appraiserHash => () => {

      this.setState({ loading: true });

      POST(`buyer/selectAppraiser`, {
				email: sGet('data.buyerEmail'),
				appraiserHash,
        requestHash
      }, (r, s) => {
        if(s !== 200) return alert(s + ' ' + r);

        this.setState({ loading: false });

				setData({UiState: 'appraiserAppraisalWaiting'});
				addTrack({type: "Chose Appraiser", data:{appraiserHash, mortgageId: this.props.mortgageId} })
        // עצרנו כאן
        // The email of the buyer is sent in the appraiser's component instead of the chosen appraisers email
        // Save the selected appraiser's email as well and send it instead of the buyer's
      })
    }
  }
  render() {
    if (this.state.loading) return <LoadingIndicator />

    const { appraisersList } = this.props;
    const appraiserChosen = sGet(['mortgage', this.props.requestHash, 'appraiser']);

    const evaluation = get(appraiserChosen, 'value') || false;

    if(appraiserChosen) {
      return (
        <div>
          <div>You chose <strong>{appraisersList[appraiserChosen.appraiserId].name}</strong> to evaluate your desired property.</div>
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
          {map(appraisersList, (v,k) =>
            <div key={k} className="btn btn-primary mt-1" style={{width: '80%'}} onClick={this.chooseAppraiser(v.AppraiserHash)} >Choose {v.FirstName + ' ' + v.LastName}</div>
          )}
        </div>
      </div>
    )
  }
}