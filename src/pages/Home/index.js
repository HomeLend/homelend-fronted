import React, { Component } from 'react';
// import { Row } from 'reactstrap';
import Seller from '../../components/Demo/Seller';
import Buyer from '../../components/Demo/Buyer/';
import Fi from '../../components/Demo/Fi';
import Government from '../../components/Demo/Government';
import Appraiser from '../../components/Demo/Appraiser';
import CreditRatingAgency from '../../components/Demo/CreditRatingAgency';
import Insurance from '../../components/Demo/Insurance';
import Tracker from '../../components/Demo/Tracker';
// import LoadingIndicator from '../../components/common/LoadingIndicator';

const Card = ({title, style, component}) => (
  <div style={{background: '#fcfcfc', boxShadow: 'rgba(0,0,0,0.2) 1px 1px 3px 1px', margin: '15px', textAlign: 'center', height: 'calc(100% - 30px)', padding: '10px', overflow: "auto", ...style}}>
    <h3 style={{color: 'rgba(100,100,100,0.7)'}}>{title}</h3>
    {component}
  </div>
)



export default class Home extends Component {
  // constructor(props) {
  //   super(props);
  //
  // }
  render() {
    return(
      <div className="d-flex flex-column" style={{height: '100vh', minHeight: '1000px'}}>
        <div style={{height: '33.333%', width: '100%'}} className="d-flex flex-row justify-content-around">
          <div style={{width: '33.333%'}}><Card title={"Seller"} component={<Seller />}/></div>
          <div style={{width: '33.333%'}}><Card title={"Buyer"} component={<Buyer />} /></div>
          <div style={{width: '33.333%'}}><Card title={"Financial Institution"} component={<Fi />} /></div>
        </div>
        <div style={{height: '66.666%', width: '100%'}} className="d-flex flex-row justify-content-around">
          <div style={{width: '33.333%'}}>
            <Card title={"Insurance body"} style={{height: 'calc(50% - 30px)'}} component={<Insurance />} />
            <Card title={"Credit rating agency"} style={{height: 'calc(50% - 30px)', marginTop: '30px'}} component={<CreditRatingAgency />} />
          </div>
          <div style={{width: '33.333%'}}>
            <Card title={"BlockChain tracker"} component={<Tracker />} />
          </div>
          <div style={{width: '33.333%'}}>
            <Card title={"Government"} style={{height: 'calc(50% - 30px)'}} component={<Government />} />
            <Card title={"Appraiser"} style={{height: 'calc(50% - 30px)', marginTop: '30px'}} component={<Appraiser />} />
          </div>
        </div>
      </div>
    )
  }
}