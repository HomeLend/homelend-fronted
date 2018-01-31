import React from 'react';
import { sGet } from '../../data/constants'
import { Popover, } from 'reactstrap'

const popoverError = (verificationTarget, message) => {
  return (<Popover placement={"bottom"} isOpen={true} target={verificationTarget}>
    <div className="d-flex flex-row" style={{padding: '10px'}}>
      {message}
    </div>
  </Popover>)
}

class ValidationErrors extends React.Component {
  render() {
    let data = this.props.data;
    if(!sGet(['forms', data.formName, 'invalids'])) return null;
    let msg = '';
    let invalid = sGet(['forms', data.formName, 'invalids', data.name]);
    if(invalid) {
      msg = 'Invalid ' + invalid;
      if(invalid === 'number') msg = "Enter a number"
      if(invalid === 'email') msg = "Please provide a valid email"
      if(invalid === 'id') msg = "Please provide a valid ID"
      if(invalid === 'required') msg = <div style={{position: 'absolute', top: 0, margin: '0 -15px'}}>*</div>
      if(invalid) {
        if(invalid[0] === 'dividible') msg = "Please enter a number in multiples of " + invalid[1]
      }

      if(invalid === 'required') return <span style={{height: 0, color: 'red'}}><br />{' '}{msg}</span>
      let id = `${data.formName}__${data.name}`;
      return  <div id={id}>
        {popoverError(id,
          <div className={invalid ? "text-danger d-inline" : 'text-muted d-inline'}>{msg}</div>)}
      </div>
    }

    return null
  }
}
export default ValidationErrors