import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    namespace: 'api',
    //fetchBatchSize: 100, thought this would work for beta.9 but no
    coalesceFindRequests: true,
    headers: {
        'Accept-Version': '*'
    }
});
