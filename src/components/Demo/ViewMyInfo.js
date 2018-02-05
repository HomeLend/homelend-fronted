import React, { Component } from 'react';
// import { Container, Row, Col } from 'reactstrap';
import { setData } from '../../reducers/generalData'
import POST from '../../ajax/post';
import GET from '../../ajax/get';
import { sGet } from '../../data/constants'
import { map, get } from 'lodash'
import { addTrack } from '../../reducers/tracker';
import numeral from 'numeral';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import { Container, Row, Col } from 'reactstrap';

export default class ViewMyInfo extends Component {
    constructor(props) {
        super(props);

        const { email, type } = this.props;
        this.state = {};
        this.state.email = email;

        this.pullData = (email) => {
            if (this.state.loading == true)
                return;

            this.setState({ loading: true });
            GET(`${type}/properties?email=${email}`, (r, s) => {
                this.setState({ loading: false, myInfo: s === 200 ? r : false });
            })
        }
    }
    render() {
        if (this.state.loading) return <LoadingIndicator />

        const myInfo = this.state.myInfo;
        const email = this.state.email;
        if (email != null && email.length > 0 && myInfo == null)
            this.pullData(email);

        return (
            <div>
                {
                    myInfo != null &&
                    <div>
                        <div style={{textAlign: 'initial', background: '#eee', padding: '15px'}}><strong>Balance:</strong> {myInfo.Balance} </div>
                        <Container className="mt-4 align-items-center">
                            <Row style={{marginBottom: '30px'}}>
                                <Col xs='3'><strong>Hash</strong></Col>
                                <Col xs='3'><strong>Address</strong></Col>
                                <Col xs='3'><strong>Price</strong></Col>
                                <Col xs='3'><strong>Photo</strong></Col>
                            </Row>
                            {map(myInfo.Properties, (v, k) =>
                                <Row key={k} style={{ marginBottom: '20px', height: '40px' }} className="align-items-center">
                                    <Col xs='3'><input style={{border: 'none', maxWidth: '100%', background: 'transparent'}} readOnly value={v.Hash} /></Col>
                                    <Col xs='3'>{v.Address}</Col>
                                    <Col xs='3'>{numeral(v.SellingPrice).format()}</Col>
                                    <Col xs='3' style={{ padding: 0 }}><img style={{ maxHeight: '45px' }} src={`/media/images/properties/${k}.jpg`} alt="" /></Col>
                                </Row>
                            )}
                        </Container>
                        {(myInfo.Properties == null || myInfo.Properties.length == 0) &&
                            <div>
                                <strong>No properties</strong> 
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}