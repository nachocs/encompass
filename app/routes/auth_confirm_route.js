import Ember from 'ember';






export default Ember.Route.extend({
  model: function (params) {
    return params.token;
  },
  renderTemplate: function () {
    this.render('auth/confirm');
  },

  actions: {
    toHome: function () {
      window.location.href = '/';
    }
  },
});
