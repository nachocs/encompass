import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';






export default Ember.Component.extend(CurrentUserMixin, ErrorHandlingMixin, {
  elementId: ['unconfirmed-page'],
  emailErrors: [],

  actions: {
    sendEmail: function () {
      Ember.$.get('/auth/resend/confirm')
        .then((res) => {
          if (res.isSuccess) {
            this.set('emailSuccess', true);
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'emailErrors');
        });
    }
  }
});