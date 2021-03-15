import Ember from 'ember';
import { AuthenticatedRoute } from '../routes/_authenticated_route';


export default AuthenticatedRoute.extend({
  controllerName: 'vmt-import',

  model() {
    return Ember.RSVP.hash({
      folderSets: this.get('store').findAll('folderSet'),
      users: this.get('store').findAll('user'),
    });
  },

  actions: {
    toWorkspaces: function (workspaceId) {
      this.transitionTo('workspace.work', workspaceId);
      // window.location.href = `#/workspaces/${workspace._id}/submissions/${workspace.submissions[0]}`;
    }
  },

  renderTemplate() {
    this.render('vmt/import');
  }
});