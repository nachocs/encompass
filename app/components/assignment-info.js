import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';






export default Ember.Component.extend(CurrentUserMixin, ErrorHandlingMixin, {
  utils: Ember.inject.service('utility-methods'),

  currentAssignment: null,

  currentProblem: function () {
    let assignment = this.get('currentAssignment');
    if (!assignment) {
      return null;
    }
    return assignment.get('problem.content');
  }.property('currentAssignment.problem.content'),

  currentSection: function () {
    let assignment = this.get('currentAssignment');
    if (!assignment) {
      return null;
    }
    return assignment.get('section.content');
  }.property('currentAssignment.section.content'),

  assignmentStudents: function () {
    let assignment = this.get('currentAssignment');
    if (!assignment) {
      return [];
    }
    return assignment.get('students.content');

  }.property('currentAssignment.students.content'),

  didReceiveAttrs: function () {
    if (this.get('assignment.id') !== this.get('currentAssignment.id')) {
      this.set('currentAssignment', this.get('assignment'));
    }
  },

  actions: {
    toAssignments: function () {
      this.sendAction('toAssignments');
    },

    toAnswerInfo: function (answer) {
      this.sendAction('toAnswerInfo', answer);
    },
  }
});
