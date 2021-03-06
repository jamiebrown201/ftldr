const fetch = require('node-fetch');
const debug = require('debug')('lib:fetchContent');
const CAPI_KEY = process.env.CAPI_KEY;
if (! CAPI_KEY ) {
  throw new Error('ERROR: CAPI_KEY not specified in env');
}
const CAPI_PATH = 'https://api.ft.com/enrichedcontent/';

function getArticle(uuid) {
  const capiUrl = `${CAPI_PATH}${uuid}?apiKey=${CAPI_KEY}`;

  return fetch(capiUrl)
  .then(res => {
    if (res.status === 400) {
      throw `ERROR: fetch article for uuid=${uuid} status code=${res.status}`
    }
    return res
  })
  .then( res   => res.text() )
  .then( text  => JSON.parse(text) )
  .catch( err => {
    debug(`ERROR: article: err=${err}, capiUrl=${capiUrl}`);
    throw err;
  });
};

module.exports = {
  getArticle
};
