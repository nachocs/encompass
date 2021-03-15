/**
 * Passed in by parent:
 * - hide
 * - folderName
 * - confirm (action)
 */
import Ember from 'ember';






export default Ember.Component.extend({
  classNameBindings: ['hide'],

  actions: {
    cancel: function () {
      this.set('hide', true);
    },

    deleteFolder: function () {
      this.sendAction("confirm");
      this.set('hide', true);
    }
  }
});

