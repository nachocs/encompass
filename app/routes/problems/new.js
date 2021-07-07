import { hash } from 'rsvp';
import AuthenticatedRoute from '../_authenticated_route';

export default AuthenticatedRoute.extend({
  model: function () {
    return hash({
      problems: this.store.findAll('problem'),
      organizations: this.store.findAll('organization'),
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
  },
});
