import { store } from '../data/constants';

const ADD_TRACK = "ADD_TRACK";

export const addTrack = data =>{
  const action = {
    type: ADD_TRACK,
    data,
  }
  return store.dispatch(action);
}





const initialState = {};

// Creating and adding to an array the data

export default function runtime(state = initialState, action) {
  switch (action.type) {
    case ADD_TRACK:
      return Object.assign({}, state, {tracker: state.tracker, test: action.data});
    default:
      return state;
  }
}
