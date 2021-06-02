import Component from '@ember/component';
import { computed, action } from '@ember/object';
import $ from 'jquery';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';

export default Component.extend(ErrorHandlingMixin, {
  tagName: '',
  classNames: ['login-page'],
  incorrectPassword: false,
  incorrectUsername: false,
  missingCredentials: false,
  postErrors: [],

  oauthErrorMsg: computed('oauthError', function () {
    if (this.oauthError === 'emailUnavailable') {
      return 'The provided email address is already associated with an existing account';
    }
  }),
  resetErrors() {
    const errors = [
      'incorrectUsername',
      'incorrectPassword',
      'missingCredentials',
    ];

    for (let error of errors) {
      if (this.get(error)) {
        this.set(error, false);
      }
    }
  },

  @action
  login() {
    const username = "timleonard"
    const password = "password!!"

    if (!username || !password) {
      this.set('missingCredentials', true);
      return;
    }
    const that = this;
      var createUserData = {
        username: username,
        password: password,
      };
      $.post({
        url: 'http://localhost:8080/auth/login',
        data: createUserData,
      })
        .then((res) => {
          if (res.message === 'Incorrect password') {
            that.set('incorrectPassword', true);
          } else if (res.message === 'Incorrect username') {
            that.set('incorrectUsername', true);
          } else {
            window.location.href = '/';
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'postErrors');
        });
    },
  });
