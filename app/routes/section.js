import AuthenticatedRoute from './_authenticated_route';

export default AuthenticatedRoute.extend({
  model: function (params) {
    var section = this.store.findRecord('section', params.sectionId);
    return section;
  },

  renderTemplate: function () {
    this.render('sections/section');
  },

  actions: {
    toSectionList: function () {
      this.transitionTo('sections.home');
    },
    toAssignmentInfo: function (assignment) {
      this.transitionTo('assignment', assignment);
    },
  },
});
