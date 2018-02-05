import React, { Component } from 'react';
import Input, { simulateChange } from './Input';
import LoadingIndicator from '../common/LoadingIndicator';
import { sGet, t, } from '../../data/constants'
import { map, debounce, isEmpty, isArray } from 'lodash';
import './style.css';
import { Row, Container, Collapse } from 'reactstrap';
import { difference, evaluateCondition } from './functions'
import Fa from 'react-fontawesome'
// import { setData } from '../../reducers/generalData'
// import { getData, } from '../../data/ajax'

// let smartForm = {loading: {}};
// smartForm.get = (formName, url) => {
//   const loadedForms = sGet(["data", "loadedForms"]) || {};
//
//   if(loadedForms[formName]) return loadedForms[formName];
//   if(smartForm.loading[formName]) return;
//
//   smartForm.loading[formName] = true;
//   getData(url, {}, (r, s) => {
//     if(s !== 200) return alert("Something went horribly wrong while fetching form data from " + url);
//     console.log(loadedForms, formName)
//     setData({name: "loadedForms", data: {...loadedForms, [formName]: r}});
//     delete smartForm.loading[formName];
//   })
// }

export const generateForm = (formName) => {
  let send = sGet(["forms", formName]);
  if(!send) return "{}";
  delete send['invalids']
  map(send, (v, k) => {
    if(isArray(v)) send[k] = JSON.stringify(v);
  })
  return send;
}


export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {openId: 1};

    this.handleOnChange = debounce(() => {
      const Old = this.last || {};
      const New = sGet(['forms', props.name])
      const Diff = difference(New, Old);
      if(!isEmpty(Old) && !isEmpty(Diff))
        props.onChange(Diff, New);
      this.last = { ...New};
    }, 50)

    this.toggleAccordion = (toId) => () => {
      if(this.state.openId === toId) return this.setState({openId: 0})
      this.setState({openId: toId})
    }
  }
  componentDidMount() {
    const {props} = this;
    console.log("Initialize ", props.name)
    simulateChange(props.name)
  }
  render() {
    const {props, state, toggleAccordion} = this;
    let {src, name, onSubmit, data, onChange, style = {}, readOnly = false} = props;
    const { openId } = state;

    if(onChange) this.handleOnChange()


    if(!name) console.error(`Make sure to fill 'name' attribute in ${'<'}Form /> component`)

    if(src) console.log("Please enable loading external data first")
    //   data = smartForm.get(name, src);
    if(!data) return <LoadingIndicator />;
    data = data[0] || data;

    if(!src && !data) console.error(`Make sure to fill 'src' or 'data' attribute in ${'<'}Form /> component`)

    if(!data) return <LoadingIndicator />;
    let accStatus = {open: false, title: null, inputs: [], count: 0};
    return (
      <form onSubmit={(e) => {if(readOnly) return; onSubmit && onSubmit(); e.preventDefault(); return false;} } style={style}>
        <Container fluid>
          <Row>
            {
              map(data.fields, (v, k) => {
                  // If the condition to display this input is false, stop it here
                  if(v.condition && !evaluateCondition(v.condition, name)) return false

                  const input = <Input key={k} formName={name} data={v} readOnly={readOnly}/>;

                  // If an accordion is accumulating inputs, insert this one as well
                  if(accStatus.open && !v.accordion) accStatus.inputs.push(input);

                  // If there is a demand to display accordion
                  if(v.accordion && v.type === "title" || (data.fields.length === (k+1) && accStatus.open)) { // eslint-disable-line
                    const inputs = {...accStatus.inputs}, title = accStatus.title, count = accStatus.count;

                    // If this is an accordion, declare it as open again and bump the count cunt
                    if(v.accordion)
                      accStatus = {open: true, title: v.text, inputs: [], count: count+1};
                    else
                      accStatus = {open: false, title: null, inputs: []}

                    // If there is a list of inputs to display
                    if(!isEmpty(inputs)) {
                      return <div className="w-100" key={k}>
                        <div className="accordion-title" onClick={toggleAccordion(count)}>
                          <Fa name={openId === count ? "chevron-up" : "chevron-down"} style={{position: 'absolute', top: '15px', color: 'gray', left: '15px'}} />
                          {t(title)}
                        </div>
                        <Collapse isOpen={openId === count} className="container" key={k}><Row>{map(inputs, v => v)}</Row></Collapse>
                      </div>
                    }
                    return;
                  }

                  // If an accordion is accumulating inputs, don't show this one
                  if(accStatus.open) return;

                  return input
                }
              )}
            <input type="submit" style={{display: 'none'}} />
          </Row>
        </Container>
      </form>
    )
  }
}
