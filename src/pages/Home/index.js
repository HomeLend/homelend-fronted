import React, { Component } from 'react';
// import { Row } from 'reactstrap';
import Seller from '../../components/Demo/Seller';
import { map } from 'lodash';
// import LoadingIndicator from '../../components/common/LoadingIndicator';

const Card = ({title, style, component}) => (
  <div style={{background: '#fcfcfc', boxShadow: 'rgba(0,0,0,0.2) 1px 1px 3px 1px', margin: '15px', textAlign: 'center', height: 'calc(100% - 30px)', padding: '10px', ...style}}>
    <h3 style={{color: 'rgba(100,100,100,0.7)'}}>{title}</h3>
    {component}
  </div>
)



export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracker: []
    };
  }
  Tracker = () => {
    return (
      <div>
        {map(this.state.tracker, (v, k) => (
          <div className="w-100" style={{background: 'gray', color: 'white', padding: '10px', margin: '5px'}} key={k}>{v.type}</div>
        ))}
      </div>
    )
  }
  render() {
    const { Tracker } = this;
    return(
      <div className="d-flex flex-column" style={{height: '100vh'}}>
        <div style={{height: '33.333%', width: '100%'}} className="d-flex flex-row justify-content-around">
          <div style={{width: '33.333%'}}><Card title={"Seller"} component={<Seller />}/></div>
          <div style={{width: '33.333%'}}><Card title={"Buyer"} /></div>
          <div style={{width: '33.333%'}}><Card title={"Financial Institution"} /></div>
        </div>
        <div style={{height: '66.666%', width: '100%'}} className="d-flex flex-row justify-content-around">
          <div style={{width: '33.333%'}}>
            <Card title={"Insurance body"} style={{height: 'calc(50% - 30px)'}} />
            <Card title={"Escrow account"} style={{height: 'calc(50% - 30px)', marginTop: '30px'}} />
          </div>
          <div style={{width: '33.333%'}}>
            <Card title={"BlockChain tracker"} component={Tracker()} />
          </div>
          <div style={{width: '33.333%'}}>
            <Card title={"Government"} style={{height: 'calc(50% - 30px)'}} />
            <Card title={"Appraiser"} style={{height: 'calc(50% - 30px)', marginTop: '30px'}} />
          </div>
        </div>
      </div>
    )
  }
}