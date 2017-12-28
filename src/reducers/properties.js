import { store } from '../data/constants';
import { concat } from 'lodash';

const ADD_PROPERTY = "ADD_PROPERTY";

export const addProperty = data => {
  const action = {
    type: ADD_PROPERTY,
    data,
  }
  return store.dispatch(action);
}





const initialState = [];

// Creating and adding to an array the data

export default function runtime(state = initialState, action) {
  switch (action.type) {
    case ADD_PROPERTY:
      return concat(state, action.data);
    default:
      return state;
  }
}
