require('dotenv').config();
const axios = require('axios');

axios.defaults.headers.common['client-id'] = process.env.CLIENT_ID;

const Server = (method, url, data, oauth) => {
  if(oauth) axios.defaults.headers.common['Authorization'] = `OAuth ${oauth}`;

  return axios[method](`https://open-api.trovo.live/openplatform/${url}`, data);
};

module.exports = {Server};
