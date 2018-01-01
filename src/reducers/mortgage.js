import { store } from '../data/constants';
import { set } from 'lodash';

const REQUEST_MORTGAGE = "REQUEST_MORTGAGE";
const SET_CREDIT_RANK = "SET_CREDIT_RANK";
const ADD_OFFER = "ADD_OFFER";
const ACCEPT_OFFER = "ACCEPT_OFFER";
const APPROVE_CONDITION = "APPROVE_CONDITION";
const CHOOSE_APPRAISER = "CHOOSE_APPRAISER";
const APPRAISER_EVALUATION= "APPRAISER_EVALUATION";
const CREATE_CONTRACT= "CREATE_CONTRACT";

export const requestMortgage = data => {
  const action = {
    type: REQUEST_MORTGAGE,
    data,
  }
  return store.dispatch(action);
}



export const setCreditRank = data => {
  const action = {
    type: SET_CREDIT_RANK,
    data,
  }
  return store.dispatch(action);
}



export const addOffer = (mortgageId, amount, bankId) => {
  const action = {
    type: ADD_OFFER,
    data: {mortgageId, amount, bankId},
  }
  return store.dispatch(action);
}



export const acceptOffer = (mortgageId, bankId) => {
  const action = {
    type: ACCEPT_OFFER,
    data: {mortgageId, bankId},
  }
  return store.dispatch(action);
}



export const setApproveCondition = (mortgageId, approveString) => {
  const action = {
    type: APPROVE_CONDITION,
    data: {mortgageId, approveString},
  }
  return store.dispatch(action);
}



export const setAppraiser = (mortgageId, appraiserId) => {
  const action = {
    type: CHOOSE_APPRAISER,
    data: {mortgageId, appraiserId},
  }
  return store.dispatch(action);
}



export const appraiserEvaluation = (mortgageId, value) => {
  const action = {
    type: APPRAISER_EVALUATION,
    data: {mortgageId, value},
  }
  return store.dispatch(action);
}



export const createContract = (mortgageId) => {
  const action = {
    type: CREATE_CONTRACT,
    data: {mortgageId},
  }
  return store.dispatch(action);
}




const initialState = {};

// Creating and adding to an array the data

export default function runtime(state = initialState, action) {
  let newState = {...state}
  switch (action.type) {
    case REQUEST_MORTGAGE:
      return {...state, ...(action.data)};
    case SET_CREDIT_RANK:
      newState[action.data.mortgageId] = {
        ...newState[action.data.mortgageId],
        creditScore: action.data.creditScore,
        STATUS: 'waitingForProposal'
      }
      return newState;
    case ADD_OFFER:
      set(newState, [action.data.mortgageId, 'offers', `${action.data.bankId}`], {amount: action.data.amount});
      return newState;
    case ACCEPT_OFFER:
      set(newState, [action.data.mortgageId, 'acceptedOffer'], {bankId: action.data.bankId});
      newState[action.data.mortgageId]['STATUS'] = 'waitingForApprovals';
      return newState;
    case APPROVE_CONDITION:
      set(newState, [action.data.mortgageId, 'conditions', action.data.approveString], true);
      return newState;
    case CHOOSE_APPRAISER:
      set(newState, [action.data.mortgageId, 'appraiser'], {appraiserId: action.data.appraiserId});
      // set(newState, [action.data.mortgageId, 'STATUS'], 'waitingForAppraisal');
      return newState;
    case APPRAISER_EVALUATION:
      set(newState, [action.data.mortgageId, 'conditions', 'propertyValueOk'], true);
      set(newState, [action.data.mortgageId, 'appraiser', 'value'], action.data.value);
      return newState;
    case CREATE_CONTRACT:
      set(newState, [action.data.mortgageId, 'STATUS'], 'inContract');
      return newState;
    default:
      return state;
  }
}
