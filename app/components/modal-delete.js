import Ember from 'ember';






export default Ember.Component.extend({
  elementId: 'modal-delete',
  actions: {
    delete: function () {
      this.sendAction('onConfirm', this.get('itemToDelete'));
    },

    cancel: function () {
      this.set('itemToDelete', null);
    }
  }
});