import { store } from '../data/constants';
import { set } from 'lodash';

const REQUEST_MORTGAGE = "REQUEST_MORTGAGE";
const SET_CREDIT_RANK = "SET_CREDIT_RANK";
const ADD_OFFER = "ADD_OFFER";
const ACCEPT_OFFER = "ACCEPT_OFFER";

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
    default:
      return state;
  }
}
