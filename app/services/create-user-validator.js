Encompass.CreateUserValidatorService = Ember.Service.extend({
  emailRegEx: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  usernameRegEx: /^[a-z0-9_]{3,30}$/,
  usernameAllowedChars: /^[a-z0-9_]*$/,
  usernameMinLength: 3,
  usernameMaxLength: 30,
  passwordMinLength: 10,
  passwordMaxLength: 72,
  disallowedUsernames: ['admin', 'encompass', 'vmt', 'virtualmathteams'],

  isAuthorizedConstraints: {
     isAuthorized: {
       inclusion: {
         within: [true, false]
        }
     }
  },

  buildConstraints(accountType, allowedAccountTypes, options = {}) {
    let { isFromSignupForm } = options;

    let results = {};

    Object.assign(
      results,
      this.buildUsernameConstraints(),
      this.buildPasswordConstraints(),
      this.buildNameConstraints(accountType),
      this.buildEmailConstraints(accountType),
      this.buildConfirmFieldConstraints('confirmEmail', 'email'),
      this.buildConfirmFieldConstraints('confirmPassword', 'password'),
      this.buildLocationConstraints(accountType),
      this.buildOrganizationConstraints(),
      this.buildAccountTypeConstraints(allowedAccountTypes),
      this.get('isAuthorizedConstraints'),
    );

    return results;
  },

  buildNameConstraints(accountType) {
    let isStudent = accountType === 'Student';

    return {
      firstName: {
        presence: {
          allowEmpty: isStudent,
        },
        length: {
          maximum: 100
        }
      },
      lastName: {
        presence: {
          allowEmpty: isStudent
        },
        length: {
          maximum: 200
        }
      }
    };

  },

  buildUsernameConstraints() {
    let minimum = this.get('usernameMinLength');
    let maximum = this.get('usernameMaxLength');
    let pattern = new RegExp(this.get('usernameAllowedChars'));
    let disallowed = this.get('disallowedUsernames');
    return {
      username: {
        format: {
          pattern,
          message:
            'must be all lowercase and can only contain the following special characters _'
        },
        length: {
          minimum,
          maximum
        },
        exclusion: {
          within: disallowed
        },
        presence: {
          allowEmpty: false,
        }
      }
    };
  },

  buildPasswordConstraints() {
    let minimum = this.get('passwordMinLength');
    let maximum = this.get('passwordMaxLength');

    return {
      password: {
        length: {
          minimum,
          maximum
        },
        presence: {
          allowEmpty: false,
        }

      }
    };
  },
  buildEmailConstraints(accountType) {
    let pattern = new RegExp(this.get('emailRegEx'));
    let isStudent = accountType === 'Student';

    return {
      email: {
        format: {
          pattern,
          message: '^Please provide a valid email address'
        },
        presence: {
          allowEmpty: isStudent
        }
      },
    };
  },

  buildConfirmFieldConstraints(fieldName, originalFieldName) {
    return { [fieldName]: {
      equality: originalFieldName
    }};
  },

  buildLocationConstraints(accountType) {
    let isStudent = accountType === 'Student';

    return {
      location: {
        presence: {
          allowEmpty: isStudent,
        },
        length: {
          maximum: 50 // this seems too short
        }
      },
    };
  },

  buildOrganizationConstraints() {
    return {
      organization: {
        presence: {
          allowEmpty: false
        },
      }
    };
  },

  buildAccountTypeConstraints(allowedAccountTypes) {
    return {
      accountType: {
        inclusion: {
          within: allowedAccountTypes
        },
        presence: {
          allowEmpty: false,
        }

      }
    };
  },

  validate(values, constraints) {
    return window.validate(values, constraints);
  }
});
