import Ember from 'ember';
import { AuthenticatedRoute } from '../routes/_authenticated_route';


export default AuthenticatedRoute.extend({
  hideOutlet: true,
  application: Ember.inject.controller(),


  beforeModel: function (transition) {
    this._super.apply(this, arguments);

    let problemId;
    let params = transition.params;
    if (params.problem) {
      problemId = params.problem.problemId;
    }
    if (problemId) {
      this.set('hideOutlet', false);
    } else {
      if (!this.get('hideOutlet')) {
        this.set('hideOutlet', true);
      }
    }

  },
  model: function (params) {
    const store = this.get('store');
    const user = this.modelFor('application');
    let problemCriteria = {};

    if (!user.get('isAdmin')) {
      problemCriteria = {
        filterBy: {
          createdBy: user.id
        }
      };
    }
    return Ember.RSVP.hash({
      organizations: store.findAll('organization'),
      sections: store.findAll('section'),
      problems: store.query('problem', problemCriteria),
      hideOutlet: this.get('hideOutlet')
    });
  },

  renderTemplate: function () {
    this.render('problems/problems');
  },
  actions: {
    toProblemInfo(problem) {
      this.transitionTo('problem', problem);
    },
    sendtoApplication(categories) {
      this.get('application').set('categories', categories);
      this.get('application').set('showCategoryList', true);
    },
  }

});

