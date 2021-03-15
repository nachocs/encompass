import Ember from 'ember';
import AuthenticatedRoute from '../routes/_authenticated_route';






export default AuthenticatedRoute.extend({
  model: function (params) {
    return Ember.RSVP.hash({
      problems: this.get('store').findAll('problem'),
      organizations: this.get('store').findAll('organization'),
    });
  },
  renderTemplate: function () {
    this.render('problems/new');
  },
  actions: {
    toProblemInfo: function (problem) {
      this.transitionTo('problem', problem);
    },
    toProblemList: function () {
      this.transitionTo('problems');
    },
  }
});


