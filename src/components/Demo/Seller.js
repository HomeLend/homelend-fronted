import React, { Component } from 'react';
import Form from '../../components/Smartforms';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import POST from '../../ajax/post';
import { getFormData } from '../../components/Smartforms/functions';
import { addTrack } from '../../reducers/tracker';
import { simulateDelay } from '../../data/constants';

const sellerInputs = {
  fields: [
    {name: 'address', default: 'Zhabutinski 25, Ofaqim',type: 'text', label: 'Property address'},
    {name: 'price', default: '122000', type: 'number', label: `Property's price`, size: 6},
    {name: 'idnumber', default: '312170632', type: 'number', label: `Government seller ID`, size: 6},
  ]
}

export default class Seller extends Component {
  constructor(props) {
    super(props);

    this.state = {view: 'main'};

    this.addProperty = (trackType) => async () => {
      this.setState({view: 'loading'})
      await simulateDelay(); // for development
      POST(`http://localhost:3000/api/v1/seller/confirmed-requests`, getFormData("sell"), (r, s) => {
        addTrack(trackType, r)
        this.setState({view: 'main'})
      })
    }

  }
  render() {
    const { view } = this.state;
    return (
      <div>
        {
          view === 'main' &&
            <div>
              <div className="btn btn-primary" onClick={() => this.setState({view: 'post'})}>Post a new property</div>
            </div>
        }
        {
          view === 'post' &&
            <div>
              <Form data={sellerInputs} name="sell"/>
              <div className="btn btn-primary" onClick={this.addProperty({type: 'New property'})}>Post a new property</div>
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