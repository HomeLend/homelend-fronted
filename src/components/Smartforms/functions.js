import { sGet, } from '../../data/constants'
import {isEqual, transform, isObject, template, get, map} from 'lodash'

export const difference = (object, base) => {
  function changes(object, base) {
    return transform(object, function(result, value, key) {
      if (!isEqual(value, base[key])) {
        result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}

export const evaluateCondition = (data, formName) => {
  let forms = sGet(['forms']), failed = false;
  map(data, v => {
    let valFrom = template(v.valFrom)({thisForm: formName})
    if(v['operator'] === "===") failed = failed || (get(forms, valFrom) !== v.value);
    if(v['operator'] === "==") failed = failed || (get(forms, valFrom) != v.value); // eslint-disable-line
    if(v['operator'] === "!==") failed = failed || (get(forms, valFrom) === v.value);
    if(v['operator'] === "!=") failed = failed || (get(forms, valFrom) == v.value); // eslint-disable-line
    if(v['operator'] === ">") failed = failed || (get(forms, valFrom) <= v.value);
    if(v['operator'] === ">=") failed = failed || (get(forms, valFrom) < v.value);
    if(v['operator'] === "<") failed = failed || (get(forms, valFrom) >= v.value);
    if(v['operator'] === "<=") failed = failed || (get(forms, valFrom) > v.value);
  })
  return !failed;
}

export const LegalTz = (tz, tot = 0) => {
  if(!tz) return false;
  for (let i=0; i<8; i++) {
    let x = (((i%2)+1)*tz.charAt(i));
    if (x > 9) {
      x = x.toString();
      x = parseInt(x.charAt(0), 10)+parseInt(x.charAt(1), 10)
    }
    tot += x;
  }
  return (tot + parseInt(tz.charAt(8), 10)) % 10 === 0;
};

export const getFormData = (formName) => {
  let result = sGet(['forms', formName]);
  delete result['invalids'];
  return result;
}