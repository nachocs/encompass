import Ember from 'ember';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';







export default DS.Model.extend(Auditable, {
  problemId: Ember.computed.alias('id'),
  title: DS.attr('string'),
  puzzleId: DS.attr('number'),
  text: DS.attr('string'),
  imageUrl: DS.attr('string'),
  sourceUrl: DS.attr('string'),
  image: DS.belongsTo('image', { inverse: null }),
  origin: DS.belongsTo('problem', { inverse: null }),
  modifiedBy: DS.belongsTo('user', { inverse: null }),
  organization: DS.belongsTo('organization', { inverse: null }),
  additionalInfo: DS.attr('string'),
  privacySetting: DS.attr('string'),
  categories: DS.hasMany('category', { inverse: null }),
  keywords: DS.attr(),
  copyrightNotice: DS.attr('string'),
  sharingAuth: DS.attr('string'),
  author: DS.attr('string'),
  error: DS.attr('string'),
  isUsed: DS.attr('boolean'),
  status: DS.attr('string'),
  flagReason: DS.attr(),
  isForEdit: DS.attr('boolean', { defaultValue: false }),
  isForAssignment: DS.attr('boolean', { defaultValue: false }),
  contexts: DS.attr(),
});
