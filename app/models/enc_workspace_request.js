import DS from 'ember-data';


export default DS.Model.extend(Auditable, {
  teacher: DS.belongsTo('user', { inverse: null }),
  assignment: DS.belongsTo('assignment', { inverse: null }),
  problem: DS.belongsTo('problem', { inverse: null }),
  section: DS.belongsTo('section', { inverse: null }),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  pdSetName: DS.attr('string'),
  folderSet: DS.belongsTo('folderSet', { inverse: null }),
  requestedName: DS.attr('string'),
  createdWorkspace: DS.belongsTo('workspace'),
  isEmptyAnswerSet: DS.attr('boolean', { defaultValue: null }),
  createWorkspaceError: DS.attr('string'),
  owner: DS.belongsTo('user', { inverse: null }),
  mode: DS.attr('string'),
  answers: DS.hasMany('answer', { inverse: null }),
  newAnswerSet: DS.attr(),
  permissionObjects: DS.attr(),
});
