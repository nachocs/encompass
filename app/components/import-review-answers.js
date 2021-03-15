import Ember from 'ember';






export default Ember.Component.extend({
  actions: {
    formatAnswers: function () {
      this.get('uploadAnswers')();
    },

    radioSelect: function (value) {
      this.set('mode', value);
    },
  }
});