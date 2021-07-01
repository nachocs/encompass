import AuthenticatedRoute from './_authenticated_route';
import { hash } from 'rsvp';

export default AuthenticatedRoute.extend({
  model: function (params) {
    let section = this.store.findRecord('section', params.sectionId);
    const currentUser = this.modelFor('application');
    return hash({
      section,
      currentUser,
    });
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
