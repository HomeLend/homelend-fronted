import { store } from '../data/constants';
import { concat } from 'lodash';

const REQUEST_MORTGAGE = "REQUEST_MORTGAGE";

export const requestMortgage = data => {
  const action = {
    type: REQUEST_MORTGAGE,
    data,
  }
  return store.dispatch(action);
}





const initialState = [];

// Creating and adding to an array the data

export default function runtime(state = initialState, action) {
  switch (action.type) {
    case REQUEST_MORTGAGE:
      return concat(state, action.data);
    default:
      return state;
  }
}
