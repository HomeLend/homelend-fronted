import React from 'react';
import { Label, FormGroup } from 'reactstrap'
import { includes }from 'lodash';
import ValidationErrors from './ValidationErrors';
import Fa from 'react-fontawesome';

const TextInput = (props) => {
  const { type, validate, handleChange, value, placeholder, disabled, inputClass, name, label, t, wrapperClass, size, labelAfter, icon, id } = props;
  let addStyle;
  if(icon) addStyle = {paddingLeft: '15px', paddingRight: '15px'};
  return (
    <FormGroup className={`col-12 col-lg-${size || 12} ${wrapperClass || ''}`}>
      { label &&
      <Label for={name}>
        { icon && <Fa name={icon} className="theme-color" style={{padding: '0 10px'}} />}
        {t(label)}
      </Label>
      }
      <input type={type}
             id={id}
             placeholder={placeholder}
             disabled={disabled}
             className={inputClass}
             onChange={handleChange}
             value={value}
             required={includes(validate, 'required')}
             style={addStyle}
      />
      <ValidationErrors data={props}/>
      { labelAfter }
    </FormGroup>
  )
}

export default TextInput