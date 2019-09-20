/* eslint-disable prefer-object-spread */
/*global _:false */
Encompass.UserNewComponent = Ember.Component.extend(Encompass.CurrentUserMixin, Encompass.SelectizeInputMixin, Encompass.UserSignupMixin, {
  elementId: 'user-new',
  similarity: Ember.inject.service('string-similarity'),
  alert: Ember.inject.service('sweet-alert'),
  validator: Ember.inject.service('create-user-validator'),
  utils: Ember.inject.service('utility-methods'),

  isCreatingStudent: Ember.computed.equal('formFields.accountType.input.value', 'Student'),

  isEmailValid: Ember.computed.equal('formFields.email.input.isValid', true),
  isPasswordValid: Ember.computed.equal('formFields.password.input.isValid', true),

  orgValidationErrors: Ember.computed.alias('formFields.organization.input.errors.validation'),
  showOrgValidationErrors: Ember.computed.and('orgValidationErrors', 'formFields.organization.input.isDirty'),

  isOrgFixed: Ember.computed.not('currentUser.isAdmin'), // non admins can only create users in their org

  isInitiallyAuthorized: true,

  formFieldNames: function() {
    let formFields = this.get('formFields');

    if (!formFields) {
      return [];
    }
    return Object.keys(formFields);
  }.property('formFields'),

  init() {
    this.set('orgRequestFilter', this.createOrgRequestFilter.bind(this));

    let initialAccountType = this.get('initialAccountType');
    this.set('selectedType', initialAccountType);

    let userOrg = this.get('currentUser.organization.content');

    if (userOrg) {
      this.set('initialOrg', userOrg);
      this.set('initialOrgItem', [userOrg.id]);
    }

    let constraints = this.get('validator').buildConstraints(initialAccountType, this.get('allowedAccountTypes'));

    this.set('constraints', constraints);

    let formFields = this.buildForm();
    this.set('formFields', formFields);

    this._super(...arguments);
  },

  accountTypeLabelOptions: {
    text: 'Account Type',
    tooltip: {
      text: "User's account type",
    }
  },

  orgLabelOptions: {
    text: 'Organization',
    tooltip: {
      text: "Organization user will belong to",
    }
  },

  isAuthorizedLabelOptions: {
    text: 'Authorized',
    tooltip: {
      text: "User must be authorized before being able to use EnCoMPASS",
    }
  },


  allowedAccountTypes: function() {
    let base = ['Student', 'Teacher', 'Pd Admin', 'Admin'];
     let accountType = this.get('currentUser.accountType');
    if (accountType === 'A') {
      // admins can create all account types
      return base;
    }

    if (accountType === 'P') {
      // Pd Admins can only create teachers and students
      base.removeObjects(['Admin', 'Pd Admin']);
      return base;
    }

    if (accountType === 'T') {
      // teachers can only create students
      base.removeObjects(['Teacher', 'Pd Admin', 'Admin']);
      return base;
    }
    // students cannot create new users currently
    return [];
  }.property('currentUser.accountType'),

  initialAccountType: function() {
    let allowedTypes = this.get('allowedAccountTypes');

    if (allowedTypes.includes('Teacher')) {
      return 'Teacher';
    }
    return 'Student';
  }.property('allowedAccountTypes.[]'),

  orgOptions: function() {
    let orgs = this.get('organizations'); // fetched in route

    if (!orgs) {
      return [];
    }

    return orgs
    .toArray()
    .map((org) => {
      return {
        id: org.id,
        name: org.get('name')
      };
    });
  }.property('organizations.[]'),

  // used by selectize input to determine if
  // a new item (org request) should be created
  createOrgRequestFilter(orgRequest) {
    if (!orgRequest) {
      return false;
    }
    let orgs = this.get('organizations');
    let requestLower = orgRequest.trim().toLowerCase();
    let orgNamesLower = orgs.map( (org) => {
      return org.get('name').toLowerCase();
    });
    // don't let user create org request if it matches exactly an existing org name
    return !_.contains(orgNamesLower, requestLower);
  },
  getSimilarOrgs(orgRequest) {
    let stopWords = ['university', 'college', 'school', 'the', 'and', 'of', 'for', ' ', 'institution', 'academy'];

    let orgs = this.get('organizations');

    if (!orgs) {
      return [];
    }

    let sliced = orgs.toArray().slice();

    let requestCompare = this.get('similarity').convertStringForCompare(orgRequest, stopWords);

    let similarOrgs = _.filter(sliced, (org => {
      let name = org.get('name');
      let compare = this.get('similarity').convertStringForCompare(name, stopWords);
      let score = this.get('similarity').compareTwoStrings(compare, requestCompare);
      return score > 0.5;
    }));
    return similarOrgs;
  },


  buildForm() {
    let fieldNames = ['accountType','firstName', 'lastName', 'username', 'email', 'confirmEmail', 'password', 'confirmPassword', 'organization', 'location', 'isAuthorized'];

    let results = {};

    fieldNames.forEach((fieldName) => {
      results[fieldName] = this.buildFormField(fieldName);
    });

    return results;
  },

  buildFormField(fieldName) {
    let validator = this.validateFieldFn.bind(this);
    let isRequired = this.isFieldRequired(fieldName);
    let onInput = this.onFormFieldInput.bind(this);
    let onBlur = this.onFormFieldBlur.bind(this);
    let dismissError = this.dismissError.bind(this);

    let fieldNameDecamel = fieldName.decamelize();

    let labelText = fieldNameDecamel.replace(/_/, ' ');

    if (fieldName === 'isAuthorized') {
      labelText = 'Authorized';
    }

    let initialValue = null;

    if (fieldName === 'accountType') {
      initialValue = this.get('selectedType');
    }

    if (fieldName === 'organization') {
      initialValue = this.get('initialOrg');
    }

    if (fieldName === 'isAuthorized') {
      initialValue = true;
    }

    let fieldToMatch;

    if (fieldName === 'confirmEmail') {
      fieldToMatch = 'email';
    } else if (fieldName === 'confirmPassword') {
      fieldToMatch = 'password';
    }

    let passwordFields = ['password', 'confirmPassword'];
    let isPassword = passwordFields.includes(fieldName);

    return {
      label: {
        text: labelText,
        tooltip: {
          text: `User's ${labelText}`,
        },
        isRequired,
      },
      input: {
        id: `user-new-${fieldName.dasherize()}`,
        placeholder: `Enter the user's ${labelText}`,
        fieldName,
        onInput,
        onBlur,
        dismissError,
        validator,
        isPassword,
        fieldToMatch,
        isRequired,
        errors: {
          validation: [],
          dismissable: [],
        },
        isDirty: initialValue ? true : false,
        isValid: isRequired ? false : null,
        value: initialValue,
      },
      className: fieldName.dasherize(),

    };
  },
  isFieldRequired(fieldName) {
    let isCreatingStudent = this.get('isCreatingStudent');

    if (!isCreatingStudent) {
      return true;
    }

    // console.log(`Is ${fieldName} required?`, `is creating student? ${isCreatingStudent}`);
    let studentOptionalFields = ['firstName', 'lastName', 'email', 'location'];

    return !studentOptionalFields.includes(fieldName);

  },

  validateFieldFn(value, fieldName) {
    let validator = this.get('validator');

    let constraints = {
      [fieldName]: this.get('constraints.' + fieldName)
    };

    let values = {
      [fieldName]: value
    };

    let isCreatingStudent = this.get('isCreatingStudent');

    if (isCreatingStudent) {
      let optionalFields = ['firstName', 'lastName', 'email', 'location'];
      let isOptional = optionalFields.includes(fieldName);

      if (isOptional) {
        let trimmed = typeof value === 'string' ? value.trim() : '';
        console.log(`optional ${fieldName} trimmed value: `, trimmed);
        if (trimmed.length === 0) {
          // empty optional field, no errors;
          return;
        }

      }
    }

    let fieldToMatch = this.get(`formFields.${fieldName}.input.fieldToMatch`);

    if (fieldToMatch) {
      values[fieldToMatch] = this.get(`formFields.${fieldToMatch}.input.value`);
    }

    let errors = validator.validate(values, constraints);

    // if (fieldName === 'organization' || fieldName === 'accountType') {
    //   this.onFormFieldInput(fieldName, value, errors);
    // }
    return errors;
    // let accessor = `formInputs.${fieldName}`;

    // // let isValid = errors ? false : true;
    // let isDirty = this.get(`${accessor}.isDirty`);

    // return {
    //   errors,
    //   isDirty
    // };

    // should we check to see if anything changed before setting?

    // check if field isDirty (whether user has interacted with it)
    // only display errors if isDirty

    // let accessor = `formInputs.${fieldName}`;

    // this.set(`${accessor}.isValid`, isValid);

    // let isDirty = this.get(`${accessor}.isDirty`);

    // if (isDirty) {
    //   let errorPropName = this.get(`${accessor}.errorPropName`);

    //   this.set(errorPropName, isValid ? []: errors[fieldName]);
    // }

    // this.set('formFields', this.buildForm());

  },

  onFormFieldInput(value, fieldName) {

    let errors = this.validateFieldFn(value, fieldName);
    let accessor = `formFields.${fieldName}.input`;
    // console.log('onFormFieldInput', {fieldName, value, errors});
    this.set(`${accessor}.value`, value);

    this.set(`${accessor}.errors.validation`, errors ? errors[fieldName] : []);

    this.set(`${accessor}.isValid`, errors ? false : true);


    if (fieldName === 'organization' || fieldName === 'accountType') {
      let wasDirty = this.get(`${accessor}.isDirty`);

      if (!wasDirty) {
        this.set(`${accessor}.isDirty`, true);
      }
    }
  },

  onFormFieldBlur(value, fieldName) {
    // console.log('onFormFieldBlur', {fieldName, value});
    let accessor = `formFields.${fieldName}.input`;
    let wasDirty = this.get(`${accessor}.isDirty`);

    if (!wasDirty) {
      this.set(`${accessor}.isDirty`, true);
    }
  },

  runValidator(fieldName, options = {}) {
    let accessor = `formFields.${fieldName}.input`;

    let value = this.get(`${accessor}.value`);

    console.log('running validator: ', {fieldName, value});
    let errors = this.validateFieldFn(value, fieldName);

      console.log('errors runval', errors);

    this.set(`${accessor}.errors.validation`, errors ? errors[fieldName] : []);
    this.set(`${accessor}.isValid`, errors ? false : true);

    let { isFromFormSubmit } = options;

    if (isFromFormSubmit) {
      this.set(`${accessor}.isDirty`, true);
    }
    return errors;
  },

  validateForm() {
    let fields = this.get('formFields');

    let isValid = true;

    _.keys(fields).forEach(fieldName => {
      let errors = this.runValidator(fieldName, {isFromFormSubmit: true});
      console.log('errors', errors);
      if (errors && isValid) {
        console.log(`${fieldName} is in error: `, errors);
        isValid = false;
      }
    });

    return isValid;
  },

  isFormValid() {
    let fields = this.get('formFields');

    if (!fields) {
      return false;
    }

    let invalidField = Object.keys(fields).find((fieldName) => {
      return !fields[fieldName].input.isValid;
    });

    return !invalidField;
  },

  collectValues() {
    let fields = this.get('formFields');

    if (!fields) {
      return {};
    }

    // these do not get sent to server
    let fieldsToOmit = ['confirmEmail', 'confirmPassword'];

    let values = {};

    _.each(fields, (details, fieldName) => {
      let value = details.input.value;

      if (fieldName === 'accountType') {
        value = value.charAt(0).toUpperCase();
      }

      if (fieldName === 'organization' && value) {
        console.log('org val: ', value);
        value = value.id;
      }


      if (!fieldsToOmit.includes(fieldName)) {
        values[fieldName] = value;
      }
    });

    values.orgRequest = this.get('orgRequest');

    values.createdBy = this.get('currentUser.id');
    if (values.isAuthorized) {
      values.authorizedBy = this.get('currentUser.id');
    }
    return values;

  },

  createUser(data) {
    return new Promise((resolve, reject) => {
      if (!data) {
        return reject('Invalid data');
      }
      Ember.$.post({
        url: '/auth/signup',
        data: data
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
    });
  },

  updateErrorsProp(fieldName, errorType, errors) {
    let accessor = `formFields.${fieldName}.input.errors.${errorType}`;
    console.log({accessor, errors});
    if (typeof errors === 'string') {
      errors = [errors];
    }
    this.set(accessor, errors);
  },

  dismissError(fieldName, error) {
    let accessor = `formFields.${fieldName}.input.errors.dismissable`;
    console.log({accessor, error});
    let errors = this.get(accessor);

    if (errors) {
      this.get(accessor).removeObject(error);
    }

  },


  actions: {
    toUserInfo: function(user) {
      this.sendAction('toUserInfo', user);
    },
    toUserHome: function () {
      this.sendAction('toUserHome');
    },
    processOrgRequest(input, callback) {
      let similarOrgs = this.getSimilarOrgs(input);
      let modalSelectOptions = {};

      if (similarOrgs.get('length') > 0) {
        let text = `Are you sure you want to submit a new organization request for ${input}? We found ${similarOrgs.get('length')} organizations with similar names. Please review the options in the dropdown to see if your desired organization already exists. If you decide to proceed with the organization request, the creation of the organization will be contingent on an admin's approval.`;
        for (let org of similarOrgs) {
          let id = org.get('id');
          let name = org.get('name');
          modalSelectOptions[id] = name;
        }
        modalSelectOptions[input] = `Yes, I am sure I want to create ${input}`;

        this.get('alert').showPromptSelect('Similar Orgs Found', modalSelectOptions, 'Choose existing org or confirm request', text)
        .then((result) => {
          if (result.value) {
            // user confirmed org request
            if (result.value === input) {
              this.set('didConfirmOrgRequest', true);
              this.set('orgRequest', input);
              let ret = {
                name: input,
                id: input
              };
              this.validateFieldFn('organization', input);
              return callback(ret);
            }

            let selectId = '#user-new-org-select';
            // user selected an existing org
            this.$(selectId)[0].selectize.setValue(result.value, true);
            this.$(selectId)[0].selectize.removeOption(input);
            return callback(null);

          } else {
            // user hit cancel
            // remove option from dropdown
            this.$('select')[0].selectize.removeOption(input);
            return callback(null);
          }
        });
      }
      // no similar orgs, create org request
      let ret = {
        name: input,
        id: input
      };
      this.set('orgRequest', input);

      this.validateFieldFn('organization', input);
      return callback(ret);


    },
    closeError: function (error) {
      $(`.${error}`).addClass('fadeOutRight');
      Ember.run.later(() => {
        $(`.${error}`).removeClass('fadeOutRight');
        $(`.${error}`).hide();
      }, 500);
    },
    updateSelectedType(accountType) {
      // if accountType is either changing from non-student to student or from non-student to student, rebuild the constraints
      let oldAccountType = this.get('formFields.accountType.input.value');
      let wasStudent = oldAccountType === 'Student';
      let didSelectStudent = accountType === 'Student';

      // this.set('selectedType', accountType);
      this.onFormFieldInput(accountType, 'accountType');
      // this.validateFieldFn('accountType', accountType);
      if ((wasStudent && !didSelectStudent) || (!wasStudent && didSelectStudent)) {

        let validator = this.get('validator');
        this.set('constraints', validator.buildConstraints(accountType, this.get('allowedAccountTypes')));

        // update isRequired for student optional fields
        // will trigger validators to rerun on these fields
        let fieldsToRerun = ['email', 'firstName', 'lastName', 'location'];
        fieldsToRerun.forEach((field) => {
          let accessor = `formFields.${field}`;

          let isRequired = this.isFieldRequired(field);
          this.set(`${accessor}.input.isRequired`, isRequired);
          this.set(`${accessor}.label.isRequired`, isRequired);

          let value = this.get(`${accessor}.value`);
          let errors = this.validateFieldFn(value, field);
          this.set(`${accessor}.input.errors.validation`, errors ? errors[field] : []);
        });
      }

    },

    newUser: function () {
      var username = this.get('username');
      var password = this.get('password');
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      var email = this.get('email');
      var organization = this.get('org');
      var location = this.get('location');
      var accountType = this.get('selectedType');
      var accountTypeLetter;
      if (accountType) {
        accountTypeLetter = accountType.charAt(0).toUpperCase();
      } else {
        this.set('missingAccountType', true);
        $('.account').show();
        return;
      }
      var isAuthorized = this.get('isAuthorized');
      var currentUserId = this.get('currentUser').get('id');

      if (!username || !password) {
        this.set('errorMessage', true);
        $('.required').show();
        return;
      }

      if (accountTypeLetter !== "S") {
        this.set('actingRole', 'teacher');
        if (!email) {
          this.set('errorMessage', true);
          return;
        }
      } else {
        email = null;
      }

      if (isAuthorized) {
        let userData = {
          username,
          password,
          firstName,
          lastName,
          email,
          location,
          accountType: accountTypeLetter,
          isAuthorized: true,
          authorizedBy: currentUserId,
          createdBy: currentUserId,
        };
        this.set('authorizedBy', currentUserId);
        this.set('newUserData', userData);
      } else {
        let userData = {
          username: username,
          password: password,
          firstName,
          lastName,
          email: email,
          location: location,
          accountType: accountTypeLetter,
          isAuthorized: false,
          createdBy: currentUserId,
        };
        this.set('newUserData', userData);
      }

      if (!username) {
        return;
      }

      return this.handleOrg(organization)
        .then((org) => {
          let newUserData = this.get('newUserData');
          newUserData.organization = org;
          return this.createNewUser(newUserData)
            .then((res) => {
              if (res.username) {
                this.get('alert').showToast('success', `${res.username} created`, 'bottom-end', 3000, null, false);
                return this.sendAction('toUserInfo', res.username);
              }
              if (res.message === 'There already exists a user with that username') {
                this.set('usernameError', this.get('usernameErrors.taken'));
              } else if (res.message === 'There already exists a user with that email address') {
                this.set('emailError', this.get('emailErrors.taken'));

              } else {
                this.set('createUserErrors', [res.message]);
              }
            })
            .catch((err) => {
              this.handleErrors(err, 'createUserErrors', newUserData);
            });
        })
        .catch((err) => {
          // err should be handled within handleOrg function
          console.log('err', err);
        });
    },

    signup: function () {

      let isFormValid = this.validateForm();
      console.log({isFormValid});
      // runs all validators; any errors will be displayed
      if (!isFormValid) {
        return;
      }

      let createUserData = this.collectValues();
      console.log({createUserData});
      // make sure user did not type in existing org

        return this.createUser(createUserData)
        .then((res) => {
          console.log({res});
          if (res.username) {
            this.get('alert').showToast('success', `${res.username} created`, 'bottom-end', 3000, null, false);
            return this.sendAction('toUserInfo', res.username);
      } else if (res.message === 'There already exists a user with that username') {
            this.set('usernameError', this.get('usernameErrors.taken'));
            console.log('setting');
            this.updateErrorsProp('username', 'dismissable', this.get('usernameErrors.taken'));
          } else if (res.message === 'There already exists a user with that email address') {
            this.set('emailError', this.get('emailErrors.taken'));
            this.updateErrorsProp('email', 'dismissable', this.get('emailErrors.taken'));

          } else {
            console.log('else', res.message);
            this.set('postErrors', [res.message]);
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'postErrors');
        });
    },

    setOrg(val, $item) {
      // val is orgId
      if (!val) {
        return;
      }

      let isRemoval = _.isNull($item);
      if (isRemoval) {
        this.set('org', null);
        this.set('orgRequest', null); // they could be removing a previously added org request
        this.validateFieldFn('organization', null);
        return;
      }

      let org = this.get('organizations').findBy('id', val);
      if (!org) {
        return;
      }
      this.set('org', org);

      this.validateFieldFn('organization', org);
    },

    updateIsAuthorized(val) {
      this.toggleProperty('formFields.isAuthorized.input.value');
    },
    cancelNew: function () {
      this.sendAction('toUserHome');
    },

  },
});

