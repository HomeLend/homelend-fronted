import { template, get } from 'lodash'

import { createStore, applyMiddleware, combineReducers } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import forms from '../reducers/form_reducers';
import data from '../reducers/generalData';
import tracker from '../reducers/tracker';

const reducers = combineReducers({forms, data, tracker})
export const store = applyMiddleware(promiseMiddleware())(createStore)(reducers);

export const sGet = (p = null) => !p ? store.getState() : get(store.getState(), p);

export const STORAGE_URL = "changeME!!!";

export let untranslated = [];
// export const clearUntranslated = () => untranslated = [];
export const t = (text, templateData) => {
  let ret = sGet(['data', 'translations', 'he', text]);
  ret = template(ret)(templateData);
  if(!ret) {
    ret = text;
    if(!untranslated.includes(text))
      untranslated.push(text);
  }

  return ret;
}

export const isNullOrEmpty = (val) => {
  return (val === undefined || val === null || val === "");
}