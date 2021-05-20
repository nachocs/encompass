import RESTAdapter from '@ember-data/adapter/rest';

export default RESTAdapter.extend({
  namespace: 'api',
  host: 'http://localhost:8080/',
  //fetchBatchSize: 100, thought this would work for beta.9 but no
  coalesceFindRequests: true,
  headers: {
    'Accept-Version': '*',
  },
});
