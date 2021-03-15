import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';


export default DS.Model.extend(Auditable, {
  linkedAssignment: DS.belongsTo('assignment', { inverse: null }),
  owner: DS.belongsTo('user', { inverse: null }),
  mode: DS.attr('string'),
  name: DS.attr('string'),
  organization: DS.belongsTo('organization'),
  doAutoUpdateFromChildren: DS.attr('boolean', { defaultValue: true }),
  childWorkspaces: DS.attr({ defaultValue: [] }),
  createdWorkspace: DS.belongsTo('workspace'),
  createWorkspaceError: DS.attr('string'),
});