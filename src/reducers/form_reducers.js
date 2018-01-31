import isObject from 'lodash/isObject'
import { store } from '../data/constants';
const FORM_UPDATE = "FORM_UPDATE";
const FORM_SET = "FORM_SET";

//TODO fix this so we dont use this function
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}



export const updateForm = data =>{
  const action = {
    type: FORM_UPDATE,
    data,
  }
  return store.dispatch(action);
}

export const setForm = data =>{
  const action = {
    type: FORM_SET,
    data,
  }

  return store.dispatch(action);
}

const INITIAL_STATE = [];

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case FORM_UPDATE:
      let newConnectedValues = {}, newValue = {[ action.data.field ]: action.data.value};
      mergeDeep(newConnectedValues, state, { [action.data.formName]: newValue});
      return newConnectedValues;
    case FORM_SET:
      newConnectedValues = Object.assign( {}, state );
      delete newConnectedValues[action.data.formName];
      mergeDeep(newConnectedValues, {[action.data['formName']] :action.data.value});
      return newConnectedValues;
    default:
      return state
  }
}