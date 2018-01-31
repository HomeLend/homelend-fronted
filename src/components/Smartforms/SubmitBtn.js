import React, { Component } from 'react';
import {generateForm} from '../../components/Smartforms';
import POST from '../../ajax/post';
import {isEmpty, map} from 'lodash';
import { sGet } from '../../data/constants';
import LoadingIndicator from '../../components/common/LoadingIndicator';

// Checks if the form is valid, given specific inputs
const isValid = (formName, inputs) => {
  const invalids = sGet(['forms', formName, 'invalids']);

  if (isEmpty(invalids)) return true;

  let isValid = true;

  map(inputs.fields, v => isValid = (invalids[v.name]) ? false : isValid)
  return isValid;
}

export default class SubmitBtn extends Component {
  constructor(props) {
    super(props);

    this.state = {submitting: false};
  }
  submit = () => {
    const invalids = isValid();
    if(invalids) {
      console.log("WARNING! submitting a form with invalid values present, please handle (or prevent)")
      this.setState({error: invalids[0]})
      return;
    }

    this.setState({submitting: true, error: false});
    POST(
      this.props.to,
      generateForm(this.props.formName),
      (r, s) => {
        this.setState({submitting: false});
        if(s >= 200 && s < 300) return this.props.onSuccess(r, s);
        if(s === 400)           return this.setState({error: r.err});
        if(s === 401)           return alert("Please Log in to the system again");
        if(s === 500)           return alert("Whoops, server error")
      }
    )
  }
  render() {
    const { submitting, error } = this.state;
    const { text = "Submit" } = this.props;
    return (
      <div className="d-flex justify-content-center flex-column align-items-center">
        {error && <span style={{color: 'red', padding: '15px', margin: '5px'}} className="card card-outline-danger text-center">{error}</span>}
        {
          submitting ?
            <LoadingIndicator />
            :
            <div className="btn btn-primary" style={{width: '250px'}} onClick={this.submit}>{text}</div>
        }
      </div>
    )
  }
}