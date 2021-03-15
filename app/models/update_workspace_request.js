import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';


export default DS.Model.extend(Auditable, {
  workspace: DS.belongsTo('workspace', { inverse: null }),
  linkedAssignment: DS.belongsTo('assignment', { inverse: null }),
  updateErrors: DS.attr(),
  addedSubmissions: DS.hasMany('submission', { inverse: null }),
  wereNoAnswersToUpdate: DS.attr('boolean', { defaultValue: false }),
  isParentUpdate: DS.attr('boolean', { defaultValue: false }),
  createdParentData: DS.attr(),
  wasNoDataToUpdate: DS.attr('boolean', { defaultValue: false }),
  updatedParentData: DS.attr(),
});