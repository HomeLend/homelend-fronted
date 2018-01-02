import { store } from '../data/constants';

const DATA_SET = "DATA_SET";

export const setData = data => {
  const action = {
    type: DATA_SET,
    data,
  }
  return store.dispatch(action);
}





const initialState = {};

export default function runtime(state = initialState, action) {
  switch (action.type) {
    case DATA_SET:
      return {...state, ...action.data};
    default:
      return state;
  }
}
