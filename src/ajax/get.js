import { defaultHeaders, handleResponse } from './common'
import config from 'react-global-configuration';

let getCache = {};
const getData = (url, callback, options = {}) => {
  if (options.id) { if (getCache[options.id]) return; getCache[options.id] = true; }
  let res, redo = () => getData(...arguments)
  
  if (!url.startsWith('http'))
    url = config.get('serverBaseUrl') + url;

  fetch(url, { method: 'GET', headers: defaultHeaders(options) })
    .then(response => {
      res = response;
      if (options.expectOK && !res.ok) throw Error("Expected OK, got " + res.status)
      if (options.returnText) return response.text();
      return response.json() || {}
    })
    .then(responseJson => { handleResponse(responseJson, res.status, res.headers, callback, redo); if (options.id) getCache[options.id] = false; })
    .catch(error => { console.error('!!Get request failed: ', error, url); if (options.id) getCache[options.id] = false; });
}
export default getData;