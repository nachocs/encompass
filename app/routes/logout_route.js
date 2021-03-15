import Ember from 'ember';






export default Ember.Route.extend({

  beforeModel: function () {
    return Ember.$.get('/auth/logout'
    )
      .then(() => {
        window.location.href = '/';
      });

  }

});
