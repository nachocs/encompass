import Ember from 'ember';






export default Ember.Component.extend({
  elementId: 'vmt-import-step4',

  shouldHideButtons: function () {
    if (this.get('isUploadingAnswer') || this.get('isCreatingWorkspace') || this.get('savingAssignment') || this.get('uploadedAnswers')) {
      return true;
    } else {
      return false;
    }
  }.property('isUploadingAnswer', 'isCreatingWorkspace', 'savingAssignment', 'uploadedAnswers'),

  workspaceLink: function () {
    let submission = this.get('createdWorkspace.submissions.firstObject');
    let wsId = this.get('createdWorkspace.id');
    return `/#/workspaces/${wsId}/submissions/${submission}`;
  }.property('isCreatingWorkspace', 'createdWorkspace'),

  handleLoadingMessage: function () {
    const that = this;
    if (!this.get('isUploadingAnswer') || !this.get('isCreatingWorkspace') || this.get('savingAssignment')) {
      this.set('showLoadingMessage', false);
      return;
    }
    Ember.run.later(function () {
      if (that.isDestroyed || that.isDestroying) {
        return;
      }
      that.set('showLoadingMessage', true);
    }, 800);

  }.observes('isUploadingAnswer', 'isCreatingWorkspace', 'savingAssignment'),

  actions: {
    next() {
      this.get('onProceed')();
    },
    back() {
      this.get('onBack')(-1);
    }
  }
});