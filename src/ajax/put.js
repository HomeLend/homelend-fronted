import postData from './post'

const putData = (url, body, callback, overrideHeaders = {}) => postData(url, body, callback, {overrideHeaders, ...{method: 'PUT'}})

export default putData;