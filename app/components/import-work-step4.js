/*global _:false */
import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'import-work-step4',
  utils: Ember.inject.service('utility-methods'),
  alert: Ember.inject.service('sweet-alert'),

  addedStudentNames: [],

  init() {
    this._super(...arguments);
    this.set('newNameFilter', this.addStudentNameFilter.bind(this));
  },

  displayList: function () {
    if (!this.get('studentMap')) {
      return [];
    }
    return _.map(this.get('studentMap'), (val, key) => {
      return val;
    });
  }.property('studentMap'),


  addStudentNameFilter: function (name) {
    if (typeof name !== 'string') {
      return;
    }
    let trimmed = name.trim();
    let names = this.get('addedStudentNames');
    return trimmed.length > 1 && !names.includes(trimmed);
  },

  actions: {
    checkStatus: function () {
      if (this.get('isMatchingIncompleteError')) {
        this.set('isMatchingIncompleteError', null);
      }
      let answers = this.get('answers');

      answers.forEach((ans) => {
        let isValid = this.get('utils').isNonEmptyArray(ans.students) || this.get('utils').isNonEmptyArray(ans.studentNames);

        if (!isValid) {
          this.set('isReadyToReviewAnswers', false);
          return;
        }
        this.set('isReadyToReviewAnswers', true);
      });
    },
    next() {
      if (this.get('isReadyToReviewAnswers')) {
        this.get('onProceed')();
      } else {
        this.set('isMatchingIncompleteError', true);
        this.get('alert').showToast('error', `Unmatched submission(s)`, 'bottom-end', 3000, false, null);
      }
    },
    back() {
      this.get('onBack')(-1);
    }
  }
});