import Ember from 'ember';






export default Ember.Route.extend({

  model: function () {
    var store = this.get('store');
    var objs = store.find('selection');
    return objs;
  }

});
