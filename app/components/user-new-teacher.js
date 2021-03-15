import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';
import UserSignupMixin from '../mixins/user_signup_mixin';






export default Ember.Component.extend(CurrentUserMixin, ErrorHandlingMixin, UserSignupMixin, {
  elementId: 'user-new-teacher',
  alert: Ember.inject.service('sweet-alert'),
  errorMessage: null,
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  authorizedBy: '',
  newUserData: {},
  createUserErrors: [],

  createNewUser: function (data) {
    return new Promise((resolve, reject) => {
      if (!data) {
        return reject('Invalid data');
      }
      Ember.$.post({
        url: '/auth/signup',
        data: data
      })
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },


  actions: {
    newUser: function () {
      var username = this.get('username');
      var password = this.get('password');
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      var currentUser = this.get('currentUser');
      var currentUserId = currentUser.get('id');
      var organization = currentUser.get('organization.id');

      if (!username || !password) {
        this.set('errorMessage', true);
        return;
      }

      if (this.get('passwordError') || this.get('usernameError')) {
        return;
      }

      var newUserData = {
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        organization: organization,
        accountType: 'S',
        isAuthorized: true,
        authorizedBy: currentUserId,
        createdBy: currentUserId,
      };

      return this.createNewUser(newUserData)
        .then((res) => {

          if (res.username) {
            this.get('alert').showToast('success', `${res.username} created`, 'bottom-end', 3000, null, false);
            return this.sendAction('toUserInfo', res.username);
          }
          if (res.message === 'There already exists a user with that username') {
            this.set('usernameError', this.get('usernameErrors.taken'));
            return;
          } else if (res.message === 'There already exists a user with that email address') {
            this.set('emailError', this.get('emailErrors.taken'));
            return;
          } else {
            this.set('createUserErrors', [res.message]);
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'createUserErrors', newUserData);
        });

    },

    cancelNew: function () {
      this.sendAction('toUserHome');
    },

  }
});


