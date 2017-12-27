import React, { Component } from 'react';
import Form from '../../components/Smartforms';
import POST from '../../ajax/post';
import { getFormData } from '../../components/Smartforms/functions';
import { addTrack } from '../../reducers/tracker';

export default class Seller extends Component {
  constructor(props) {
    super(props);

    this.addTrack = (trackType) => () => {
      POST(`http://localhost:3000/api/v1/seller/confirmed-requests`, getFormData("sell"), console.log)
      addTrack({type: "ADD_TRACK", data: trackType})
    }

  }
  render() {
    const sellerInputs = {
      fields: [
        {name: 'address', default: 'Zhabutinski 25, Ofaqim',type: 'text', label: 'Property address'},
        {name: 'price', default: '122000', type: 'number', label: `Property's price`, size: 6},
        {name: 'idnumber', default: '312170632', type: 'number', label: `Government seller ID`, size: 6},
      ]
    }
    return (
      <div>
        <Form data={sellerInputs} name="sell" />
        <div className="btn btn-secondary" onClick={this.addTrack('New property')}>Post a new property</div>
      </div>
    )
  }
}