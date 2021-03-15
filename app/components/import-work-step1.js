/*global _:false */
import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'import-work-step1',
  utils: Ember.inject.service('utility-methods'),

  initialProblemItem: function () {
    const selectedProblem = this.get('selectedProblem');
    if (this.get('utils').isNonEmptyObject(selectedProblem)) {
      return [selectedProblem.id];
    }
    return [];
  }.property('selectedProblem'),

  actions: {
    setSelectedProblem(val, $item) {
      if (!val) {
        return;
      }

      const isRemoval = _.isNull($item);
      if (isRemoval) {
        this.set('selectedProblem', null);
        return;
      }

      const problem = this.get('store').peekRecord('problem', val);
      if (this.get('utils').isNullOrUndefined(problem)) {
        return;
      }

      this.set('selectedProblem', problem);
      if (this.get('missingProblem')) {
        this.set('missingProblem', null);
      }
    },
    next() {
      const problem = this.get('selectedProblem');

      // workspace is required to go to next step
      if (this.get('utils').isNonEmptyObject(problem)) {
        this.get('onProceed')();
        return;
      }
      this.set('missingProblem', true);

    }
  }
});
