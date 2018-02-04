import React, { Component } from 'react';
import { sGet } from '../../data/constants';
import { isEmpty, map, reduce, get } from 'lodash';
import { addTrack } from '../../reducers/tracker';
import { setApproveCondition, finishContract } from '../../reducers/mortgage';
import POST from '../../ajax/post';
import GET from '../../ajax/get';
import { setData } from '../../reducers/generalData'
import Form from '../../components/Smartforms';
import { getFormData } from '../../components/Smartforms/functions';
import LoadingIndicator from '../../components/common/LoadingIndicator';

const execFinishContract = (mortgageId) => () => {
  addTrack({ type: `Government approved ownership title transferal`, data: { mortgageId } })
  finishContract(mortgageId);
  addTrack({ type: `Financial institution has transferred funds to seller`, data: { mortgageId } })
  addTrack({ type: `Mortgage process is now active, monthly payments are required`, data: { mortgageId } })
  addTrack({ type: `Smart contract sealed`, data: { mortgageId } })
}

const govFromData = {
  fields: [
    { name: 'checkHouseOwner', type: 'checkbox', label: 'Check house owner' },
    { name: 'checkLien', type: 'checkbox', label: 'Check lien' },
    { name: 'checkWarningShot', type: 'checkbox', label: 'Check warning shot' },
  ]
}

export default class Government extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.govData = {};
    this.state.loading = false;

    this.approveCondition = (mortgageHash, userHash, mortgageIndex) => () => {
      const formData = getFormData(mortgageIndex);
      const postData = {
        buyerHash: userHash,
        requestHash: mortgageHash,
        checkHouseOwner: formData.checkHouseOwner == 1,
        checkLien: formData.checkLien == 1,
        checkWarningShot: formData.checkWarningShot == 1
      };

      this.setState({ loading: true });

      POST('government/updateRequest', postData, (r, s) => {
        this.setState({ loading: false });

        if (s !== 200) {
          this.setState({ loading: false });
          return alert("Oops, status " + s);
        }

        let approveString = JSON.stringify(formData);
        setApproveCondition(mortgageHash, approveString);
        setData({ UiState: 'GovernmentSettedOffer' });
        this.pullData();

        addTrack({ type: `Government approved ${approveString}`, data: { mortgageHash } });
      });
    }

    this.pullData = () => {
      setData({ governmentPullData: 'false' });

      GET(`government/pending`, (r, s) => {
        console.log(r, s);
        if (s !== 200) {
          this.setState({ loading: false });
          return alert("Oops, status " + s);
        }

        this.setState({ loading: false });
        if (r != null && r.length > 0) {
          let lastRequest = r[r.length - 1]
          this.setState({ govData: [lastRequest] });
        }
        else
          this.setState({ govData: [] });

      });
    }
  }
  render() {
    let pendingForApproval = { ...sGet('mortgage') };
    let readyToTransferTitle = { ...sGet('mortgage') };

    if (this.state.loading) return <LoadingIndicator />
    pendingForApproval = reduce(pendingForApproval, (result, row, key) => {
      if (row.STATUS === 'waitingForApprovals') result[key] = row
      return result
    }, {})


    readyToTransferTitle = reduce(readyToTransferTitle, (result, row, key) => {
      if (row.STATUS === 'inContract') result[key] = row
      return result
    }, {})


    // if (!isEmpty(readyToTransferTitle)) return (
    //   <div>
    //     {map(readyToTransferTitle, (v, k) =>
    //       <div key={k} onClick={execFinishContract(k)} className="btn btn-primary">
    //         Approve title ownership transfer to {v.user.fullName}
    //       </div>
    //     )}
    //   </div>
    // );

    const shouldPullData = sGet('data.governmentPullData');
    if (shouldPullData == true) {
      this.pullData();
    }

    let pending = this.state.govData;
    if (isEmpty(pending)) return null;


    return (
      <div>
        {
          map(pending, (v, mortgageIndex) => {


            const mortgage = v.RequestHash;
            const userHash = v.UserHash;

            return (
              <div key={mortgageIndex} style={{ textAlign: 'justify', border: '1px solid black', padding: '0.9em' }}>
                <span>MortgageId: {mortgage}</span>
                <Form data={govFromData} name={mortgageIndex} />
                <div key={mortgageIndex + "x"} className="btn btn-primary mt-1" style={{ width: '80%' }} onClick={this.approveCondition(mortgage, userHash, mortgageIndex)} >Send</div>
              </div>
            )

            // if(!propertyValue) return null;

            // if(approve1 && approve2) return <div key={mortgageId}><strong>Request {mortgageId} is approved!</strong></div>;
            // return (
            //   <div key={mortgageId} style={{textAlign: 'justify'}}>
            //     Mortgage id {mortgageId} is ready for approval:
            //     <div style={{margin: '10px'}}><strong>Address: </strong>{property['address']}</div>
            //     <div>{approve1 ? null : <div onClick={this.approveCondition(mortgageId, "approve1")} className="btn btn-primary w-100 mt-2">Seller is the rightful owner of the property</div>}</div>
            //     <div>{approve2 ? null : <div onClick={this.approveCondition(mortgageId, "approve2")} className="btn btn-primary w-100 mt-2">The property is not bound to any debt</div>}</div>
            //   </div>
            // )
          })
        }
      </div>
    )
  }
}