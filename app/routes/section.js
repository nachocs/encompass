import AuthenticatedRoute from './_authenticated_route';
import { hash } from 'rsvp';

export default AuthenticatedRoute.extend({
  async model(params) {
    let section = await this.store.findRecord('section', params.section_id);
    const currentUser = await this.modelFor('application');
    console.log(section);
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
