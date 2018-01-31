import React, { Component } from 'react';
import { sGet } from '../../data/constants';
import { isEmpty } from 'lodash';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import POST from '../../ajax/post';
import numeral from 'numeral';
import { setData } from '../../reducers/generalData'
// import { socket } from '../../index';


export default class CreditRatingAgency extends Component {
  constructor(props) {
		super(props);
		this.state = {}

		this.fetchData = () => {
			if (this.state.loading) return;
			this.setState({loading: true})

			POST(`${'http://localhost:3000'}/api/v1/creditscore/pull`, {buyerHash: sGet('data.buyerHash')},
        (r, s) => this.setState({data: (s === 200) ? r : false, loading: false}) )
		}

		this.calculateRating = (requestHash) => () => {
			this.setState({calculating: true})

			POST(`${'http://localhost:3000'}/api/v1/creditscore/calculate`, {
				licenseNumber: '125',
				name: 'DummyCreditRankAgency',
				userHash: sGet('data.buyerHash'),
				requestHash,
			}, (r, s) => {
				this.setState({calculating: false})
				if(s === 200 || true)
				{
          setData({UiState: 'FinancialInstitution', fiPullData : true});
				}
      });

		}
	}
  render() {
    if(sGet('data.UiState') !== 'creditRating') return null;

    const { loading, calculating, data = {}} = this.state;
    if(loading) return <LoadingIndicator/>;
    if(isEmpty(data)) this.fetchData();


    return (
      <div>
        <div onClick={this.fetchData}>FETCH</div>
        <div className="d-flex flex-column align-items-start text-justify">
          <div><span style={{width: '100px', display: 'inline-block'}}>Loan amount: </span><span>{numeral(data.LoanAmount).format()}</span></div>
          <div><span style={{width: '100px', display: 'inline-block'}}>Time: </span><span>{data.Timestamp}</span></div>
        </div>
				{ calculating ? <LoadingIndicator/> :
          <div style={{marginTop: '1em'}} onClick={this.calculateRating(data.Hash)} className="btn btn-primary">Calculate rating</div>
				}
      </div>
    )
  }
}