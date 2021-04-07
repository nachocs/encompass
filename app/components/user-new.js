import Component from '@ember/component';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Component.extend(CurrentUserMixin, {
  elementId: 'user-new',

  actions: {
    toUserInfo: function (user) {
      this.sendAction('toUserInfo', user);
    },
    toUserHome: function () {
      this.sendAction('toUserHome');
    }
  },
});

