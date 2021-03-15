/*global _:false */
import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'ws-copy-owner-settings',
  utils: Ember.inject.service('utility-methods'),
  strSimilarity: Ember.inject.service('string-similarity'),

  constraints: function () {
    let res = {
      name: {
        presence: { allowEmpty: false },
        length: { maximum: 500 },
      },

      owner: {
        presence: { allowEmpty: false }
      },

      mode: {
        inclusion: {
          within: this.get('validModeValues'),
          message: 'Please select a valid mode.'
        }
      },
      doCreateFolderSet: {
        inclusion: {
          within: [true, false],
          message: ''
        }
      },
    };

    if (!this.get('doCreateFolderSet')) {
      return res;
    }

    res.folderSetName = {
      presence: { allowEmpty: false },
      length: { maximum: 500 },
    };

    res.folderSetPrivacySetting = {
      inclusion: {
        within: ['M', 'O', 'E'],
      }
    };
    return res;

  }.property('validModeValues', 'doCreateFolderSet'),

  validModeValues: function () {
    const modeInputs = this.get('modeInputs.inputs');

    if (this.get('utils').isNonEmptyArray(modeInputs)) {
      return modeInputs.map(input => input.value);
    }
    return [];

  }.property('modeInputs'),

  didReceiveAttrs() {
    const newWsOwner = this.get('newWsOwner');
    const newWsName = this.get('newWsName');
    const newWsMode = this.get('newWsMode');
    const newFolderSetOptions = this.get('newFolderSetOptions');
    const utils = this.get('utils');

    if (utils.isNonEmptyObject(newWsOwner)) {
      this.set('selectedOwner', newWsOwner);
    } else if (!utils.isNonEmptyObject(this.get('selectedOwner'))) {
      this.set('selectedOwner', this.get('currentUser'));
    }

    if (utils.isNonEmptyString(newWsName)) {
      this.set('selectedName', newWsName);
    } else if (!utils.isNonEmptyString(this.get('selectedName'))) {
      this.set('selectedName', `Copy of ${this.get('workspace.name')}`);
    }

    if (utils.isNonEmptyString(newWsMode)) {
      this.set('selectedMode', newWsMode);
    } else if (!utils.isNonEmptyString(this.get('selectedMode'))) {
      this.set('selectedMode', 'private');
    }

    if (utils.isNonEmptyObject(newFolderSetOptions)) {
      this.set('doCreateFolderSet', newFolderSetOptions.doCreateFolderSet);
      this.set('folderSetName', newFolderSetOptions.name);
      this.set('folderSetPrivacy', newFolderSetOptions.privacySetting);
      this.set('existingFolderSetToUse', this.get('existingFolderSet'));

    } else if (utils.isNullOrUndefined(this.get('doCreateFolderSet'))) {
      this.set('doCreateFolderSet', false);
    }

    this._super(...arguments);
  },

  initialOwnerItem: function () {
    const selectedOwner = this.get('selectedOwner');
    if (this.get('utils').isNonEmptyObject(selectedOwner)) {
      return [selectedOwner.id];
    }
    return [];
  }.property('selectedOwner'),

  initialOwnerOptions: function () {
    const selectedOwner = this.get('selectedOwner');

    if (this.get('utils').isNonEmptyObject(selectedOwner)) {
      return [
        {
          id: selectedOwner.id,
          username: selectedOwner.get('username')
        }
      ];
    }
    return [];
  }.property('selectedOwner'),
  initialFolderSetItem: function () {
    const existingFolderSet = this.get('existingFolderSet');
    if (this.get('utils').isNonEmptyObject(existingFolderSet)) {
      return [existingFolderSet.get('id')];
    }
    return [];
  }.property('existingFolderSet'),

  initialFolderSetOptions: function () {
    const folderSets = this.get('folderSets');
    if (folderSets) {
      return folderSets.map((folderSet) => {
        return {
          id: folderSet.get('id'),
          name: folderSet.get('name')
        };
      });
    }
    return [];
  }.property('folderSets.[]'),

  isPublicFolderSetNameTaken: function (name) {
    let folderSets = this.get('folderSets');
    if (!folderSets || typeof name !== 'string') {
      return false;
    }
    if (folderSets) {
      let existingFs = folderSets.find((fs) => {
        return !fs.get('isTrashed') && fs.get('privacySetting') === 'E' && this.get('strSimilarity').compareTwoStrings(name, fs.get('name')) === 1;
      });
      return existingFs !== undefined;
    }
    return false;
  },

  actions: {
    next() {
      const name = this.get('selectedName');
      const owner = this.get('selectedOwner');
      const mode = this.get('selectedMode');
      const folderSetName = this.get('folderSetName');
      const folderSetPrivacySetting = this.get('folderSetPrivacy');

      if (folderSetPrivacySetting === 'E' && this.isPublicFolderSetNameTaken(folderSetName)) {
        this.set('duplicateFolderSetName', true);
        return;
      }
      const doCreateFolderSet = this.get('doCreateFolderSet');

      // clear old values if the 'No' radio button is selected and next is hit
      let errors;

      if (!doCreateFolderSet) {
        this.set('folderSetName', null);
        this.set('folderSetPrivacy', null);
        errors = window.validate({ name, owner, mode, doCreateFolderSet }, this.get('constraints'));
      } else {
        errors = window.validate({ name, owner, mode, doCreateFolderSet, folderSetName, folderSetPrivacySetting }, this.get('constraints'));
      }

      if (this.get('utils').isNonEmptyObject(errors)) {
        for (let key of Object.keys(errors)) {
          let errorProp = `${key}Errors`;
          this.set(errorProp, errors[key]);
        }
        return;
      }

      const folderSetOptions = {
        doCreateFolderSet: doCreateFolderSet,
        existingFolderSetToUse: this.get('existingFolderSetToUse.id'),
        name: folderSetName,
        privacySetting: folderSetPrivacySetting
      };

      this.get('onProceed')(name, owner, mode, folderSetOptions);
    },
    setOwner(val, $item) {
      if (!val) {
        return;
      }
      const isRemoval = _.isNull($item);
      if (isRemoval) {
        this.set('selectedOwner', null);
        return;
      }
      const user = this.get('store').peekRecord('user', val);
      this.set('selectedOwner', user);
    },
    setFolderSet(val, $item) {
      if (!val) {
        return;
      }
      const isRemoval = _.isNull($item);
      if (isRemoval) {
        this.set('existingFolderSetToUse', null);
        return;
      }
      const folderSet = this.get('store').peekRecord('folder-set', val);
      this.set('existingFolderSetToUse', folderSet);
    },

    toggleCreateFolderset(val) {
      this.set('doCreateFolderSet', val);
    },
    back() {
      this.get('onBack')(-1);
    }
  }
});