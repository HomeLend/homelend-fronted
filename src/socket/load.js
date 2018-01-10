import { setData } from '../reducers/generalData'
import { reduce } from 'lodash'



const load = (socket) => {

  socket.on('connect', () => console.log("Socket connection established"))

  socket.on('propertiesList', r => {
    let props;
    props = reduce(r, (result, v, k) => {
      result[k] = {
        address: v.Address,
        hash: v.Hash,
        sellerHash: v.SellerHash,
        timestamp: v.Timestamp,
        price: v.SellingPrice,
      }
      return result;
    }, []);

    setData({"properties": props})
  })

}

export default load