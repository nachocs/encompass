/*global _:false */
import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  elementId: 'workspace-new-settings',
  workspacePermissions: [],
  utils: Ember.inject.service('utility-methods'),
  alert: Ember.inject.service('sweet-alert'),
  isEditingPermissions: false,
  unsavedCollaborator: null,
  selectedMode: 'private',
  selectedSubmissionSettings: 'all',

  validModeValues: function () {
    const modeInputs = this.get('modeInputs.inputs');

    if (this.get('utils').isNonEmptyArray(modeInputs)) {
      return modeInputs.map(input => input.value);
    }
    return [];

  }.property('modeInputs'),
  constraints: function () {
    let res = {
      workspaceName: {
        presence: { allowEmpty: false },
        length: { maximum: 500 },
      },

      owner: {
        presence: { allowEmpty: false }
      },

      privacySetting: {
        inclusion: {
          within: this.get('validModeValues'),
          message: 'must be a valid option.'
        }
      },
    };

    return res;

  }.property('validModeValues', 'doCreateFolderSet'),
  submissionSettingsInputs: {
    groupName: 'submissionSettings',
    required: true,
    inputs: [
      {
        value: 'all',
        label: 'All Submissions',
        moreInfo: 'Workspace will include all revisions',
      },
      {
        value: 'mostRecent',
        label: 'Most Recent Only',
        moreInfo: 'Workspace will only include submissions of record',
      },
    ]
  },
  modeInputs: function () {
    let res = {
      groupName: 'mode',
      required: true,
      inputs: [
        {
          value: 'private',
          label: 'Private',
          moreInfo: 'Workspace will only be visible to the owner and collaborators',
        },
        {
          value: 'org',
          label: 'My Org',
          moreInfo: 'Workspace will be visible to everyone belonging to your org',
        },
        {
          value: 'public',
          label: 'Public',
          moreInfo: 'Workspace will be visible to every Encompass user',
        },
      ]
    };

    if (this.get('currentUser.isStudent') || !this.get('currentUser.isAdmin')) {
      return res;
    }

    res.inputs.push({
      value: 'internet',
      label: 'Internet',
      moreInfo: 'Workspace will be accesible to any user with a link to the workspace',
    });
    return res;
  }.property('currentUser.isStudent', 'currentUser.isAdmin'),

  ownerOptions: function () {
    if (this.get('users')) {
      return this.get('users').map((user) => {
        return {
          id: user.get('id'),
          username: user.get('username')
        };
      });
    }
    return [];
  }.property('users.[]'),
  folderSetOptions: function () {
    if (this.get('folderSets')) {
      return this.get('folderSets').map((folderSet) => {
        return {
          id: folderSet.get('id'),
          name: folderSet.get('name')
        };
      });
    }
    return [];
  }.property('folderSets.[]'),

  initialCollabOptions: function () {
    let peeked = this.get('store').peekAll('user');
    let collabs = this.get('selectedCollaborators');

    if (!_.isObject(peeked)) {
      return [];
    }
    let filtered = peeked.reject((record) => {
      return collabs[record.get('id')];
    });
    return filtered.map((obj) => {
      return {
        id: obj.get('id'),
        username: obj.get('username')
      };
    });
  }.property('selectedCollaborators'),

  selectedCollaborators: function () {
    let hash = {};
    // let wsOwnerId = this.get('workspace.owner.id');

    // no reason to set owner as a collaborator
    // if (wsOwnerId) {
    //   hash[wsOwnerId] = true;
    // }
    const workspacePermissions = this.get('workspacePermissions');

    if (!this.get('utils').isNonEmptyArray(workspacePermissions)) {
      return hash;
    }
    workspacePermissions.forEach((obj) => {
      let user = obj.user;
      if (_.isString(user)) {
        hash[user] = true;
      } else if (_.isObject(user)) {
        hash[user.get('id')] = true;
      }
    });
    return hash;
  }.property('workspacePermissions.[]',),
  actions: {
    updateSelectizeSingle(val, $item, propToUpdate, model) {
      if (_.isNull($item)) {
        this.set(propToUpdate, null);
        return;
      }
      let record = this.get('store').peekRecord(model, val);
      if (!record) {
        return;
      }
      this.set(propToUpdate, record);
    },
    handleSettings() {
      let errors;
      const workspaceName = this.get('workspaceName');
      const owner = this.get('selectedOwner');
      const privacySetting = this.get('selectedMode');
      const folderSet = this.get('selectedFolderSet');
      const permissions = this.get('workspacePermissions');
      const submissionSettings = this.get('selectedSubmissionSettings');

      errors = window.validate({ workspaceName, owner, privacySetting }, this.get('constraints'));

      if (this.get('utils').isNonEmptyObject(errors)) {
        this.get('alert').showToast('error', 'Missing required info', 'bottom-end', 3000, false, null);
        for (let key of Object.keys(errors)) {
          let errorProp = `${key}Errors`;
          this.set(errorProp, errors[key]);
        }
        return;
      }

      const settings = {
        requestedName: workspaceName,
        owner,
        mode: privacySetting,
        folderSet,
        permissionObjects: permissions,
        submissionSettings
      };

      if (this.get('isEditingPermissions')) {
        // prompt user to confirm they want to proceed
        let username = this.get('unsavedCollaborator.username');

        let title = 'Are you sure you want to proceed?';
        let text = `You are currently in the process of editing permissions for ${username}. You will lose any unsaved changes if you continue.`;

        return this.get('alert').showModal('warning', title, text, 'Proceed')
          .then((result) => {
            if (result.value) {
              this.get('onProceed')(settings);
              return;
            }
          });
      } else {
        this.get('onProceed')(settings);
      }
    },
    back() {
      this.get('onBack')();
    }
  },

});