import React, { Component } from 'react';
import Form from '../../components/Smartforms';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import POST from '../../ajax/post';
import { getFormData } from '../../components/Smartforms/functions';
import { addTrack } from '../../reducers/tracker';
import { simulateDelay, sGet } from '../../data/constants';
import { map } from 'lodash';
import { setData } from '../../reducers/generalData'
import ViewMyInfo from './ViewMyInfo'

let sellerInputs = {
  fields: [
    { name: 'address', default: 'Zhabutinski 25, Ofaqim', type: 'text', label: 'Property address' },
    { name: 'fullName', default: 'Vinod Morkile', type: 'text', label: `Full name`, size: 6 },
    { name: 'email', default: 'bobby@gmail.com', type: 'text', label: `E-mail`, size: 6 },
    { name: 'idNumber', default: 312170632, type: 'number', label: `ID number`, size: 6 },
    { name: 'sellingPrice', default: 122000, type: 'number', label: `Property's price`, size: 6 },
  ]
}

let sellerEmail = localStorage.getItem("sellerEmail");
if (sellerEmail) {
  map(sellerInputs.fields, v => {
    if (v.name === 'email') v.default = sellerEmail;
  })
}

export default class Seller extends Component {
  constructor(props) {
    super(props);

    this.state = { view: 'main', myInfoKey: 1 };

    this.addProperty = () => async () => {
      this.setState({ view: 'loading' })
      await simulateDelay(); // for development
      const formData = getFormData("sell");
      POST(`seller/advertise`, formData, (r, s) => {
        localStorage.setItem('sellerEmail', formData.email);
        console.log(r, s);
        addTrack({ type: 'New property', data: formData });
        this.setState({ view: 'main', myInfo: formData });
        setData({ loadProperties4Sale: true });
      })
    }

    this.logout = () => async () => {
      localStorage.removeItem('sellerEmail');   
      this.setState({ view: 'main', myInfo: null });         
    }
  }
  render() {
    const { view, myInfo } = this.state;
    let myInfoKey = this.state.myInfoKey;

    const updateSellerInfo = sGet('data.updateSellerInfo');
    if(updateSellerInfo == true){
      setData({updateSellerInfo : false});
      myInfoKey++;
      this.setState({ myInfoKey: myInfoKey });         
      
    }
    
    return (
      <div style={{minHeight: 'calc(100% - 80px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {
          view === 'main' && myInfo != null &&
          <div>
            Hey, {myInfo.fullName}<br />
            <ViewMyInfo type='seller' email={myInfo.email} key={myInfoKey} />
            <div className="btn btn-danger" onClick={this.logout()}>Logout</div>            
          </div>
        }
        {
          view === 'main' &&
          <div >
            <div className="btn btn-primary" onClick={() => this.setState({ view: 'post' })}>Post a new property</div>
          </div>
        }
        {
          view === 'post' &&
          <div>
            <Form data={sellerInputs} name="sell" />
            <div className="d-flex justify-content-around flex-row">
              <div className="btn btn-primary" onClick={this.addProperty()}>Post</div>
              <div className="btn btn-danger" onClick={() => this.setState({ view: 'main' })}>Cancel</div>
            </div>
          </div>
        }
        {
          view === 'loading' &&
          <div>
            <h3>Posting</h3>
            <div className="w-100">
              <LoadingIndicator />
            </div>
          </div>
        }
      </div>
    )
  }
}