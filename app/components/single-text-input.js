Encompass.SingleTextInputComponent = Ember.Component.extend({
  classNames: ['single-text-input-container'],

  classNameBindings: ['isErrored:has-errors'],

  value: '',
  isDirty: Ember.computed.alias('options.isDirty'),
  isShowingPassword: false,
  inputType: 'text',

  validationErrors: Ember.computed.alias('options.errors.validation'),
  dismissableErrors: Ember.computed.alias('options.errors.dismissable'),

  hasValue: Ember.computed.notEmpty('options.value'),

  hasValidationErrors: Ember.computed.gt('validationErrors.length', 0),
  hasDismissableErrors: Ember.computed.gt('dismissableErrors.length', 0),

  showValidationErrors: Ember.computed.and('isDirty', 'hasValidationErrors'),

  isErrored: Ember.computed.or('showValidationErrors', 'hasDismissableErrors'),

  wasRequired: null,

  didReceiveAttrs() {
    let inputType = this.get('options.isPassword') ? 'password' : 'text';
    let originalType = this.get('inputType');

    if (inputType !== originalType) {
      this.set('inputType', inputType);
    }
    let wasRequired = this.get('wasRequired');

    if (wasRequired === null) {
      this.set('wasRequired', this.get('options.isRequired'));
    }
  },

  togglePasswordIconClass: function() {
    return this.get('isShowingPassword') ? 'fas fa-eye-slash' : 'fas fa-eye';
  }.property('isShowingPassword'),

  runValidator(value) {
    let validator = this.get('options.validator');
    let fieldName = this.get('options.fieldName');

    if (validator) {

      let errors = validator(fieldName, value);

      let currentValidationErrors = this.get('validationErrors');

      if (errors) {
        this.set('validationErrors', errors[fieldName]);
      } else {
        if (currentValidationErrors) {
          this.set('validationErrors', null);
        }
      }

      // run async validator if one?

      let formInputHandler = this.get('options.formInputHandler');

      if (formInputHandler) {
        formInputHandler(fieldName, value, errors); // update parent/form
      }

    }

  },

  actions: {
    handleEvent(handlerName, ev) {
      let inputValue = typeof ev === 'string' ? ev : ev.target.value;


      let handler = this.get(`options.${handlerName}`);

      if (handler) {
        let fieldName = this.get('options.fieldName');
        handler(inputValue, fieldName);
      }
    },

    dismissError(error) {
      let handler = this.get('dismissError');
      let fieldName = this.get('options.fieldName');
      if (handler) {
        handler(fieldName, error);
      }
    },

    toggleShowPassword() {
      let isNowPassword = this.get('inputType') === 'password';
      this.set('inputType', isNowPassword ? 'text' : 'password');
      this.toggleProperty('isShowingPassword');

    }

  },

});