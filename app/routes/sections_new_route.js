import Ember from 'ember';
import AuthenticatedRoute from '../routes/_authenticated_route';


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
    return Ember.RSVP.hash({
      users: this.get('store').findAll('user'),
      organizations: this.get('store').findAll('organization'),
      user: this.modelFor('application'),
      sections: this.get('store').findAll('section')
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
    }
  }
});