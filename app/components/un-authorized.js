import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';
import MtAuthMixin from '../mixins/mt_auth_mixin';






export default Ember.Component.extend(CurrentUserMixin, MtAuthMixin, {
  elementId: 'un-authorized',

  contactEmail: function () {
    return this.getContactEmail();
  }.property(),
});