import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import DS from 'ember-data';
import moment from 'moment';
import Permission from '../mixins/permission_mixin';
import Auditable from '../models/_auditable_mixin';

export default DS.Model.extend(Auditable, Permission, {
  workspaceId: alias('id'),
  name: DS.attr('string'),
  folders: DS.hasMany('folder', { async: true }),
  submissions: DS.hasMany('submission', { async: true }),
  responses: DS.hasMany('response', { async: true }),
  selections: DS.hasMany('selection', { async: true }),
  comments: DS.hasMany('comment', { async: true }),
  organization: DS.belongsTo('organization'),
  taggings: DS.hasMany('tagging', { async: false }),
  lastViewed: DS.attr('date'),
  lastModifiedDate: DS.attr('date'),
  lastViewedDate: computed(function () {
    if (!this.lastViewed) {
      return this.lastModifiedDate;
    } else if (!this.lastModifiedDate) {
      return this.createDate;
    } else {
      return this.lastViewed;
    }
  }),
  lastModifiedDateComp: computed(function () {
    if (!this.lastModifiedDate) {
      return this.createDate;
    } else {
      return this.lastModifiedDate;
    }
  }),
  workspaceType: DS.attr('string'),
  childWorkspaces: DS.hasMany('workspace', { inverse: null }),
  parentWorkspaces: DS.hasMany('workspace', { inverse: null }),

  _collectionLength: function (collection) {
    // https://stackoverflow.com/questions/35405360/ember-data-show-length-of-a-hasmany-relationship-in-a-template-without-downloadi
    /*
    if( this.hasMany( collection ).value() === null ) {
      return 0;
    }
    */
    return this.hasMany(collection).ids().length;
  },
  foldersLength: computed('folders.[]', function () {
    return this._collectionLength('folders');
  }),
  commentsLength: computed('comments.[]', function () {
    return this._collectionLength('comments');
  }),
  responsesLength: computed('comments.[]', function () {
    return this._collectionLength('responses');
  }),
  selectionsLength: computed('selections.[]', function () {
    return this._collectionLength('selections');
  }),
  submissionsLength: computed('submissions.[]', function () {
    var length = this._collectionLength('submissions');
    return length;
    //return this._collectionLength('submissions');
  }),
  editorsLength: computed('editors.[]', function () {
    return this._collectionLength('editors');
  }),
  taggingsLength: computed('taggings.[]', function () {
    return this._collectionLength('taggings');
  }),

  firstSubmissionId: computed('submissions', function () {
    var firstId = this.get('data.submissions.firstObject.id');
    return firstId;
  }),

  firstSubmission: computed('submissions.[]', function () {
    //console.log("First Sub Id: " + this.hasMany( collection ).ids().objectAt(0) );
    return this.hasMany('submissions').ids()[0];
    /*
    var promise = new Ember.RSVP.Promise(function(resolve, reject) {
      console.log("Getting first submission!");
      controller.get('submissions').then(function(submissions){
        console.log("Length: " + submissions.get('length') );
        var sorted = submissions.sortBy('student', 'createDate');
        var firstStudent = sorted.get('firstObject.student');
        var lastRevision = sorted.getEach('student').lastIndexOf(firstStudent);

        return sorted.objectAt(lastRevision);
      });
    });

    return promise;
    */
  }),

  submissionDates: computed(function () {
    var loFmt,
      lo = this.get('data.submissionSet.description.firstSubmissionDate');
    var hiFmt,
      hi = this.get('data.submissionSet.description.lastSubmissionDate');
    if (lo > hi) {
      var tmp = lo;
      lo = hi;
      hi = tmp;
    }
    if (lo && hi) {
      loFmt = moment(lo).zone('us').format('l');
      hiFmt = moment(hi).zone('us').format('l');
      if (loFmt === hiFmt) {
        return loFmt;
      }
      return loFmt + ' - ' + hiFmt;
    }
  }),
  permissions: DS.attr(),

  collaborators: computed('permissions.[]', function () {
    const permissions = this.permissions;

    if (Array.isArray(permissions)) {
      return permissions.mapBy('user');
    }
    return [];
  }),

  feedbackAuthorizers: computed('permissions.@each.feedback', function () {
    const permissions = this.permissions;

    if (Array.isArray(permissions)) {
      return permissions.filterBy('feedback', 'approver').mapBy('user');
    }
    return [];
  }),
  sourceWorkspace: DS.attr(), // if workspace is copy
  linkedAssignment: DS.belongsTo('assignment'),
  doAllowSubmissionUpdates: DS.attr('boolean', { defaultValue: true }),
  doOnlyUpdateLastViewed: DS.attr('boolean', { defaultValue: false }),
  doAutoUpdateFromChildren: DS.attr('boolean', { defaultValue: false }),
});
