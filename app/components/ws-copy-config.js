/*global _:false */
import Ember from 'ember';






export default Ember.Component.extend({
  elementId: 'ws-copy-config',
  showCustomConfig: Ember.computed.equal('selectedConfig', 'D'),
  utils: Ember.inject.service('utility-methods'),

  validConfigValues: function () {
    const configInputs = this.get('copyConfig.inputs');

    if (this.get('utils').isNonEmptyArray(configInputs)) {
      return configInputs.map(input => input.value);
    }
    return [];

  }.property('copyConfig'),

  didReceiveAttrs() {
    const newWsConfig = this.get('newWsConfig');
    const selectedConfig = this.get('selectedConfig');

    const validValues = this.get('validConfigValues');
    // if reaching via back button, set selectedConfig to previously selected value
    // else set as A
    if (validValues.includes(newWsConfig)) {
      this.set('selectedConfig', newWsConfig);
    } else if (!validValues.includes(selectedConfig)) {
      this.set('selectedConfig', 'A');
    }

    this._super(...arguments);
  },

  actions: {
    next() {
      const selectedConfig = this.get('selectedConfig');
      const validConfigValues = this.get('validConfigValues');

      if (validConfigValues.includes(selectedConfig)) {
        this.get('onProceed')(this.get('selectedConfig'));
        return;
      }
      this.set('invalidOrMissingConfig', true);
    },

    nextCustom(customConfig) {
      // make sure user has chosen a configuration that has at least 1 submission
      if (!this.get('utils').isNonEmptyObject(customConfig)) {
        return;
      }

      let submissionOptions = customConfig.submissionOptions;
      let isAllSubmissions;
      let customSubmissionsCount;

      if (_.isObject(submissionOptions)) {
        isAllSubmissions = submissionOptions.all === true;
        let customIds = submissionOptions.submissionIds;

        if (_.isArray(customIds)) {
          customSubmissionsCount = customIds.length;
        }
      }
      if (isAllSubmissions || customSubmissionsCount > 0) {
        this.get('onProceed')(this.get('selectedConfig'), customConfig);
      } else {
        // insufficient submissions
        this.set('insufficientSubmissions', true);
      }
    },
    back() {
      this.get('onBack')(-1);
    }
  }
});