import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'assignment-home',
  classNames: ['home-view'],

  actions: {}
});
