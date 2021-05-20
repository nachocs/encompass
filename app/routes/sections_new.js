import { hash } from 'rsvp';
import AuthenticatedRoute from './_authenticated_route';

export default AuthenticatedRoute.extend({
  beforeModel: function () {
    this._super.apply(this, arguments);

    const user = this.modelFor('application');
    const isStudent = user.get('isStudent');

    if (isStudent) {
      this.transitionTo('sections.home');
    }
  },

  model: function (params) {
    return hash({
      users: this.store.findAll('user'),
      organizations: this.store.findAll('organization'),
      user: this.modelFor('application'),
      sections: this.store.findAll('section'),
    });
  },
  renderTemplate: function () {
    this.render('sections/new');
  },
  actions: {
    toSectionInfo: function (section) {
      this.transitionTo('section', section);
    },
    toSectionsHome: function () {
      this.transitionTo('sections.home');
    },
  },
});
