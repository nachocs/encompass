import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';


export default DS.Model.extend(Auditable, {
  workspaceName: DS.attr('string'),
  workspaceMode: DS.attr('string'),
  workspaceOwner: DS.belongsTo('user', { inverse: null }),
  folderSet: DS.belongsTo('folder-set', { inverse: null }),
  vmtRooms: DS.attr(),
  permissionObjects: DS.attr(),
  createdWorkspace: DS.belongsTo('workspace'),
  createdAnswers: DS.hasMany('answer', { inverse: null }),
  createdSubmissions: DS.hasMany('submission', { inverse: null }),
  createWorkspaceError: DS.attr('string'),
  doCreateWorkspace: DS.attr('boolean'),

});