import { hash } from 'rsvp';
import AuthenticatedRoute from '../routes/_authenticated_route';


export default AuthenticatedRoute.extend({
  beforeModel: function () {
    this._super.apply(this, arguments);

    const user = this.modelFor('application');
    const isStudent = user.get('isStudent');

    if (isStudent) {
      this.transitionTo('/');
    }
  },
  model: function () {
    return hash({
      // pdSets: this.get('store').findAll('PdSet'),
      folderSets: this.store.findAll('folderSet'),
      sections: this.store.findAll('section'),
      assignments: this.store.findAll('assignment'),
      users: this.store.findAll('user'),
      problems: this.store.findAll('problem')
    });
  },

  actions: {
    // Created workspaceId and is passed from component to redirect
    toWorkspaces: function (workspaceId,) {
      this.transitionTo('workspace.work', workspaceId);
    },

    toWorkspace: function (id) {
      this.transitionTo('workspace/work', id);
    }
  }
});
