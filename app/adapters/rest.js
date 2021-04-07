import RESTAdapter from '@ember-data/adapter/rest';

export default RESTAdapter.extend({
    namespace: 'api',
    //fetchBatchSize: 100, thought this would work for beta.9 but no
    coalesceFindRequests: true,
    headers: {
        'Accept-Version': '*'
    }
});
