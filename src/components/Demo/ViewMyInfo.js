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
                        <div> <strong>My info: </strong> Balance : {myInfo.Balance} </div>
                        <div className="mt-4 d-flex flex-column align-items-center">
                            {map(myInfo.Properties, (v, k) =>
                                <Row key={k} style={{ marginBottom: '20px' }}>
                                    <Col>{v.Hash}</Col>
                                    <Col>{v.Address}</Col>
                                    <Col>{numeral(v.SellingPrice).format()}</Col>
                                    <Col style={{ maxWidth: '75px', padding: 0 }}><img style={{ maxHeight: '45px' }} src={`/media/images/properties/${k}.jpg`} alt="" /></Col>
                                </Row>
                            )}
                        </div>
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