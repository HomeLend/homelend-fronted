import React from 'react';
import { Input, Label, FormGroup, Row } from 'reactstrap';
import ValidationErrors from './ValidationErrors';
import map from 'lodash/map';

const RadioInput = (props) => {
  let formName = props.formName;
  let { t, wrapperClass, input, value, id } = props;
  let { size, name, options } = input;
  return (
    <FormGroup className={`col-12 col-lg-${size || 12} ${wrapperClass || ''}`}>
      { input.label && <Label for={name}>{t(input.label)}</Label>}
      <Row>
        {map(options, (option, i) => (
          <FormGroup key={i} check className={(option.addClass ? option.addClass : '') + ` ${option.className || "col"}`}>
            <Input type="radio" id={id+option.value} value={option.value} name={name} onClick={(e) => {  props.handleChange(e)}} />{' '}
            <Label check htmlFor={id+option.value} className={`radio btn ${option.radioLabelAddClass || ''}${`${value}` === `${option.value}` ? " selected" : ''}`}>
              {option.label || option.value}
            </Label>
          </FormGroup>
        ) )}
      </Row>
      <ValidationErrors data={Object.assign(props.data, {formName})}/>
    </FormGroup>
  );
}
export default RadioInput