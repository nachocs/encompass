/**
  * # Users Route
  * @description Route for dealing with all user objects
  * @todo This is really the users_index route and should be named as such by convention
  * @author Amir Tahvildaran <amir@mathforum.org>
  * @since 1.0.0
  */
import { hash } from 'rsvp';

import Route from '@ember/routing/route';






export default Route.extend({
  beforeModel: function () {
    const user = this.modelFor('application');
    const isStudent = user.get('isStudent');

    if (isStudent) {
      this.transitionTo('/');
    }
  },
  model: function () {
    return hash({
      users: this.store.findAll('user'),
      organizations: this.store.findAll('organization'),
    });
  },

  renderTemplate: function () {
    this.render('users/users');
  }

});
