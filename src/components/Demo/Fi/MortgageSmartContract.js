import { sGet } from '../../../data/constants'
import { map, template } from 'lodash'
import Fa from '@fortawesome/react-fontawesome';
import { faCheck, faCircle } from '@fortawesome/fontawesome-free-solid'
import { addTrack } from '../../../reducers/tracker';
import { createContract } from '../../../reducers/mortgage';
import numeral from 'numeral';
import { filter } from 'lodash'
import POST from '../../../ajax/post';
import { setData } from '../../../reducers/generalData';
import LoadingIndicator from '../../../components/common/LoadingIndicator';
import React, { Component } from 'react';


const conditions = {

  propertyValueOk: { text: 'The property is worth at least ${propertyPrice} amount' }, // eslint-disable-line
  insuranceOfferOk: { text: 'The buyer purchased an insurance for the mortgage' },
  CheckHouseOwner: { text: 'Seller is the rightful owner of the property' },
  CheckWarningShot: { text: "The proprty doesn't have any warning shot" },
  CheckLien: { text: 'The property is not bound to any debt' }
}

export default class MortgageSmartContract extends Component {
  constructor(props) {
    super(props);
    this.state = {};


    this.createNewContract = (buyerHash, hash) => () => {
      this.setState({ loading: true });

      POST(`bank/runChaincode`, { userHash: buyerHash, requestHash: hash, swiftNumber: 12345 }, (r, s) => {
        this.setState({ loading: false });
        if (s !== 200) {
          return alert("Oops, status " + s);
        }

        setData({ UiState: 'ViewMyInfo',updateSellerInfo : true });
        addTrack({ type: "Created Smart Contract between seller, buyer and financial institution", data: { buyerHash, hash } })
        //createContract(hash)
      });
    }

    this.approveLoan = (buyerHash, hash) => () => {
      this.setState({ loading: true });

      POST(`bank/approve`, { userHash: buyerHash, requestHash: hash, swiftNumber: 12345 }, (r, s) => {
        this.setState({ loading: false });
        if (s !== 200) {
          return alert("Oops, status " + s);
        }
        setData({reloadBankSmartContract : true});
        addTrack({ type: "Loan approved", data: { buyerHash, hash } });

        //createContract(hash);
      });
    };
  }
  render() {
    const { requestId, data } = this.props;
    let isApproved = false;
    if (this.state.loading == true) return <LoadingIndicator />
    const mortgage = sGet(['mortgage', requestId]);
    const insOffers = filter(data.InsuranceOffers, { Hash: data.SelectedInsuranceOfferHash });
    const insOffer = insOffers != null && insOffers > 0 ? insOffers[0] : null;
    return (
      <div>
        <div className="d-flex flex-column text-justify mt-5">
          {
            <div>
              {data.GovernmentResultsData.CheckLien ?
                <Fa icon={faCheck} style={{ margin: '0 10px' }} /> :
                <Fa icon={faCircle} style={{ margin: '0 10px' }} />} {template(conditions.CheckLien.text)({ propertyPrice: numeral(data.LoanAmount).format() })}
            </div>
          }

          {
            <div>
              {data.GovernmentResultsData.CheckHouseOwner ?
                <Fa icon={faCheck} style={{ margin: '0 10px' }} /> :
                <Fa icon={faCircle} style={{ margin: '0 10px' }} />} {template(conditions.CheckHouseOwner.text)({ propertyPrice: numeral(data.LoanAmount).format() })}
            </div>
          }

          {
            <div>
              {data.GovernmentResultsData.CheckWarningShot ?
                <Fa icon={faCheck} style={{ margin: '0 10px' }} /> :
                <Fa icon={faCircle} style={{ margin: '0 10px' }} />} {template(conditions.CheckWarningShot.text)({ propertyPrice: numeral(data.LoanAmount).format() })}
            </div>
          }

          {data.Status == 'REQUEST_GOVERNMENT_PROVIDED' && <div>
            <h5>The mortgage request is pending for approval</h5>
            <div className="btn btn-primary" onClick={this.approveLoan(data.BuyerHash, data.Hash, data)}>Approve Loan</div>
          </div>}

          {(data.Status == 'REQUEST_APPROVED_BY_BANK') && <div>
            <div className="btn btn-primary" onClick={this.createNewContract(data.BuyerHash, data.Hash)}>Create contract between seller - buyer - financial institution</div>
          </div>}
        </div>
      </div>
    )
  }
}
