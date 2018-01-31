import { defaultHeaders, handleResponse } from './common'
import { isObject } from 'lodash'

const postData = (url, body, callback, overrideHeaders = {}) => {
  let res, redo = () => postData(...arguments)
  let bodyString = isObject(body) ? Object.keys(body).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(body[k])}`).join('&') : body;
  let headers = Object.assign({}, defaultHeaders(), overrideHeaders);
  if(headers['Content-Type'] === 'multipart/form-data') { delete headers['Content-Type']; bodyString = body }
  fetch(url, {method: headers.method || "POST", headers, body: bodyString,})
    .then(response => {
      res = response;
      let contentType = response.headers.get("content-type");
      if(!contentType) return {};
      if(contentType.indexOf("application/json") !== -1) return response.json()
    })
    .then(responseJson => handleResponse(responseJson, res.status, res.headers, callback, redo))
    .catch(error => console.error('!!postData function failed ; Post request failed: ', error));
}
export default postData;