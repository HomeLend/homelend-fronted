import { sGet } from '../data/constants';
import {  } from 'lodash';
import { setData } from '../reducers/generalData';

let isFetching = false;

const getProperties = () => {

  if(sGet(['data', 'properties']))
    return sGet(['data', 'properties']);

  if(!isFetching) {
    isFetching = true;
    setTimeout(() => {
      setData({"properties": [
        {
          address: "Zhabutinski 25, Ofaqim",
          hash: "hash1",
          idnumber: "312170632",
          price: "122000",
          status: "ADVERTISED",
          txHash: "113213132132112321",
        }
      ]})
    }, 3000);
  }

  if(isFetching)
    return "FETCHING";
}

export default getProperties;