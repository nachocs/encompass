import Ember from 'ember';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';







export default DS.Model.extend(Auditable, {
  organizationId: Ember.computed.alias('id'),
  name: DS.attr('string'),
  recommendedProblems: DS.hasMany('problem', { async: true, inverse: null })
});