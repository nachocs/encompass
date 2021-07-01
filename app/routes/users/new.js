import AuthenticatedRoute from '../_authenticated_route';
import { hash } from 'rsvp';

export default AuthenticatedRoute.extend({
  model() {
    const currentUser = this.modelFor('application');
    return hash({
      currentUser,
      oranizations: this.store.findAll('organization'),
    });
  },
  renderTemplate: function () {
    this.render('users/new');
  },
  actions: {
    toUserInfo: function (user) {
      this.transitionTo('user', user);
    },
    toUserHome: function () {
      this.transitionTo('users');
    },
  },
});
