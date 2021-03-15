/* eslint-disable complexity */
import Ember from 'ember';
import $ from 'jquery';
import moment from 'moment';
import CurrentUserMixin from '../mixins/current_user_mixin';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';






export default Ember.Component.extend(
  CurrentUserMixin,
  ErrorHandlingMixin,
  {
    elementId: 'assignment-info-teacher',
    classNameBindings: ['isEditing:is-editing'],
    formattedDueDate: null,
    formattedAssignedDate: null,
    isEditing: false,
    isDisplaying: Ember.computed.not('isEditing'),
    // showReport: false,
    isPreparingReport: false,
    htmlDateFormat: 'MM/DD/YYYY',
    displayDateFormat: 'MMM Do YYYY',
    assignmentToDelete: null,
    dataFetchErrors: [],
    findRecordErrors: [],
    updateRecordErrors: [],
    areLinkedWsExpanded: true,
    showParentWsForm: false,
    showLinkedWsForm: false,
    areLinkedWsHidden: Ember.computed.not('areLinkedWsExpanded'),
    areSubmissionsExpanded: true,
    areSubmissionsHidden: Ember.computed.not('areSubmissionsExpanded'),
    showProblemInput: Ember.computed.and('isEditing', 'canEditProblem'),
    showSectionInput: Ember.computed.and('isEditing', 'canEditProblem'),
    showAssignedDateInput: Ember.computed.and(
      'isEditing',
      'canEditAssignedDate'
    ),
    showDueDateInput: Ember.computed.and('isEditing', 'canEditDueDate'),
    hideParentWsForm: Ember.computed.not('showParentWsForm'),
    hideLinkedWsForm: Ember.computed.not('showLinkedWsForm'),
    allStudentsHaveWs: Ember.computed.equal(
      'studentsWithoutWorkspaces.length',
      0
    ),

    alert: Ember.inject.service('sweet-alert'),
    permissions: Ember.inject.service('assignment-permissions'),
    utils: Ember.inject.service('utility-methods'),

    hasLinkedWorkspaces: Ember.computed.gt(
      'assignment.linkedWorkspaces.length',
      0
    ),
    doesNotHaveLinkedWs: Ember.computed.not('hasLinkedWorkspaces'),

    showFullLinkedWsMsg: Ember.computed.and('isEditing', 'allStudentsHaveWs'),
    showNoParentWsMsg: Ember.computed.and('isEditing', 'doesNotHaveLinkedWs'),

    init: function () {
      this._super(...arguments);
      // get all sections and problems
      // only need to get these on init because user won't be creating new sections or problems from this component

      this.set('cachedProblems', this.get('store').peekAll('problem'));

      return this.store
        .findAll('section')
        .then(sections => {
          if (this.get('isDestroying') || this.get('isDestroyed')) {
            return;
          }
          this.set('sections', sections);
        })
        .catch(err => {
          if (this.get('isDestroying') || this.get('isDestroyed')) {
            return;
          }
          this.handleErrors(err, 'dataFetchErrors');
        });
    },

    didReceiveAttrs: function () {
      const assignment = this.get('assignment');
      if (this.get('currentAssignment.id') !== this.get('assignment.id')) {
        this.set('currentAssignment', assignment);

        this.set('isEditing', false);

        let dateFormat = this.get('htmlDateFormat');
        let dueDate = this.assignment.get('dueDate');
        let assignedDate = this.assignment.get('assignedDate');
        this.set('selectedProblem', this.get('problem'));
        this.set('selectedSection', this.get('section'));

        this.set('assignmentName', assignment.get('name'));

        if (dueDate) {
          this.set('formattedDueDate', moment(dueDate).format(dateFormat));
        }

        if (assignedDate) {
          this.set(
            'formattedAssignedDate',
            moment(assignedDate).format(dateFormat)
          );
        }
      }
    },

    isYourOwn: function () {
      let creatorId = this.get('utils').getBelongsToId(
        this.get('assignment'),
        'createdBy'
      );
      return this.get('currentUser.id') === creatorId;
    }.property('assignment.id', 'currentUser.id'),

    isDirty: function () {
      let answerIds = this.get('utils').getHasManyIds(
        this.get('assignment'),
        'answers'
      );
      return this.get('utils').isNonEmptyArray(answerIds);
    }.property('assignment.answers.[]'),

    isClean: Ember.computed.not('isDirty'),

    canDelete: function () {
      return this.get('permissions').canDelete(this.get('assignment'));
    }.property('currentUser.actingRole', 'assignment.answers[]'),

    canEdit: function () {
      const isAdmin = this.get('currentUser.isAdmin');
      const isClean = this.get('isClean');
      const isYourOwn = this.get('isYourOwn');

      return isAdmin || (isClean && isYourOwn);
    }.property('isClean', 'isYourOwn'),
    isReadOnly: Ember.computed.not('canEdit'),

    canEditDueDate: function () {
      return this.get('hasBasicEditPrivileges');
    }.property('hasBasicEditPrivileges'),

    canEditAssignedDate: function () {
      return this.get('permissions').canEditAssignedDate(
        this.get('assignment')
      );
    }.property('assignment.assignedDate'),

    canEditProblem: function () {
      return this.get('permissions').canEditProblem(
        this.get('assignment'),
        this.get('section')
      );
    }.property(
      'sortedAnswers.[]',
      'hasBasicEditPrivileges',
      'currentUser.actingRole'
    ),

    hasBasicEditPrivileges: function () {
      return (
        this.get('permissions').getPermissionsLevel(
          this.get('assignment'),
          this.get('section')
        ) > 0
      );
    }.property('section.teachers.[]', 'currentUser.actingRole', 'assignment'),

    isBeforeAssignedDate: function () {
      // true if assignedDate is in future
      const currentDate = new Date();
      const assignedDate = this.assignment.get('assignedDate');
      return currentDate < assignedDate;
    }.property('assignment.id', 'assignment.assignedDate'),

    canEditDate: function () {
      const isAdmin = this.get('currentUser.isAdmin');
      const canEdit = this.get('canEdit');
      const isBeforeAssignedDate = this.get('isBeforeAssignedDate');
      return isAdmin || (canEdit && isBeforeAssignedDate);
    }.property('isBeforeAssignedDate', 'canEdit'),

    isDateLocked: Ember.computed.not('canEditDate'),

    getMongoDate: function (htmlDateString) {
      const htmlFormat = 'YYYY-MM-DD';
      if (typeof htmlDateString !== 'string') {
        return;
      }
      let dateMoment = moment(htmlDateString, htmlFormat);
      return new Date(dateMoment);
    },

    getEndDate: function (htmlDateString) {
      const htmlFormat = 'YYYY-MM-DD HH:mm';
      if (typeof htmlDateString !== 'string') {
        return;
      }
      let dateMoment = moment(htmlDateString, htmlFormat);
      let date = new Date(dateMoment);
      date.setHours(23, 59, 59);
      return date;
    },

    showEditButton: function () {
      return (
        !this.get('isEditing') &&
        this.get('hasBasicEditPrivileges') &&
        !this.get('showParentWsForm')
      );
    }.property('hasBasicEditPrivileges', 'isEditing', 'showParentWsForm'),

    problemOptions: function () {
      let cachedProblems = this.get('cachedProblems');
      let toArray = cachedProblems.toArray();
      return toArray.map(cachedProblem => {
        return {
          id: cachedProblem.id,
          title: cachedProblem.get('title')
        };
      });
    }.property('cachedProblems.[]'),
    sectionOptions: function () {
      let sections = this.get('sections') || [];
      let toArray = sections.toArray();
      return toArray.map(section => {
        return {
          id: section.id,
          name: section.get('name')
        };
      });
    }.property('sections.[]'),

    initialProblemItem: function () {
      if (this.get('selectedProblem.id')) {
        return [this.get('selectedProblem.id')];
      }
      return [];
    }.property('selectedProblem'),

    initialSectionItem: function () {
      if (this.get('selectedSection.id')) {
        return [this.get('selectedSection.id')];
      }
      return [];
    }.property('selectedSection'),

    showAddParentWsBtn: function () {
      return (
        this.get('isEditing') &&
        this.get('hasBasicEditPrivileges') &&
        this.get('hideParentWsForm') &&
        this.get('hasLinkedWorkspaces') &&
        !this.get('hasParentWorkspace')
      );
    }.property(
      'hasBasicEditPrivileges',
      'isEditing',
      'hideParentWsForm',
      'hasParentWorkspace',
      'hasLinkedWorkspaces'
    ),
    showAddLinkedWsBtn: function () {
      return (
        this.get('isEditing') &&
        this.get('hasBasicEditPrivileges') &&
        this.get('hideLinkedWsForm') &&
        !this.get('allStudentsHaveWs')
      );
    }.property(
      'isEditing',
      'hasBasicEditPrivileges',
      'hideLinkedWsForm',
      'allStudentsHaveWs'
    ),

    showReport: function () {
      return !this.get('showParentWsForm');
    }.property('showParentWsForm'),

    hasParentWorkspace: function () {
      let workspaceId = this.get('utils').getBelongsToId(
        this.get('assignment'),
        'parentWorkspace'
      );
      return this.get('utils').isValidMongoId(workspaceId);
    }.property('assignment.parentWorkspace'),

    displayListsOptions: function () {
      let areLinkedWsExpanded = this.get('areLinkedWsExpanded');
      let areSubmissionsExpanded = this.get('areSubmissionsExpanded');

      let toHide = 'fas fa-chevron-down';
      let toShow = 'fas fa-chevron-left';
      return {
        linkedWs: {
          icon: areLinkedWsExpanded ? toHide : toShow
        },
        submissions: {
          icon: areSubmissionsExpanded ? toHide : toShow
        }
      };
    }.property('areLinkedWsExpanded'),

    studentsWithoutWorkspaces: function () {
      let students = this.get('studentList') || [];
      let existingWorkspaces = this.get('linkedWorkspaces') || [];

      return students.reject(student => {
        return existingWorkspaces.find(ws => {
          let ownerId = this.get('utils').getBelongsToId(ws, 'owner');
          return ownerId === student.get('id');
        });
      });
    }.property('studentList.[]', 'linkedWorkspaces.[]'),

    actions: {
      editAssignment: function () {
        let assignedDate = this.get('assignment.assignedDate');
        let dueDate = this.get('assignment.dueDate');
        let format = this.get('htmlDateFormat');

        let that = this;

        let autoUpdateAssigned = assignedDate !== null && assignedDate !== undefined;
        let autoUpdateDue = dueDate !== null && dueDate !== undefined;

        $(function () {
          $('input#assignedDate').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: autoUpdateAssigned,
          }, function (start, end, label) {
            let assignedDate = start.format(format);
            $('input#assignedDate').val(assignedDate);
          });
          $('input#dueDate').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: autoUpdateDue,
          }, function (start, end, label) {
            let dueDate = start.format(format);
            $('input#dueDate').val(dueDate);
          });

          let assignedInputVal = assignedDate ? moment(assignedDate).format(format) : '';
          let dueInputVal = dueDate ? moment(dueDate).format(format) : '';

          that.set('assignedDateEditVal', assignedInputVal);
          that.set('dueDateEditVal', dueInputVal);

          $('input#assignedDate').val(assignedInputVal);
          $('input#dueDate').val(dueInputVal);

          $('input[name="daterange"]').attr('placeholder', 'mm/dd/yyyy');
        });

        this.set('isEditing', true);
      },

      showDeleteModal: function () {
        this.get('alert')
          .showModal(
            'warning',
            'Are you sure you want to delete this assignment?',
            null,
            'Yes, delete it'
          )
          .then(result => {
            if (result.value) {
              this.send('deleteAssignment');
            }
          });
      },

      deleteAssignment: function () {
        const assignment = this.get('assignment');
        assignment.set('isTrashed', true);
        return assignment
          .save()
          .then(assignment => {
            this.set('assignmentToDelete', null);
            this.get('alert')
              .showToast(
                'success',
                'Assignment Deleted',
                'bottom-end',
                5000,
                true,
                'Undo'
              )
              .then(result => {
                if (result.value) {
                  assignment.set('isTrashed', false);
                  assignment.save().then(() => {
                    this.get('alert').showToast(
                      'success',
                      'Assignment Restored',
                      'bottom-end',
                      5000,
                      false,
                      null
                    );
                    window.history.back();
                  });
                }
              });
            this.sendAction('toAssignments');
            $('.daterangepicker').remove();
          })
          .catch(err => {
            this.set('assignmentToDelete', null);
            this.handleErrors(err, 'updateRecordErrors', assignment);
          });
      },

      updateAssignment: function () {
        let isAddingLinkedWs = this.get('showLinkedWsForm');
        let isAddingParentWs = this.get('showParentWsForm');

        if (isAddingLinkedWs || isAddingParentWs) {
          let msg = `Please finish or cancel adding of ${isAddingLinkedWs ? 'Linked Workspaces' : 'Parent Workspace'
            }`;
          return this.get('alert').showToast(
            'error',
            msg,
            'bottom-end',
            3000,
            false,
            null
          );
        }

        const assignment = this.get('assignment');

        let selectedProblem = this.get('selectedProblem');
        let selectedSection = this.get('selectedSection');

        if (!selectedProblem || !selectedSection) {
          return this.get('alert').showToast(
            'error',
            'Class and Problem are required',
            'bottom-end',
            3000,
            false,
            null
          );
        }

        let currentProblem = this.get('problem');
        let currentSection = this.get('section');

        let didProblemChange = !Ember.isEqual(selectedProblem, currentProblem);
        let didSectionChange = !Ember.isEqual(selectedSection, currentSection);

        let didRelationshipsChange = didProblemChange || didSectionChange;

        const name = this.get('assignmentName');
        assignment.set('name', name);

        if (didProblemChange) {
          assignment.set('problem', selectedProblem);
        }
        if (didSectionChange) {
          assignment.set('section', selectedSection);
        }

        let dueDate;
        let assignedDate;
        let endDate;
        let startDate;

        let htmlDateFormat = this.get('htmlDateFormat');

        let currentAssignedDate = this.get('assignment.assignedDate');
        let currentDueDate = this.get('assignment.dueDate');

        let currentAssignedFmt = currentAssignedDate ?
          moment(currentAssignedDate).format(htmlDateFormat) :
          undefined;
        let currentDueFmt = currentDueDate ?
          moment(currentDueDate).format(htmlDateFormat) :
          undefined;

        let assignedDateEditVal = this.get('assignedDateEditVal');
        let dueDateEditVal = this.get('dueDateEditVal');

        if (this.get('canEditAssignedDate')) {
          if (assignedDateEditVal) {
            startDate = $('#assignedDate')
              .data('daterangepicker')
              .startDate.format('YYYY-MM-DD');

            assignedDate = this.getMongoDate(startDate);
          }

        } else {
          assignedDate = this.get('assignment.assignedDate');
        }

        if (this.get('canEditDueDate')) {
          if (dueDateEditVal) {

            endDate = $('#dueDate')
              .data('daterangepicker')
              .startDate.format('YYYY-MM-DD');

            dueDate = this.getEndDate(endDate);

          } else {
            dueDate = this.get('assignment.dueDate');
          }
        }

        if (assignedDate && dueDate && assignedDate > dueDate) {
          this.set('invalidDateRange', true);
          return;
        } else {
          if (this.get('invalidDateRange')) {
            this.set('invalidDateRange', null);
          }
        }

        let areDueDatesSame =
          (!currentDueDate && !dueDateEditVal) ||
          currentDueFmt === dueDateEditVal;
        let areAssignedDatesSame =
          (!currentAssignedDate && !assignedDateEditVal) ||
          currentAssignedFmt === assignedDateEditVal;

        if (!areDueDatesSame) {
          assignment.set('dueDate', dueDate);
        }

        if (
          !areAssignedDatesSame) {
          assignment.set('assignedDate', assignedDate);
        }

        if (assignment.get('hasDirtyAttributes') || didRelationshipsChange) {

          // never creating workspaces from this function
          assignment.set('linkedWorkspacesRequest', { doCreate: false });
          assignment.set('parentWorkspaceRequest', { doCreate: false });

          return assignment
            .save()
            .then(() => {
              this.get('alert').showToast(
                'success',
                'Assignment Updated',
                'bottom-end',
                4000,
                false,
                null
              );
              this.set('assignmentUpdateSuccess', true);
              $('.daterangepicker').remove();
              this.set('isEditing', false);
              return;
            })
            .catch(err => {
              this.handleErrors(err, 'updateRecordErrors', assignment);
            });
        } else {
          this.get('alert').showToast(
            'info',
            'No changes to save',
            'bottom-end',
            3000,
            false,
            null
          );

          this.set('isEditing', false);
          $('.daterangepicker').remove();
        }
      },
      stopEditing: function () {
        let isAddingLinkedWs = this.get('showLinkedWsForm');
        let isAddingParentWs = this.get('showParentWsForm');

        if (isAddingLinkedWs || isAddingParentWs) {
          let title = `Are you sure you want to stop editing of this assignment?`;
          let info = `Your ${isAddingLinkedWs ? 'Linked Workspaces have' : 'Parent Workspace has'} not been created.`;
          return this.get('alert')
            .showModal(
              'question',
              title,
              info,
              'Yes, stop editing'
            )
            .then(result => {
              if (result.value) {
                if (isAddingLinkedWs) {
                  this.set('showLinkedWsForm', false);
                }
                if (isAddingParentWs) {
                  this.set('showParentWsForm');
                }
                this.set('isEditing', false);
                $('.daterangepicker').remove();
              }
            });
        } else {
          this.set('isEditing', false);
          $('.daterangepicker').remove();

        }

      },
      updateSelectizeSingle(val, $item, propToUpdate, model) {
        let errorProp = `${model}FormErrors`;
        this.set(errorProp, []);

        if ($item === null) {
          this.set(propToUpdate, null);
          return;
        }
        let record = this.get('store').peekRecord(model, val);
        if (!record) {
          return;
        }
        this.set(propToUpdate, record);
      },
      handleCreatedParentWs(assignment) {
        if (assignment) {
          this.get('alert').showToast(
            'success',
            'Parent Workspace Created',
            'bottom-end',
            3000,
            false,
            null
          );
        }
      },
      handleCreatedLinkedWs(assignment) {
        if (assignment) {
          this.get('alert').showToast(
            'success',
            'Linked Workspaces Created',
            'bottom-end',
            3000,
            false,
            null
          );
        }
      },
      toggleProperty(propName) {
        if (typeof propName !== 'string') {
          return;
        }
        this.toggleProperty(propName);
      }
    }
  }
);
