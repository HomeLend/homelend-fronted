import React, { Component } from 'react';
import Form from '../../Smartforms/index';
import { Container, Row, Col } from 'reactstrap';
import { sGet } from '../../../data/constants'
import { isEmpty, map, get, filter } from 'lodash'
import POST from '../../../ajax/post';
import GET from '../../../ajax/get';
import { getFormData } from '../../Smartforms/functions';
import { addTrack } from '../../../reducers/tracker';
import { requestMortgage, acceptOffer, setApproveCondition } from '../../../reducers/mortgage';
import AppraiserStep from './AppraiserStep';
import Fa from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/fontawesome-free-solid'
import numeral from 'numeral'
import LoadingIndicator from '../../common/LoadingIndicator'
import ViewMyInfo from '../ViewMyInfo'
import { setData } from '../../../reducers/generalData'

const register = {
  fields: [
    { name: 'idnumber', default: '312170632', type: 'number', label: `Government ID`, size: 6 },
    { name: 'fullName', default: 'John Green', type: 'text', label: `Full name`, size: 6 },
    { name: 'email', default: 'JG33@gmail.com', type: 'text', label: `E-mail` },
  ]
}

const buyerRequestMortgage = {
  fields: [
    { name: 'salary', default: '5000', type: 'number', label: `Monthly salary` },
    { name: 'mortgageAmount', default: 1000000, type: 'number', label: `Mortgage amount wanted`, size: 6 },
    { name: 'repaymentYears', default: 25, type: 'number', label: `Repayment years`, size: 6 },
  ]
}

export default class Buyer extends Component {
  constructor(props) {
    super(props);

    this.state = { currentScreen: 'browseProperties', requestId: false }

    this.buyProperty = (propertyId, sellerHash) => () => {
      this.setState({ currentScreen: 'buyerRegister', propertyChosen: propertyId, sellerHash: sellerHash });
    }


    this.register = () => {
      this.setState({ currentScreen: 'requestMortgage' })
    }


    this.requestMortgage = () => {
      const requestDetails = getFormData('requestMortgage');



      this.setState({ loading: true })
      const registerDetails = getFormData('buyerRegister');
      POST(`buyer/buy`, {
        email: registerDetails.email,
        idNumber: registerDetails.idnumber,
        fullName: registerDetails.fullName,
        propertyHash: this.state.propertyChosen,
        sellerHash: this.state.sellerHash,
        salary: requestDetails.salary,
        duration: parseInt(requestDetails.repaymentYears, 10) * 12,
        loanAmount: requestDetails.mortgageAmount,
      }, (r, s) => {
        if (s !== 200) { this.setState({ loading: false }); return alert("Oops, status " + s); }
        const { txId, userHash } = r;
        this.setState({ currentScreen: 'waiting4Offers', loading: false })
        setData({ buyerHash: userHash, buyerEmail: registerDetails.email, UiState: "creditRating" })
        addTrack({ type: "New user", data: { ...registerDetails, userHash } })

        const newRequest = { [txId]: { STATUS: 'pendingForCreditScore', data: requestDetails, user: getFormData('buyerRegister'), propertyId: this.state.propertyChosen } };
        requestMortgage(newRequest)
        addTrack({ type: "Mortgage request", newRequest });
      })

    }

    this.acceptOffer = (requestHash, selectedBankOfferHash) => {
      this.setState({ loading: true });
      setData({ currentRequestId: requestHash });

      POST(`buyer/selectBankOffer`, {
        email: sGet('data.buyerEmail'),
        requestHash,
        selectedBankOfferHash,
      }, (r, s) => {
        if (s !== 200) return alert(s + JSON.stringify(r))
        this.setState({ loading: false, currentScreen: 'chooseAppraiser' })
        addTrack({ type: "Mortgage smart contract created", data: { selectedBankOfferHash } })
        acceptOffer(requestHash, selectedBankOfferHash)
        console.log("Accepted offer from bank id " + selectedBankOfferHash);

        // Start loading the list of appraisers to choose from
        this.loadAppraisers();
      })
    }

    this.acceptInsuranceOffer = (requestHash, insuraceOfferHash) => () => {
      this.setState({ loading: true });
      POST(`buyer/selectInsuranceOffer`, {
        insuranceOfferHash: insuraceOfferHash,
        email: sGet('data.buyerEmail'),
        requestHash: requestHash
      }, (r, s) => {
        this.setState({ loading: false });
        if (s !== 200) return alert("Oops, status " + s);
        setApproveCondition(requestHash, "insuranceOfferOk");
        this.setState({ currentScreen: ''});
        addTrack({ type: "Insurance created", data: { requestHash, insuraceOfferHash } })
        acceptOffer(requestHash, insuraceOfferHash)
        setData({ governmentPullData: true, UiState: '' });
        console.log("Accepted insurance offer from insurance id " + insuraceOfferHash);
      });
    }

    this.loadMyRequests = () => {
      if (this.state.loading == true)
        return;
      this.setState({ loading: true });

      GET(`buyer/myRequests?email=${sGet('data.buyerEmail')}`, (r, s) => {
        this.setState({ loading: false, mortgageOffers: s === 200 ? r : false });
      })
    }

    this.loadProperties4Sale = () => {
      if (this.state.loading == true)
        return;

      this.state.shouldLoadProperties = false;
      setData({ loadProperties4Sale : false });

      this.setState({ loading: true });
      GET(`buyer/properties4Sale`, (r, s) => {
        this.setState({ loading: false, shouldLoadProperties: false, properties: s === 200 ? r : false });
      })
    }

    this.insuranceLoadMyRequests = () => {
      if (sGet('data.insuranceLoadMyRequests') != true) {
        setData({ insuranceLoadMyRequests: true });
        this.loadMyRequests();
      }
    }

    this.loadAppraisers = () => {
      this.setState({ loading: true });
      GET(`buyer/appraisers`, (r, s) => {
        this.setState({ loading: false, appraisersList: s === 200 ? r : false });
      })
    }

  }
  componentWillReceiveProps() {
    const status = sGet(['mortgage', sGet('data.currentRequestId'), 'STATUS']);
    if (status === "inContract" && this.state.currentScreen !== 'waitingForContractExecution') {
      this.setState({ currentScreen: 'waitingForContractExecution' })
    }
    if (status === "waitingForInsurance") {
      this.setState({ currentScreen: 'insurance' })
    }
    if (status === "finished" && this.state.currentScreen !== 'acquisitionFinished') {
      this.setState({ currentScreen: 'acquisitionFinished' })
    }
  }
  render() {
    let { currentScreen, properties, loading = false, mortgageOffers = false, appraisersList = {}, shouldLoadProperties } = this.state;

    const requestHash = sGet('data.currentRequestId');

    const buyerEmail = sGet('data.buyerEmail');

    const buyerHash = sGet('data.buyerHash')
    if (shouldLoadProperties == undefined || shouldLoadProperties === true || sGet('data.loadProperties4Sale') == true) {
      this.loadProperties4Sale();
    }

    if (this.state.loading) return <LoadingIndicator />

    //const properties = sGet(['data', 'properties']);

    if (isEmpty(properties)) return null;

    let mortgage = sGet(['mortgage', requestHash]);
    let insuranceOffers = get(mortgage, ['insuranceOffers']);
    let selectedRequest = {};
    const uiState = sGet('data.UiState');

    if (uiState == "buyerGotInsuranceOffers" || uiState == "buyerGotOffers") {
      mortgageOffers = mortgageOffers || this.loadMyRequests();
    }

    if(uiState == "ViewMyInfo" && buyerEmail != null) return <ViewMyInfo type='buyer' email={buyerEmail} />;
    

    if (uiState === 'buyerGotInsuranceOffers') {
      this.insuranceLoadMyRequests();
      currentScreen = 'insurance';
      mortgageOffers = filter(mortgageOffers, { Status: 'INSURANCE_OFFER_PROVIDED' })

      selectedRequest = (mortgageOffers != null && mortgageOffers.length > 0) && mortgageOffers[mortgageOffers.length - 1];
    }
    else if (uiState == 'appraiserAppraisalWaiting') {
      currentScreen = '';
    }

    if (loading) return <LoadingIndicator />;

    if (mortgageOffers)
      mortgageOffers = filter(mortgageOffers, { Status: 'BANK_OFFER_INSTALLED' })

    return (
      <div>
        <Container>
          {
            currentScreen === "browseProperties" &&
            map(properties, (v, k) =>
              <Row key={k} style={{ marginBottom: '20px' }}>
                <Col>{v.Address}</Col>
                <Col><div className="btn btn-primary" onClick={this.buyProperty(v.Hash, v.SellerHash)}>Buy now</div></Col>
                <Col>{numeral(v.SellingPrice).format()}</Col>
                <Col style={{ maxWidth: '75px', padding: 0 }}><img style={{ maxHeight: '45px' }} src={`/media/images/properties/${k}.jpg`} alt="" /></Col>
              </Row>
            )
          }
        </Container>
        {
          currentScreen === "buyerRegister" &&
          <div>
            Property: {this.state.propertyChosen}
            <Form data={register} name="buyerRegister" />
            <div className="btn btn-secondary" style={{ margin: '5px' }} onClick={() => this.setState({ currentScreen: 'browseProperties', propertyChosen: false })}>Cancel</div>
            <div className="btn btn-primary" style={{ margin: '5px' }} onClick={this.register}>Register</div>
          </div>
        }
        {
          currentScreen === "requestMortgage" &&
          <div>
            <Form data={buyerRequestMortgage} name="requestMortgage" />
            <div className="btn btn-secondary" style={{ margin: '5px' }} onClick={() => this.setState({ currentScreen: 'buyerRegister' })}>Prev</div>
            <div className="btn btn-primary" style={{ margin: '5px' }} onClick={this.requestMortgage}>Request mortgage</div>
          </div>
        }
        {
          // Stopped at - no mortgage offers in the returned object
          currentScreen === "waiting4Offers" &&
          <div>
            {
              !mortgageOffers ?
                "Waiting for mortgage offers..." :
                map(mortgageOffers, (mortgageRequest, k) =>
                  <div key={k} className="d-flex flex-column align-items-start justify-content-start">
                    <div><span>Offer hash:</span><span>{mortgageRequest.Hash}</span></div>
                    <div><span>Property hash:</span><span>{mortgageRequest.PropertyHash}</span></div>
                    <div><span>Timestamp:</span><span>{mortgageRequest.Timestamp}</span></div>
                    <div><span>Offers:</span><span>{
                      map(mortgageRequest.BankOffers, (offer, kOffer) =>
                        <div key={kOffer}>
                          Monthly payment: {numeral(offer.MonthlyPayment).format()}
                          <div onClick={() => this.acceptOffer(mortgageRequest.Hash, offer.Hash)} className="btn btn-primary">Select</div>
                        </div>
                      )}</span></div>
                  </div>
                )
            }
          </div>
        }
        {currentScreen === "insurance" &&
          <div>
            { selectedRequest && selectedRequest.InsuranceOffers && selectedRequest.InsuranceOffers.length > 0 &&
              <Container>
                <Row>
                  <Col xs="4">Insurance id</Col>
                  <Col xs="4">Offer</Col>
                  <Col xs="4">Action</Col>
                </Row>

                {map(selectedRequest.InsuranceOffers, (v, insuranceId) =>
                  v && // If offer is not null
                  <Row key={insuranceId} className="d-flex align-items-center">
                    <Col xs="4">{v.InsuranceHash.substr(0, 8)}</Col>
                    <Col xs="4">{numeral(v.InsuranceAmount).format()}</Col>
                    <Col xs="4"><div className="btn btn-primary" onClick={this.acceptInsuranceOffer(selectedRequest.Hash, v.Hash)}>Accept</div></Col>
                  </Row>
                )}
              </Container>
            }
          </div>
        }
        {currentScreen === "chooseAppraiser" && <AppraiserStep requestHash={requestHash} appraisersList={appraisersList} />}
        {currentScreen === "waitingForContractExecution" &&
          <div>
            <h3>CONTRACT IS UNDERWAY</h3>
            <div className="mt-2 text-justify">
              Contract between the current property owner, {mortgage.user.fullName}(buyer) and bank ID: {mortgage.acceptedOffer.bankId} is underway, waiting for execution
            </div>
            <div className="mt-4 text-justify">
              <Fa icon={faCircle} style={{ margin: '0 10px' }} /> Government approval of title exchange under {mortgage.user.fullName}
            </div>
          </div>
        }
        {currentScreen === "acquisitionFinished" &&
          <div>
            <h3>Congratulations!</h3>
            <div className="mt-2 text-justify">
              You have successfully taken a mortgage with bank {mortgage.acceptedOffer.bankId}, and now own {properties[mortgage.propertyId].address}
            </div>
          </div>
        }
      </div>
    )
  }
}