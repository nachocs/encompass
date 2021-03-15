/**
 * Passed in by parent:
 * - hide
 */
import Ember from 'ember';






export default Ember.Component.extend({
  classNameBindings: ['hide'],
  newFolderName: '',

  actions: {
    close: function () {
      this.set('newFolderName', '');
      this.set('hide', true);
    },

    cancel: function () {
      this.set('newFolderName', '');
      this.set('hide', true);
    },

    save: function () {
      var newName = this.get('newFolderName');
      this.sendAction("newFolder", newName);

      this.set('hide', true);
    }
  }
});

