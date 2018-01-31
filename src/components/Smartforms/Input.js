import React from 'react'
import { Label, FormGroup, UncontrolledTooltip } from 'reactstrap'
import postData from '../../ajax/post'
import { STORAGE_URL } from '../../data/constants'
import TextInput from './Text'
import ValidationErrors from './ValidationErrors'
import SelectInput from './Select'
import RadioInput from './Radio'
import Document from './Document'
import { store, sGet, t } from '../../data/constants'
import { updateForm, setForm } from '../../reducers/form_reducers'
import isEmail from 'validator/lib/isEmail';
import isDecimal from 'validator/lib/isDecimal';
import { LegalTz } from './functions';
import {each, get, set, map, debounce, toNumber, isNil, includes, isEqual, reverse, indexOf, isArray, noop } from "lodash";
import NumberFormat from 'react-number-format';
import Datetime  from 'react-datetime'
import Slider  from './Slider'
// import Document  from '../Document'
// import { postData } from '../../data/ajax';
import { Col } from 'reactstrap';
import moment  from 'moment'

let changeHandlers = [];


let setDefault = (currentVal, {data}) => {
  //Setting default to checkbox
  if(currentVal !== undefined && data.type === 'checkbox' && !(currentVal === 1 || currentVal === 0) ) currentVal = undefined;

  if(isNil(currentVal)) currentVal = get(data, 'default');
  if(isNil(currentVal)) currentVal = '';
  return currentVal;
};

const validator = (validate, val, type) => {
  let invalid = null;
  if (type === "number" && indexOf(validate, 'number') === -1) {reverse(validate).push("number"); reverse(validate);}
  if (validate) validate.map(check => {
    if (check === "required" && ( isNil(val) || val === '' )) invalid = "required";
    if (check === "email" && !isEmail(`${val}`) && val.length > 0) invalid = "email";
    if (check === "number" && !isDecimal(`${val}`)) invalid = "number";
    if (check === "numberOrNull" && (!isDecimal(`${val}`) && val !== '')) invalid = "number";
    if (check === "id" && !LegalTz(val) && val.length > 0) invalid = "id";
    if (!isNil(check.dividingBy) && val / check.dividingBy !== Math.floor(val / check.dividingBy) )
      invalid = ["dividible", check.dividingBy]

    if(type === 'number' || type === 'range' || type === 'money') {
      //Checking value min and max
      if(typeof check.calcMax === 'function') check.max = check.calcMax();
      if (check.min !== undefined || check.max !== undefined) {
        const {min, max} = check;
        if(min !== max || max === 0) {
          if (val < min) invalid = `Must be higher than ${min}`;
          if (val > max) invalid = `Must be lower than ${max}`;
        }
      }
    } else {
      //Checking value length min and length max
      if (check.min !== undefined || check.max !== undefined) {
        if (val.length < check.min) invalid = "too short";
        if (val.length > check.max) invalid = "too long";
      }
    }
    return null;
  });
  return invalid;
}

export const change = formName => {
  let fields = {}, invalids = {}, currentVal, invalid, count = 0;
  each(changeHandlers[formName], handler => {
    count++;
    currentVal = setDefault(sGet(['forms', formName, handler.data.name]), handler);
    fields[handler.data.name] = currentVal;
    invalid = handler.handleChange(currentVal, true);
    if(invalid) Object.assign(invalids, { [handler.data.name]: invalid });
  });
  fields['invalids'] = invalids;
  const latest = sGet(['forms', formName])
  if(!isEqual(latest, fields) && count > 0) {
    setForm({formName, value:fields});
  }
}
export const simulateChange = debounce(change, 5);

const defaulting = (defaults, set) => {
  map(defaults, v => set = isNil(set) ? v : set)
  return set;
}

export const handleUpload = (file, assignName, cb = noop) => {
  if(assignName === undefined) return console.log('Please assign assignName parameter at handleUpload()');
  console.log("tried to upload ", file, assignName);
  let data = new FormData();
  data.append('Appraiser', file);
  postData(`${STORAGE_URL}/api/storage`, data, cb, {'Content-Type': 'multipart/form-data', 'Accept': '*/'});
};


export default class SmartInput extends React.Component {

  constructor(props) {
    super(props);
    let {data,formName, readOnly = false} = this.props;
    let validate = this.props.validate || data.validate;

    this.handleChange = (e, revalidate = false) => {
      if(readOnly) return;
      if(data.ifTrue && !data.ifTrue()) return null;

      let oldVal = sGet(['forms', formName, data.name]);
      let newVal = defaulting([get(e, 'value'), get(e, 'target.value'), e]);

      if(newVal === oldVal && revalidate === false) return;

      //
      if(data.type === "number" && toNumber(newVal) == newVal && newVal !== '') newVal = toNumber(newVal); // eslint-disable-line
      if(data.name !== undefined && newVal !== oldVal && !revalidate) {
        updateForm({formName, field: data.name, value: newVal});
        simulateChange(formName)
      }

      return validate ? validator(validate, newVal, data.type) : null;
    };

    if(data.name) set(changeHandlers, [formName, data.name], {handleChange: this.handleChange, data});
  }
  componentWillUnmount() {
    if(!changeHandlers[this.props.formName]) return;
    delete changeHandlers[this.props.formName][this.props.data.name];
  }
  render() {
    let defaults = {}, input = {};
    let {data, formName, readOnly = false} = this.props;
    let validate = data.validate || {};

    const id = `${formName}__${data.name}`;
    const include = {formName, validate, t}

    if(data.type === "text" || data.type === "password") {
      input = Object.assign({}, defaults, data);
      this.value = sGet(['forms', formName, input.name]) || input.value || '';
      return <TextInput {...include}{...input} value={this.value} handleChange={this.handleChange} id={id} />
    }






    if(data.type === "birthDate") {
      input = Object.assign({}, defaults, data);
      this.value = get(store.getState(), ['forms', formName, input.name]) || input.value || moment();
      return (
        <FormGroup className={`col-12 col-lg-${input.size || 12}`}>
          { input.label && <Label for={input.name} className="no-margin">{t(input.label)}</Label> }
          <Datetime
            dateFormat="DD-MM-YYYY"
            id={id}
            timeFormat={false}
            viewMode={'years'}
            inputProps={{className: "react-datetime", required: includes(input.validate, 'required'), readOnly: '1'}}
            value={moment(this.value).format("DD-MM-YYYY")}
            onChange={e => {if(moment(e).isValid()) {this.handleChange(e.toISOString()) } else this.handleChange('')} } />
          <ValidationErrors data={Object.assign(data, {formName})}/>
        </FormGroup>
      );
    }




    if(data.type === "textarea") {
      input = Object.assign({}, defaults, data);
      this.value = get(store.getState(), ['forms', formName, input.name]) || input.value || '';
      return (
        <FormGroup className={`col-12 col-lg-${input.size || 12}`}>
          { input.label && <Label for={input.name}>{t(input.label)}</Label> }
          <textarea className={input.inputClass} onChange={this.handleChange} required={input.required} id={id} value={this.value} />
          <ValidationErrors data={Object.assign(data, {formName})}/>
        </FormGroup>
      );
    }




    if(data.type === "number") {
      input = Object.assign({}, defaults, data);
      this.value = sGet(['forms', formName, input.name]);
      return (
        <FormGroup className={`col-12 col-lg-${input.size || 12}`}>
          { input.label ? <Label for={input.name} style={{marginBottom: '8px'}}>{t(input.label)}</Label> : ''}
          <input
            type="text"
            autoComplete="off"
            className={`${input.inputClass} react-numberInput`}
            onChange={this.handleChange}
            value={this.value || ''}
            step={input.step}
            required={input.required}
            id={id}
            min={input.min}
            max={input.max} />
          <ValidationErrors data={Object.assign(data, {formName})} />
        </FormGroup>
      );
    }


    if(data.type === "money") {
      input = Object.assign({}, defaults, data);
      this.value = get(store.getState().forms[formName], [input.name]) || 0;
      if(this.value) this.value = parseInt(this.value, 10)

      let modifier = (values = {}) => { this.handleChange(values.floatValue || 0); }
      let isAllowed = (value) => {
        let v = value.floatValue;
        if(input.min > v || input.max < v) {
          this.handleChange(input.min > v ? input.min : input.max)
          return false;
        }
        return true;
      }
      return (
        <FormGroup className={`col-12 col-lg-${data.size || 12} ${data.addClass || ''}`}>
          { input.label ? <Label for={input.name} style={{marginBottom: '8px'}}>{t(input.label)}</Label> : ''}
          <NumberFormat type="text" className={"form-control " + input.inputClass} prefix="₪ " thousandSeparator={true} onValueChange={modifier} step={1000} value={this.value || 0} isAllowed={isAllowed} id={id} />
          <ValidationErrors data={Object.assign(data, {formName})} />
        </FormGroup>
      );
    }


    if(data.type === "select") {
      input = Object.assign({}, defaults, data);

      let attrs = {
        value: sGet(['forms', formName, input.name]) || 0,
        formName: formName,
        options: this.props.options,
        onChange: this.handleChange,
        clearable: false,
      };
      return <SelectInput {...include}{...input} attrs={attrs} id={id} />
    }



    if(data.type === "radio") {
      input = Object.assign({}, defaults, data);
      this.value = sGet(['forms', formName, input.name]);
      return  <RadioInput defaults={defaults}
                          id={id}
                          data={data}
                          addClass={data.addClass}
                          input={input}
                          value={this.value}
                          formName={formName}
                          handleChange={this.handleChange}
                          t={t} />
    }



    if(data.type === "checkbox") {
      input = Object.assign({}, defaults, data);
      this.value = get(store.getState(), [`forms`,formName, input.name]) === 1 ? 1 : 0;
      return <div className={`col-12 col-lg-${data.size || 12} ${data.addClass || ''} ${this.value ? 'checked' : ''} d-flex align-items-end md-checkbox`} style={{marginBottom: '20px'}}>
        <input
          type={"checkbox"}
          id={id}
          label={data.label}
          onChange={() => {this.handleChange(this.value === 1 ? 0 : 1)} }
          checked={this.value === 1}
          style={{maxWidth: '20px', margin: '4px'}}
        />
        <label htmlFor={id}>{t(data.label)}</label>
        <ValidationErrors data={Object.assign(data, {formName})} />
      </div>
    }


    if(data.type === "button") {
      let thisOnClick = data.onClick;
      let tooltip = (data.tooltip) ? <UncontrolledTooltip placement="top" target={`button_${data.name}`}>{data.tooltip}</UncontrolledTooltip>: null
      return  <div className={data.addClass}>
        {tooltip}
        <div id={id} style={data.btnStyle} className={data.btnClass || "btn btn-secondary teal-btn"} onClick={() => {thisOnClick(simulateChange)}} >{t(data.label)}</div>
      </div>
    }



    if(data.type === "description") {
      return (
        <p className={`col-12 col-lg-${data.size || 12}`}>
          {data.title && <h3 style={{marginBottom: '10px'}} className={data.titleClass}>{t(data.title)}</h3>}
          {t(data.text)}
        </p>
      )
    }



    if(data.type === "slider") {
      input = Object.assign({}, defaults, data);
      this.value = sGet(['forms', formName, input.name]);
      return <Slider
        min={input.min || 0}
        max={input.max}
        name={input.name}
        label={input.label}
        labelAfter={input.labelAfter}
        marks={input.marks}
        setValue={this.value}
        onChangeCall={this.handleChange}
        formName={formName}
      />
    }




    if(data.type === "title")
      return <Col xs="12" style={{textAlign: 'center', margin: '20px 0', fontWeight: 'bold', fontSize: '18px'}}>{t(data.text)}</Col>


    if(data.type === "br")
      return <Col xs="12" />


    if(data.type === "document") {
      this.value = sGet(['forms', formName, data.name]);
      if(!isArray(this.value) && this.value) {
        this.value = JSON.parse(this.value);
        setTimeout(() => this.handleChange(this.value), 50);
      }
      if(!data.lines) return <div>Document type have to contain 'lines' in the attrs</div>;
      return <Document
        handleUpload={this.props.uploadFunc || handleUpload}
        info={{lines: data.lines}}
        setFiles={(set)=> this.handleChange(set)}
        files={this.value || []}
        size={input.size || 12}
        readOnly={readOnly}
      />
    }




    // if(data.type === "signature") {
    //   this.value = sGet(['forms', formName, data.name]);
    //   return (
    //     <FormGroup className={`signature ${input.addClass || ''}`}>
    //       <Label className="d-block">{t(data.label)}</Label>
    //       <Pad onSuccess={(e) => {this.handleChange(e.fileId)}} fileId={this.value || false} />
    //       <ValidationErrors data={Object.assign(data, {formName})}/>
    //     </FormGroup>
    //   );
    // }



    return <div>Wrong type given: <strong>{data.type}</strong></div>;

  }
}
