import Component from '@ember/component';
import { computed } from '@ember/object';
/*global _:false */
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',
  elementId: 'ws-copy-custom-config',
  submissionStudents: () => [],
  utils: service('utility-methods'),

  SubmissionIds: alias('customConfig.SubmissionIds'),
  submissionOptions: alias('customConfig.submissionOptions'),
  selectionOptions: alias('customConfig.selectionOptions'),
  commentOptions: alias('customConfig.commentOptions'),
  responseOptions: alias('customConfig.responseOptions'),
  folderOptions: alias('customConfig.folderOptions'),
  showStudentSubmissionInput: equal('submissionOptions.byStudent', true),
  selectedAllSubmissions: equal('submissionOptions.all', true),
  selectedCustomSubmission: equal('submissionOptions.custom', true),
  customSubmissionIds: () => [],

  showCustomSubmissions: computed(
    'submissionOptions.custom',
    'showCustomSubmissionViewer',
    function () {
      return (
        this.submissionOptions.custom === true &&
        this.showCustomSubmissionViewer
      );
    }
  ),
  showCustomSubmissionViewer: true,
  closedCustomView: computed(
    'showCustomSubmissionViewer',
    'submissionOptions.custom',
    function () {
      return (
        this.submissionOptions.custom === true &&
        !this.showCustomSubmissionViewer
      );
    }
  ),

  didReceiveAttrs() {
    // console.log('did receive attra ws-copy-custom-config');
    this._super(...arguments);
  },
  willDestroyElement() {
    this._super(...arguments);
    if (this.insufficientSubmissions) {
      this.set('insufficientSubmissions', null);
    }
  },

  formattedSubmissionOptions: computed(
    'customSubmissionIds.[]',
    'submissionOptions.{all,byStudent,custom}',
    'submissionsFromStudents.[]',
    function () {
      let submissionOptions = {
        all: true,
      };

      if (this.submissionOptions.all) {
        return submissionOptions;
      }
      delete submissionOptions.all;

      if (this.submissionOptions.byStudent) {
        submissionOptions.submissionIds = this.submissionsFromStudents.mapBy(
          'id'
        );

        return submissionOptions;
      }

      if (this.submissionOptions.custom) {
        const customIds = this.customSubmissionIds;
        if (this.utils.isNonEmptyArray(customIds)) {
          submissionOptions.submissionIds = customIds;
        } else {
          submissionOptions.submissionIds = [];
        }
        return submissionOptions;
      }
      return;
    }
  ),

  formattedFolderOptions: computed(
    'folderOptions.{IncludeStructureOnly,all,includeStructureOnly,none}',
    function () {
      let folderOptions = {
        all: true,
      };

      if (this.folderOptions.all) {
        folderOptions.includeStructureOnly = false;
        return folderOptions;
      }

      if (this.folderOptions.includeStructureOnly) {
        folderOptions.includeStructureOnly = true;
        return folderOptions;
      }
      delete folderOptions.all;
      delete folderOptions.includeStructureOnly;
      folderOptions.none = true;
      return folderOptions;
    }
  ),

  formattedSelectionOptions: computed(
    'selectionOptions.{all,none,custom}',
    'selectionsFromSubmissions.[]',
    function () {
      let selectionOptions = {
        all: true,
      };

      if (this.selectionOptions.all) {
        return selectionOptions;
      }

      if (this.selectionOptions.none) {
        selectionOptions.none = true;
        delete selectionOptions.all;

        return selectionOptions;
      }

      delete selectionOptions.all;
      selectionOptions.selectionIds = this.selectionsFromSubmissions.mapBy(
        'id'
      );

      return selectionOptions;
    }
  ),

  formattedCommentOptions: computed(
    'commentsFromSelections.[]',
    'commentOptions.all',
    'commentOptions.none',
    'commentOptions.custom',
    function () {
      let commentOptions = {
        all: true,
      };

      if (this.commentOptions.all) {
        return commentOptions;
      }

      if (this.commentOptions.none) {
        commentOptions.none = true;
        delete commentOptions.all;

        return commentOptions;
      }

      delete commentOptions.all;
      commentOptions.commentIds = this.commentsFromSelections.mapBy('id');

      return commentOptions;
    }
  ),

  formattedResponseOptions: computed(
    'responsesFromSubmissions.[]',
    'responseOptions.all',
    'responseOptions.none',
    'responseOptions.custom',
    function () {
      let responseOptions = {
        all: true,
      };

      if (this.responseOptions.all) {
        return responseOptions;
      }

      if (this.responseOptions.none) {
        responseOptions.none = true;
        delete responseOptions.all;

        return responseOptions;
      }
      delete responseOptions.all;
      responseOptions.responseIds = this.responsesFromSubmissions.mapBy('id');

      return responseOptions;
    }
  ),

  formattedConfig: computed(
    'formattedSubmissionOptions.@each{all,none,custom}',
    'formattedSelectionOptions.@each{all,none,custom}',
    'formattedCommentOptions.@each{all,none,custom}',
    'formattedResponseOptions.@each{all,none,custom}',
    'formattedFolderOptions.@each{all,none,includeStructureOnly}',
    function () {
      return {
        submissionOptions: this.formattedSubmissionOptions,
        folderOptions: this.formattedFolderOptions,
        selectionOptions: this.formattedSelectionOptions,
        commentOptions: this.formattedCommentOptions,
        responseOptions: this.formattedResponseOptions,
      };
    }
  ),

  customConfig: {
    submissionOptions: {
      all: true,
      byStudent: false,
      custom: false,
      submissionIds: [],
    },
    folderOptions: {
      all: true,
      includeStructureOnly: false,
      none: false,
      folderIds: [],
    },
    selectionOptions: {
      all: true,
      none: false,
      // custom: false,
      selectionIds: [],
    },
    commentOptions: {
      all: true,
      none: false,
      commentIds: [],
    },
    responseOptions: {
      all: true,
      none: false,
      responseIds: [],
    },
  },

  studentSelectOptions: computed('submissionThreads', function () {
    const options = [];
    const threads = this.submissionThreads;

    if (!threads) {
      return [];
    }
    threads.forEach((val, key) => {
      //key is student name,
      options.pushObject({
        label: key,
        value: key,
      });
    });

    return options;
  }),

  submissionsFromStudents: computed(
    'customSubmissionIds.[]',
    'doDeselectAll',
    'doSelectAll',
    'submissionOptions.{all,byStudent,custom}',
    'submissionStudents.[]',
    'submissionThreads',
    'workspace.{id,submissions}',
    function () {
      if (this.submissionOptions.all) {
        return this.workspace.submissions;
      }
      if (this.submissionOptions.custom) {
        const customIds = this.customSubmissionIds;
        if (!this.utils.isNonEmptyArray(customIds)) {
          return [];
        }
        return this.workspace.submissions.filter((sub) => {
          return customIds.includes(sub.get('id'));
        });
      }
      const threads = this.submissionThreads;
      const students = this.submissionStudents;
      if (!threads || !this.utils.isNonEmptyArray(students)) {
        return [];
      }
      return _.chain(students)
        .map((student) => threads.get(student))
        .flatten()
        .value();
    }
  ),

  submissionCount: computed(
    'customSubmissionIds.[]',
    'submissionsFromStudents.[]',
    'workspace.submissions',
    function () {
      return this.workspace.submissions.map((sub) => {
        return sub.id;
      });
    }
  ),

  foldersCount: computed(
    'customSubmissionIds.[]',
    'submissionsFromStudents.[]',
    'workspace.folders',
    function () {
      return this.workspace.folders.map((folder) => {
        return folder.id;
      });
    }
  ),

  selectionsFromSubmissions: computed(
    'customSubmissionIds.[]',
    'submissionIdsFromStudents',
    'submissionsFromStudents.[]',
    'workspace.selections',
    function () {
      return this.workspace.selections.filter((selection) => {
        return this.submissionIdsFromStudents.includes(
          selection.get('submission.content.id')
        );
      });
    }
  ),

  commentsFromSelections: computed(
    'selectionOptions.none',
    'selectionsFromSubmissions.[]',
    'workspace.comments',
    function () {
      if (this.selectionOptions.none === true) {
        return [];
      }

      return this.workspace.comments.filter((comment) => {
        return this.selectionsFromSubmissions.includes(
          comment.get('selection.content')
        );
      });
    }
  ),

  responsesFromSubmissions: computed(
    'submissionsFromStudents.[]',
    'workspace.responses',
    function () {
      return this.workspace.responses.filter((response) => {
        return this.submissionsFromStudents.includes(
          response.get('submission.content')
        );
      });
    }
  ),

  submissionIdsFromStudents: computed(
    'submissionsFromStudents.[]',
    function () {
      const subs = this.submissionsFromStudents;

      return subs.mapBy('id');
    }
  ),

  actions: {
    updateMultiSelect(val, $item, propToUpdate) {
      if (!val) {
        return;
      }
      // removal
      if (_.isNull($item)) {
        this.get(propToUpdate).removeObject(val);
        return;
      }
      this.get(propToUpdate).pushObject(val);
    },

    setSubmissions() {
      if (this.showStudentSubmissionInput) {
        const submissionIds = this.submissionIdsFromStudents;
        if (this.utils.isNonEmptyArray(submissionIds)) {
          this.set('submissionIds', [...submissionIds]);
          this.set('showSelectionInputs', true);
          return;
        }
        this.set('noSubmissionsToCopy', true);
        return;
      }
      this.set('showSelectionInputs', true);
    },

    updateCollectionOptions(val, propName) {
      let keys = ['all', 'none', 'custom'];

      if (propName === 'submissionOptions') {
        keys = ['all', 'byStudent', 'custom'];
      }
      if (propName === 'folderOptions') {
        keys = ['all', 'includeStructureOnly', 'none'];
      }

      if (!_.contains(keys, val)) {
        return;
      }
      const propToToggle = `${propName}.${val}`;
      if (!this.get(propToToggle)) {
        this.set(propToToggle, true);
      }

      const without = _.without(keys, val);

      without.forEach((key) => {
        let prop = `${propName}.${key}`;
        if (this.get(prop)) {
          this.set(prop, false);
        }
      });
    },

    toggleIncludeStructureOnly() {
      this.toggleProperty('folderOptions.includeStructureOnly');
    },
    next() {
      this.onProceed(this.formattedConfig);
    },
    back() {
      this.onBack(-1);
    },
    updateCustomSubs(id) {
      if (!this.utils.isNonEmptyArray(this.customSubmissionIds)) {
        this.set('customSubmissionIds', []);
      }

      const customSubmissionIds = this.customSubmissionIds;

      const isIn = customSubmissionIds.includes(id);
      if (isIn) {
        // remove
        customSubmissionIds.removeObject(id);
      } else {
        //add
        customSubmissionIds.addObject(id);
      }
    },
    selectAllSubmissions: function () {
      this.set('customSubmissionIds', this.workspace.submissions.mapBy('id'));
    },
    deselectAllSubmissions: function () {
      this.set('customSubmissionIds', []);
    },
    setDoneSelecting: function () {
      this.set('showCustomSubmissionViewer', false);
      this.set('closedCustomView', true);
    },
    showCustomSelect: function () {
      this.set('showCustomSubmissionViewer', true);
      this.set('closedCustomView', false);
    },
  },
});
