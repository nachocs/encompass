import AuthenticatedRoute from '../routes/_authenticated_route';

export default AuthenticatedRoute.extend({
  model: function (params) {
    return this.store.findRecord('assignment', params.assignmentId);

  },

  actions: {
    toAnswerInfo: function (answer) {
      this.transitionTo('answer', answer);
    },
    toAssignments: function () {
      this.transitionTo('assignments.home');
    }
  },

  renderTemplate: function () {
    this.render('assignments/assignment');
  }
});
