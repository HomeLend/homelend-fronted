import { debounce } from 'lodash';

export const shouldUpdateUserData = debounce((updateId) => {
  return false
  // if(!updateId || !store) return false
  // if(get(store.getState(), 'user.updateId') == updateId) return false
  // store.dispatch({type: UPDATE_ID, data: {updateId} });
},4000, {leading: true});

export const defaultHeaders = (override = {}, header = {}, storedToken = false) => {
  if(storedToken) Object.assign(header, {'Authorization': `Bearer ${storedToken}`, 'language': "en" })
  if(override.authorization === false) delete header['Authorization'];
  return Object.assign(header, {'Accept': 'application/json','Content-Type': 'application/x-www-form-urlencoded'})
};

export const handleResponse = (responseJson, status, headers, callback, redo) => {
  if(status === 500) {alert("ERROR 500"); return false;}
  if(status === 404) {alert("ERROR 404, page was not found, if this problem persists, contact us with details"); return false;}
  return (status === 401) ? alert("No valid credentials use (redo) to refresh with getRefreshedToken") : callback(responseJson, status);
}