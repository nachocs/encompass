import Ember from 'ember';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';







export default DS.Model.extend(Auditable, {
  assignmentId: Ember.computed.alias('id'),
  name: DS.attr('string'),
  answers: DS.hasMany('answer', { async: true }),
  students: DS.hasMany('user', { inverse: null }),
  section: DS.belongsTo('section', { async: true }),
  problem: DS.belongsTo('problem', { async: true }),
  assignedDate: DS.attr('date'),
  dueDate: DS.attr('date'),
  taskWorkspace: DS.belongsTo('workspace', { inverse: null }),
  assignmentType: DS.attr('string'),
  linkedWorkspaces: DS.hasMany('workspace', { inverse: null }),
  parentWorkspace: DS.belongsTo('workspace', { inverse: null }),
  reportDetails: DS.attr(), // for assignment report,
  linkedWorkspacesRequest: DS.attr({
    defaultValue: { doCreate: false, error: null, createdWorkspaces: [], doAllowSubmissionUpdates: false, name: null }
  }),
  parentWorkspaceRequest: DS.attr({
    defaultValue: { doCreate: false, error: null, createdWorkspace: null, doAutoUpdateFromChildren: false, name: null }
  }),
});