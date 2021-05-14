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

  @action
  login() {
    const username = this.get('username').trim();
    const password = this.get('password');

    if (!username || !password) {
      this.set('missingCredentials', true);
      return;
    }

    const createUserData = {
      username,
      password,
    };
    $.post({
      url: 'http://localhost:8080/auth/login',
      data: createUserData,
    })
      .then((res) => {
        if (res.message === 'Incorrect password') {
          this.set('incorrectPassword', true);
        } else if (res.message === 'Incorrect username') {
          this.set('incorrectUsername', true);
        } else {
          console.log(res);
          this.sendAction('toHome');
        }
      })
      .catch((err) => {
        console.log(err);
        this.handleErrors(err, 'postErrors');
      });
  },

  @action
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
});
