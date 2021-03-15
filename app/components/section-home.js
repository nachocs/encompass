import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'section-home',
  classNames: ['home-view'],

  actions: {}
});
