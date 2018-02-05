import React, { Component } from 'react';
// import Form from '../../components/Smartforms';
import { map } from 'lodash';
import { sGet } from '../../data/constants';

export default class Tracker extends Component {
  render() {
    let tracker = {...sGet('tracker')};

    return (
      <div>
        {map(tracker, (v, k) => (
          <div className="w-100 trackerRow" key={k}>
            <strong>{v.type + ` `}</strong>
            {v.data && JSON.stringify(v.data)}
          </div>
        ))}
      </div>
    )
  }
}