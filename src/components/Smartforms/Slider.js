import React, { Component } from 'react';
import Slider from 'rc-slider'
import { Label, FormGroup } from 'reactstrap'
import { t } from '../../data/constants';
import ValidationErrors from './ValidationErrors';
import Input from './Input';
import { debounce } from 'lodash';

class DebSlider extends Component {
  constructor(props) {
    super(props)
    this.debSlider = debounce(v => {this.props.onChangeCall(v); this.setState({val: v, ignoreProps: false});}, 100, {maxWait: 250})
    this.state = {val:  this.props.setValue, ignoreProps: false};
  }
  componentWillUpdate(nextProps, nextState) {
    if(nextState.val !== this.state.val && nextState.val !== undefined)
      this.debSlider(nextState.val);
    // If slider edited directly, ignore props as the helper input might override the correct value
    if(nextProps.setValue !== this.state.val && !this.state.ignoreProps)
      this.debSlider(nextProps.setValue);
  }
  render() {
    const { name, label, wrapperClass, size, labelAfter, id, formName } = this.props;
    return (
      <FormGroup className={`col-12 col-lg-${size || 12} ${wrapperClass || ''}`}>
        { label &&
          <Label for={name}>{t(label)}</Label>
        }
        <Slider
          id={id}
          {...this.props}
          marks={typeof this.props.marks === "function" ? this.props.marks(this.props.t) : this.props.marks}
          value={this.state.val || 0} onChange={(e) => {this.setState({val: e, ignoreProps: true}); }}
          railStyle={{background: 'white', boxShadow: '#0003 0 2px 3px 1px inset', height: '10px'}}
          trackStyle={{background: '#4BCBD9', boxShadow: '#0003 0 2px 3px 1px inset', height: '10px'}}
          handleStyle={{background: '#4BCBD9', height: '18px', width: '18px', border: '3px solid #44B1BE'}}
          dotStyle={{background: '#4BCBD9', height: '16px', width: '4px', border: 'none', boxShadow: 'rgba(0, 0, 0, 0.2) 1px 0 2px 1px', borderRadius: '0'}}
        />
        <ValidationErrors data={this.props} />
        <div style={{margin: '-15px', marginTop: '30px'}}>
          <Input formName={formName} data={{type: 'number', name}}/>
        </div>
        { labelAfter }
      </FormGroup>
    )
  }
}

export default DebSlider