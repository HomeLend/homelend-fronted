import React from 'react';
import Select from 'react-select';
import { Label, FormGroup, Row } from 'reactstrap';
import ValidationErrors from './ValidationErrors';
import { map, some } from 'lodash';
import Input from '../Smartforms/Input';
// import { getData } from '../../data/ajax';
// import { setData } from '../../reducers/generalData';
// import { getFromBetween } from '../../data/functions';


// Map value label
// const mapVL = (data) => reduce(data, (res, v, k) => {res.push({"value": k, 'label': v}); return res; }, []);
// let loading = {};

// const loadOptions = (url, cb) => {
//   let cached = sGet(['data', 'SelectCache']) || {}
//   if(!isEmpty(cached[url])) return cached[url];
//
//   if(loading[url]) return;
//   loading[url] = true;
  // getData(url, {}, (r, s) => {
  //   if(s !== 200) return alert("Request failed, url: ", url, "status:", s );
  //   cached[url] = mapVL(r);
  //   setData({"name": 'SelectCache', "data": cached});
  //   cb();
  //   delete loading[url];
  // })
// }

// const parseUrl = (tem, data) => {
//   let src = template(tem)(data);
//   if(tem) {
//     const allVars = getFromBetween.get(tem, '${', '}')
//     let exists = true;
//     map(allVars, v => {
//       if(isEmpty(get(data, v))) exists = false;
//     })
//     if(!exists) return false
//   }
//   return src;
// }


class SelectInput extends React.Component {
  // constructor(props) {
  //   super(props);
    // this.latestSrc = '';
    // this.latestVal = '';
  // }
  // update () {
  //   return () => this.forceUpdate();
  // }
  // shouldComponentUpdate() {
    // const { props } = this;
    // const { value, options } = props.attrs;
    // const src = parseUrl(props.src, {'base': HOMELEND_URL, 'form': sGet(['forms', props.formName]) || {} });
    // Prevent load if one of the parameters of the url is missing or empty
    // if(src === false) return false;

    // if(this.latestSrc === src &&
    //   this.latestVal === value &&
    //   options && this.optionsCount !== options.length
    // ) return false;


    // this.latestSrc = src;
    // this.latestVal = value;
    // if(options) this.optionsCount = options.length;

  //   return true;
  // }
  render() {
    const { props } = this;
    const { t, wrapperClass, attrs, options, allowCustom, id } = props;
    let size = props.size
    this.attrs = {...attrs};

    this.attrs['options'] = options || [{ value: 'noValuesLoaded', label: 'No values provided' }]
    // this.attrs['options'] = loadOptions(this.latestSrc, this.update()) || options || [{ value: 'noValuesLoaded', label: 'No values provided/loaded yet' }]

    if(allowCustom && !some(options, {value: 'Other'})) this.attrs['options'].push({value: "Other"})
    if(allowCustom && this.attrs.value === 'Other') {console.log("selected"); size = 6;}

    map(this.attrs['options'], v => {
      v.value += ``
      if(!v.label) v.label = v.value;
    });
    this.attrs['value'] += ``;
    if(props.autoload === false) this.attrs['autoload'] = false
    return (
      <FormGroup id={props.name} className={`col-12 col-lg-${size || 12} ${wrapperClass || ''}`} style={{position: 'relative'}}>
        { props.label ? <Label for={props.name}>{t(props.label)}</Label> : '' }
        <ValidationErrors data={props} />
        <Row>
          <div className={`col-${(allowCustom && this.attrs.value === 'Other') ? 6 : "12"}`}><Select {...this.attrs} id={id}/></div>
          {(allowCustom && this.attrs.value === 'Other') &&
          <Input data={{"type": "text","size": 6,"name": props.name+"Other", "wrapperClass": "no-margin"}} formName={props.formName}/>}
        </Row>
      </FormGroup>
    );
  }
}
export default SelectInput