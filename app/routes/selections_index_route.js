import Route from '@ember/routing/route';






export default Route.extend({

  model: function () {
    var store = this.store;
    var objs = store.find('selection');
    return objs;
  }

});
