import { hash } from 'rsvp';
import AuthenticatedRoute from '../_authenticated_route';

export default AuthenticatedRoute.extend({
  beforeModel: function () {
    this._super.apply(this, arguments);

    const user = this.modelFor('application');
    const isStudent = user.get('isStudent');

    if (isStudent) {
      this.transitionTo('assignments.home');
    }
  },

  model: function (params) {
    return hash({
      sections: this.store.findAll('section'),
    });
  },
  renderTemplate: function () {
    this.render('assignments/new');
  },
  actions: {
    toAssignmentInfo: function (assignment) {
      this.transitionTo('assignment', assignment);
    },
    toAssignmentsHome: function () {
      this.transitionTo('assignments.home');
    },
  },
});
