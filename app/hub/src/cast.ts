import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const options = {
  method: 'POST',
  url: 'https://api.neynar.com/v2/farcaster/cast',
  headers: {
    accept: 'application/json',
    api_key: process.env.NEYNAR_API_KEY,
    'content-type': 'application/json'
  },
  data: {
    signer_uuid: process.env.SIGNER_UUID,
    text: 'GM! Watchout this space for @ottp; the BASED collaboration protocol'
  }
};

axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });