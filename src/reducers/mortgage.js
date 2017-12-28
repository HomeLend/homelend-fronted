import { store } from '../data/constants';
import { concat, remove } from 'lodash';

const REQUEST_MORTGAGE = "REQUEST_MORTGAGE";
const SET_CREDIT_RANK = "SET_CREDIT_RANK";
const ADD_OFFER = "ADD_OFFER";

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



export const addOffer = (mortgageObject, amount, bankId) => {
  const action = {
    type: ADD_OFFER,
    data: {},
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
      console.log(newState, action);
      return {...newState, [action.data.guid]: action.data};
    case ADD_OFFER:
      return state;
    default:
      return state;
  }
}
