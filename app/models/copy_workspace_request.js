import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';


export default DS.Model.extend(Auditable, {
  name: DS.attr('string'),
  owner: DS.belongsTo('user', { inverse: null }),
  mode: DS.attr('string'),
  originalWsId: DS.belongsTo('workspace', { inverse: null }),
  submissionOptions: DS.attr(),
  folderOptions: DS.attr(),
  selectionOptions: DS.attr(),
  commentOptions: DS.attr(),
  responseOptions: DS.attr(),
  permissionOptions: DS.attr(),
  copyWorkspaceError: DS.attr('string'),
  createdWorkspace: DS.belongsTo('workspace'),
  createdFolderSet: DS.belongsTo('folder-set'),
});