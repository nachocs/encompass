import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'linked-workspaces-new',
  loading: Ember.inject.service('loading-display'),

  didReceiveAttrs() {
    this.set('workspaceName', this.get('defaultName'));
  },

  defaultName: function () {
    let assignmentName = this.get('assignment.name') || this.get('assignmentName');
    let sectionName = this.get('section.name') || this.get('sectionName');

    return `${assignmentName} (${sectionName})`;
  }.property('assignment.name', 'section.name', 'assignmentName', 'sectionName'),

  previewName: function () {
    return this.get('workspaceName') || this.get('defaultName');
  }.property('defaultName', 'workspaceName'),

  actions: {
    cancel() {
      if (this.get('onCancel')) {
        this.get('onCancel')();
      } else {
        this.set('isCreating', false);
      }
    },
    create() {
      let assignment = this.get('assignment');

      if (!assignment) {
        return;
      }

      this.get('loading').handleLoadingMessage(this, 'start', 'isRequestInProgress', 'doShowLoadingMessage');

      let data = {
        doAllowSubmissionUpdates: true,
        name: this.get('workspaceName') || this.get('defaultName'),
        doCreate: true,
      };

      assignment.set('linkedWorkspacesRequest', data);

      assignment.set('parentWorkspaceRequest', { doCreate: false });
      return assignment.save()
        .then((assignment) => {
          this.get('loading').handleLoadingMessage(this, 'end', 'isRequestInProgress', 'doShowLoadingMessage');

          let createWorkspaceError = assignment.get('linkedWorkspacesRequest.error');

          if (createWorkspaceError) {
            return this.set('createWorkspaceError', createWorkspaceError);
          }

          this.get('handleResults')(assignment);
          this.send('cancel');
        })
        .catch((err) => {
          this.get('loading').handleLoadingMessage(this, 'start', 'isRequestInProgress', 'doShowLoadingMessage');

          this.set('createWorkspaceError', err);
        });
    },
  }
});