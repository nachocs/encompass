import Ember from 'ember';
import MtAuthMixin from '../mixins/mt_auth_mixin';






export default Ember.Component.extend(MtAuthMixin, {
  content: null,

  googleUrl: function () {
    return this.getSsoGoogleUrl();
  }.property(),

  actions: {
  }
});