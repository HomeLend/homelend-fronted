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

			POST(`creditscore/pull`, {buyerHash: sGet('data.buyerHash')},
        (r, s) => this.setState({data: (s === 200) ? r : false, loading: false}) )
		}

		this.calculateRating = (requestHash) => () => {
			this.setState({calculating: true})

			POST(`creditscore/calculate`, {
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
				<strong>New loan request received</strong>
        <div className="d-flex flex-column align-items-start text-justify mt-2" style={{padding: '15px', background: '#eee', borderRadius: '3px'}}>
          <div className="d-flex flex-row align-items-center" style={{height: '40px'}}><span style={{width: '150px', display: 'inline-block'}}>Loan amount: </span><span>{numeral(data.LoanAmount).format()}</span></div>
          <div className="d-flex flex-row align-items-center" style={{height: '40px'}}><span style={{width: '150px', display: 'inline-block'}}>Buyer salary: </span><span>{numeral(data.Salary).format()}</span></div>
					{ calculating ? <LoadingIndicator/> :
						<div className="w-100 d-flex flex-row justify-content-center">
							<div style={{marginTop: '1em', maxWidth: '350px'}} onClick={this.calculateRating(data.Hash)} className="btn btn-primary">Calculate credit rating</div>
						</div>
					}
        </div>
      </div>
    )
  }
}