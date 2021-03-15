/**
 * Passed in by template:
 * - comments
 * - currentWorkspace
 * - currentUser
 * - currentSubmission
 * - currentSelection
 * - store
 *
 *   TODO:
 *   - Test the hashtag stuff to see if that is still working.
 */
/*global _:false */
import Ember from 'ember';
import $ from 'jquery';
import moment from 'moment';
import CurrentUserMixin from '../mixins/current_user_mixin';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';






export default Ember.Component.extend(CurrentUserMixin, ErrorHandlingMixin, {
  elementId: 'comment-list',
  alert: Ember.inject.service('sweet-alert'),
  utils: Ember.inject.service('utility-methods'),
  loading: Ember.inject.service('loading-display'),

  classNames: ['workspace-flex-item', 'comments'],
  classNameBindings: ['canComment:can-comment', 'isHidden:hidden', 'onSelection:on-selection', 'isBipaneled:bi-paneled', 'isTripaneled:tri-paneled'],

  permissions: Ember.inject.service('workspace-permissions'),
  thisSubmissionOnly: true,
  thisWorkspaceOnly: true,
  commentFilterText: '',
  filterComments: false,
  newComment: '',
  newCommentLabel: 'notice',
  newCommentParent: null,
  queryErrors: [],
  createRecordErrors: [],
  uploadRecordErrors: [],
  showFilter: true,
  scrollBottom: true,

  labels: {
    notice: {
      placeholder: 'I notice...'
    },
    wonder: {
      placeholder: 'I wonder...'
    },
    feedback: {
      placeholder: ['Interesting...', 'Did you try...', 'What about...', 'I am interested in...',
        'I would like...', 'Seems promising...', 'What if...', 'How do you know...', 'Can you say more...'],
      useForResponse: true
    }
  },
  labelOptions: ['notice', 'wonder', 'feedback'],

  isBipaneled: Ember.computed.equal('containerLayoutClass', 'hsc'),
  isTripaneled: Ember.computed.equal('containerLayoutClass', 'fsc'),

  searchConstraints: {
    query: {
      length: {
        minimum: 0,
        maximum: 500
      }
    }
  },


  showComposeButtons: Ember.computed.and('canComment', 'onSelection'),

  myCommentsOnly: function () {
    return !this.get('isParentWorkspace');
  }.property('isParentWorkspace'),


  init: function () {
    this._super(...arguments);
    let oneYearAgo = moment().subtract(365, 'days').calendar();
    let oneYearAgoDate = new Date(oneYearAgo);
    let htmlDate = moment(oneYearAgoDate).format('L');

    this.set('sinceDate', htmlDate);
  },

  didInsertElement() {
    $(window).on('resize.commentScroll', function () {
      this.$('.scroll-icon:visible').hide();
    });

    this._super(...arguments);
  },

  willDestroyElement() {
    $(window).off('resize.commentScroll');
    this._super(...arguments);
  },

  newCommentPlaceholder: function () {
    let newCommentLabel = this.get('newCommentLabel');
    let path = `labels.${newCommentLabel}.placeholder`;
    let placeholder = this.get(path);

    if (_.isArray(placeholder)) {
      placeholder = placeholder[_.random(0, placeholder.length - 1)];
    }
    return placeholder;
  }.property('newCommentLabel', 'labels'),

  filteredComments: function () {
    let results;

    let isOwnOnly = this.get('myCommentsOnly');
    let isSubOnly = this.get('thisSubmissionOnly');
    let isWsOnly = this.get('thisWorkspaceOnly');



    let isSearchQuery = this.get('commentFilterText.length') > 0;

    let doFilter = isSubOnly || isWsOnly;
    if (doFilter) {
      results = this.get('comments').filter((comment) => {
        let creatorId = this.get('utils').getBelongsToId(comment, 'createdBy');

        let isYours = creatorId === this.get('currentUser.id');

        let subId = this.get('utils').getBelongsToId(comment, 'submission');

        let doesBelongToSub = subId === this.get('currentSubmission.id');

        let workspaceId = this.get('utils').getBelongsToId(comment, 'workspace');

        let doesBelongToWs = workspaceId === this.get('currentWorkspace.id');

        if (isWsOnly) {
          if (!doesBelongToWs) {
            return false;
          }
        }

        if (isOwnOnly) {
          if (!isYours) {
            return false;
          }
        }
        if (isSubOnly) {
          if (!doesBelongToSub) {
            return false;
          }
        }

        if (isSearchQuery) {
          let text = this.get('commentFilterText');
          return comment.get('label').includes(text) || comment.get('text').includes(text);
        }
        return true;
      });
    } else {
      // check store to see if comments related to current selection are available
      let currentSelectionComments = this.get('store')
        .peekAll('comment')
        .filter((comment) => {
          let selId = this.get('utils').getBelongsToId(comment, 'selection');

          return selId === this.get('currentSelection.id');
        });

      let searchResults = this.get('searchResults') || [];

      return searchResults.concat(currentSelectionComments);
    }
    return results.sortBy('createDate').reverse();
  }.property('comments.[]', 'thisSubmissionOnly', 'myCommentsOnly', 'commentFilterText', 'currentSubmission.id', 'thisWorkspaceOnly', 'currentWorkspace.id', 'searchResults.[]', 'currentSelection'),

  displayList: function () {
    return this.get('filteredComments').rejectBy('isTrashed');
  }.property('filteredComments.@each.isTrashed'),

  clearCommentParent: function () {
    if (this.get('newCommentParent')) {
      this.set('newCommentParent.inReuse', false);
      this.set('newCommentParent', null);
    }
  },

  textContainsTag: function () {
    return !!this.get('tags.length');
  }.property('tags'),

  tags: function () {
    var text = this.get('newComment');
    var tags = [];
    text.split(/\s+/).forEach(function (word) {
      if (word.match(/^#\S+/)) {
        tags.push(word.substring(1).toLowerCase());
      }
    });
    return tags;
  }.property('newComment'),

  onSelection: function () {
    return this.get('utils').isNonEmptyObject(this.get('currentSelection'));
  }.property('currentSelection'),

  canComment: function () {
    let ws = this.currentWorkspace;
    return this.get('permissions').canEdit(ws, 'comments', 2);
  }.property('onSelection', 'allowedToComment'),

  toggleDisplayText: function () {
    if (this.get('isHidden')) {
      return 'Show Comments';
    }
    return 'Hide Comments';
  }.property('isHidden'),

  filterOptions: function () {
    return {
      thisWorkspaceOnly: {
        label: 'This Workspace Only',
        relatedProp: 'thisWorkspaceOnly',
        isChecked: true,
        isDisabled: this.get('isParentWorkspace'),
      },
      thisSubmissionOnly: {
        label: 'This Submission Only',
        relatedProp: 'thisSubmissionOnly',
        isChecked: true,
        isDisabled: false,
      },
      myCommentsOnly: {
        label: 'My Comments Only',
        relatedProp: 'myCommentsOnly',
        isChecked: !this.get('isParentWorkspace'),
        isDisabled: false,
      },

    };
  }.property('isParentWorkspace'),

  emptyResultsMessage: function () {
    if (this.get('commentFilterText')) {
      return `No results found for "${this.get('commentFilterText')}" `;
    }
    return 'No comments to display';
  }.property('commentFilterText'),

  resultsDescription: function () {
    let query = this.get('commentFilterText');

    let displayCount = this.get('displayList.length');

    let resultsModifier = displayCount > 1 ? 'comments' : 'comment';

    let isWsOnly = this.get('thisWorkspaceOnly');
    let isSubOnly = this.get('thisSubmissionOnly');

    if (!isWsOnly && !isSubOnly && this.get('commentsMetadata')) {

      let { total, } = this.get('commentsMetadata');

      let base = `Found ${total} ${resultsModifier}`;

      if (this.get('myCommentsOnly')) {
        base += ' created by you';
      }

      if (query) {
        base += ` for "${query}"`;
      }
      return base;
    }

    let base = 'Displaying';

    if (this.get('myCommentsOnly')) {
      base += ' only your';
    }

    if (this.get('thisSubmissionOnly')) {
      return base + ` comments for current submission`;
    }

    if (this.get('thisWorkspaceOnly')) {
      return base + ` comments for current workspace`;
    }

  }.property('commentFilterText', 'thisWorkspaceOnly', 'thisSubmissionOnly', 'myCommentsOnly', 'commentsMetadata'),

  showResultsDescription: function () {
    return !this.get('doShowLoadingMessage') && this.get('displayList.length') > 0;
  }.property('displayList.[]', 'doShowLoadingMessage'),

  isSinceDateValid: function () {
    let input = this.get('sinceDate');
    if (typeof input !== 'string' || !input.length > 0) {
      return false;
    }
    let split = input.split('/');

    if (split.length !== 3) {
      return false;
    }
    let month = split[0];
    let monthInt = parseInt(month, 10);
    if (_.isNaN(monthInt) || monthInt > 12 || monthInt < 1) {
      return false;
    }
    let day = split[1];
    let dayInt = parseInt(day, 10);

    if (_.isNaN(dayInt) || dayInt < 1 || dayInt > 31) {
      return false;
    }

    let year = split[2];
    let yearInt = parseInt(year, 10);

    if (_.isNaN(yearInt) || yearInt < 1000 || yearInt > 9999) {
      return false;
    }
    return true;
  }.property('sinceDate'),

  showApplyDate: function () {
    return this.get('doUseSinceDate') && this.get('isSinceDateValid');
  }.property('isSinceDateValid', 'doUseSinceDate'),

  sortedDisplayList: function () {
    return this.get('displayList').sort((a, b) => {
      let currentSelectionId = this.get('currentSelection.id');

      let aSelectionId = this.get('utils').getBelongsToId(a, 'selection');
      let bSelectionId = this.get('utils').getBelongsToId(b, 'selection');

      let isAForCurrentSelection = aSelectionId === currentSelectionId;
      let isBForCurrentSelection = bSelectionId === currentSelectionId;

      if (isAForCurrentSelection && !isBForCurrentSelection) {
        return -1;
      }
      if (isBForCurrentSelection && !isAForCurrentSelection) {
        return 1;
      }
      return 0;
    });
  }.property('displayList.[]', 'currentSelection'),

  showPaginationControl: function () {
    return !this.get('thisWorkspaceOnly') && !this.get('thisSubmissionOnly');
  }.property('thisWorkspaceOnly', 'thisSubmissionOnly'),

  actions: {
    cancelComment: function () {
      this.clearCommentParent();
      this.set('newComment', '');
      this.sendAction('resetComment');
    },

    madeSelection: function () {
      if (this.get('onSelection')) {
        this.send('createComment');
      } else {
        this.get('alert').showToast('error', 'Please choose a selection first', 'bottom-end', 3000, false, null);
      }
    },

    createComment: function () {
      let currentUser = this.get('currentUser');
      let label = this.get('newCommentLabel');
      let text = this.get('newComment');
      let useForResponse = this.labels[label].useForResponse;
      if (!text || !text.trim()) { return; }

      let selection = this.get('currentSelection');
      let currentSubmission = this.get('currentSubmission');

      let data = {
        text: text,
        label: label,
        selection: selection,
        submission: currentSubmission,
        workspace: this.get('currentWorkspace'),
        parent: this.get('newCommentParent'),
        useForResponse: !!useForResponse,
        createdBy: currentUser,
      };
      let comment = this.get('store').createRecord('comment', data);

      //TODO push comment onto origin's derivatives

      if (this.get('textContainsTag')) {
        this.send('tagSelection', selection, this.get('tags'));
      }

      var newCommentParent = this.get('newCommentParent');
      var comp = this;
      this.set('alerts', this.get('alert'));

      comment.save().then((record) => {
        this.get('alerts').showToast('success', 'Comment Created', 'bottom-end', 2000, false, null);
        //controller.get('currentSelection.comments').addObject(record);
        selection.get('comments').then(function (comments) {
          comments.addObject(record);
        });
        currentSubmission.get('comments').then(function (comments) {
          comments.addObject(record);
        });
        if (newCommentParent) {
          newCommentParent.get('children').then(function (comments) {
            comments.addObject(record);
          });
        }
        comp.set('newComment', ''); //clear out the comment
        comp.clearCommentParent();
        comp.get('comments').pushObject(record);
      }).catch((err) => {
        this.handleErrors(err, 'createRecordErrors');
      });
    },

    deleteComment: function (comment) {
      return this.get('alert').showModal('warning', 'Are you sure you want to delete this comment?', null, 'Yes, delete it')
        .then((result) => {
          if (result.value) {
            comment.get('submission').then((submission) => {
              comment.set('isTrashed', true);
              comment.save()
                .then(() => {
                  this.get('alert').showToast('success', 'Comment Deleted', 'bottom-end', 3000, true, 'Undo').then((result) => {
                    if (result.value) {
                      comment.set('isTrashed', false);
                      comment.save().then(() => {
                        this.get('alert').showToast('success', 'Comment Restored', 'bottom-end', 2000, false, null);
                      });
                    }
                  });
                  // this.set('commentDeleteSuccess', true);
                }).catch((err) => {
                  this.handleErrors(err, 'updateRecordErrors');
                });
            });
          }
        });
    },

    reuseComment: function (comment) {

      //copy the comment text to the input
      this.set('newComment', this.get('newComment') + ' ' + comment.get('text'));
      //set the comment label to match, right?
      this.set('newCommentLabel', comment.get('label'));
      //record that the comment is being reused
      this.clearCommentParent();
      this.set('newCommentParent', comment);
      comment.set('inReuse', true);

      $('#commentTextarea').focus();
    },

    setCommentLabel: function (label) {
      this.set('newCommentLabel', label);
    },

    toggleFilter: function () {
      this.toggleProperty('showFilter');
      if (this.get('showFilter') && this.get('isSearching')) {
        this.set('isSearching', false);
      }
    },

    toggleSearch: function () {
      this.toggleProperty('isSearching');

      if (this.get('isSearching') && this.get('showFilter')) {
        this.set('showFilter', false);
      }
    },
    hideComments() {
      this.get('hideComments')();
    },
    updateFilter(prop) {
      this.toggleProperty(prop);
      this.send('searchComments');
    },
    searchComments(query, page) {
      // no need to fetch
      if (this.get('thisSubmissionOnly') || this.get('thisWorkspaceOnly')) {
        return;
      }
      // clear current selection
      this.send('cancelComment');

      this.get('loading').handleLoadingMessage(this, 'start', 'isLoadingSearchResults', 'doShowLoadingMessage');

      let options = {
        text: query || '',
      };

      if (this.get('myCommentsOnly')) {
        options.createdBy = this.get('currentUser.id');
      }

      options.page = page || 1;

      if (this.get('doUseSinceDate')) {
        let dateInput = this.get('sinceDate');
        let parsedDate = Date.parse(dateInput);

        if (_.isNaN(parsedDate)) {
          return this.set('invalidDateError', 'Please enter a valid date');
        }
        options.sinceDate = dateInput;
      }
      return this.get('store').query('comment', options)
        .then((comments) => {
          this.set('searchResults', comments.toArray());
          this.set('commentsMetadata', comments.get('meta'));
          this.get('loading').handleLoadingMessage(this, 'end', 'isLoadingSearchResults', 'doShowLoadingMessage');
        }).catch((err) => {
          this.get('loading').handleLoadingMessage(this, 'end', 'isLoadingSearchResults', 'doShowLoadingMessage');
          this.handleErrors(err, 'queryErrors');
        });
    },
    initiatePageChange(page) {
      this.set('isChangingPage', true);
      this.send('searchComments', this.get('commentFilterText'), page);
    },
    applySinceDate() {
      this.send('searchComments', this.get('commentFilterText'));
    },
    superScroll: function (direction) {
      //should only show scroll option after the user scrolls a little
      let maxScroll = this.$('.display-list')[0].scrollHeight;

      if (!this.get('scrollBottom')) {
        $('.display-list').animate({
          scrollTop: 0
        });
      } else {
        $('.display-list').animate({
          scrollTop: maxScroll
        });
      }
      this.set('scrollBottom', !this.get('scrollBottom'));
    },
    clearSearchResults() {
      this.send('searchComments');
    }
  }
});

