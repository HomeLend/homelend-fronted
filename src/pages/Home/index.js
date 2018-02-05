import React, { Component } from 'react';
import Seller from '../../components/Demo/Seller';
import Buyer from '../../components/Demo/Buyer/';
import Fi from '../../components/Demo/Fi';
import Government from '../../components/Demo/Government';
import Appraiser from '../../components/Demo/Appraiser';
import CreditRatingAgency from '../../components/Demo/CreditRatingAgency';
import Insurance from '../../components/Demo/Insurance';
import Tracker from '../../components/Demo/Tracker';

const Card = ({title, style, component}) => (
  <div style={{background: '#fcfcfc', boxShadow: 'rgba(0,0,0,0.2) 1px 1px 3px 1px', textAlign: 'center', padding: '10px', overflow: "auto", position: 'relative', ...style}}>
    <h3 style={{color: 'rgba(100,100,100,0.7)'}}>{title}</h3>
    {component}
  </div>
)

export default class Home extends Component {
  render() {
    return(
      <div style={{height: '100vh', minHeight: '1000px', display: 'grid', gridTemplateColumns: 'auto auto auto', gridTemplateRows: 'auto auto auto', gridGap: '15px', padding: '10px'}}>
        <Card title={"Seller"} component={<Seller />}/>
        <Card title={"Buyer"} component={<Buyer />} />
        <Card title={"Financial Institution"} component={<Fi />} />
        <Card title={"Insurance body"} component={<Insurance />} />
        <Card title={"BlockChain tracker"} style={{gridRow: '2/4', gridColumnStart: '2'}} component={<Tracker />} />
        <Card title={"Credit rating agency"} component={<CreditRatingAgency />} />
        <Card title={"Government"} component={<Government />} />
        <Card title={"Appraiser"} component={<Appraiser />} />
      </div>
    )
  }
}