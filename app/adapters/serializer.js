import DS from 'ember-data';

export default DS.RESTSerializer.extend({
    primaryKey: "_id", // Fix for Ember to recognise Mongoose object ids
    isNewSerializerAPI: true
});
