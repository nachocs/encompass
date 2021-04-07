import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import DS from 'ember-data';
import moment from 'moment';
import Auditable from '../models/_auditable_mixin';

export default DS.Model.extend(Auditable, {
  submissionId: alias('id'),
  shortAnswer: DS.attr('string'),
  longAnswer: DS.attr('string'),
  /*
   * the powId is the ID for this submission in the PoW environment
   */
  powId: DS.attr('number'),
  creator: DS.attr(),
  creatorId: DS.attr('number'),
  publication: DS.attr(),
  uploadedFile: DS.attr(),
  //teacher, class, puzzle TODO
  //teacher: DS.belongsTo(App.User, {embedded:'always'}),
  teacher: DS.attr(),
  section: DS.belongsTo('section'),
  problem: DS.belongsTo('problem'),
  answer: DS.belongsTo('answer'),
  selections: DS.hasMany('selection', { async: true }),
  comments: DS.hasMany('comment', { async: true }),
  workspaces: DS.hasMany('workspace', { async: true }),
  responses: DS.hasMany('response', { async: true }),
  vmtRoomInfo: DS.attr(''),

  folders: computed('selections.[].folders', function () {
    var folders = [];
    this.selections.forEach(function (selection) {
      folders.pushObjects(selection.get('folders'));
    });
    return folders.uniq();
  }),

  // selectedComments: function () {
  //   return this.get('comments').filterBy('useForResponse', true);
  // }.property('comments.[].useForResponse'),

  puzzle: computed(function () {
    return this.get('publication.puzzle');
  }),

  puzzleUrl: computed(function () {
    return '/library/go.html?destination=' + this.get('puzzle.puzzleId');
  }),

  /*
  attachment: function(){
    return this.get('data.uploadedFile');
  }.property(),
  */

  imageUrl: computed(function () {
    return (
      'http://mathforum.org/encpows/uploaded-images/' +
      this.get('uploadedFile.savedFileName')
    );
  }),

  student: computed(
    'creator.safeName',
    'creator.username',
    'creator.fullName',
    'vmtDisplayName',
    function () {
      let safeName = this.get('creator.safeName');
      let fullName = this.get('creator.fullName');
      let username = this.get('creator.username');

      if (this.get('vmtRoomInfo.roomId')) {
        return this.vmtDisplayName;
      }

      if (fullName) {
        return fullName;
      }
      if (safeName) {
        return safeName;
      }
      return username;
    }
  ),

  studentDisplayName: computed(
    'creator.safeName',
    'creator.username',
    'vmtDisplayName',
    function () {
      if (this.get('vmtRoomInfo.roomId')) {
        return this.vmtDisplayName;
      }

      let safeName = this.get('creator.safeName');
      let username = this.get('creator.username');

      let name = safeName ? safeName : username;

      return name;
    }
  ),

  label: computed('student', 'createDate', 'data.thread.threadId', function () {
    var label = this.student;
    var createDate = this.createDate;
    if (createDate) {
      label += ' on ' + moment(createDate).format('l');
    }
    label += ' (' + this.get('data.thread.threadId') + ')';
    return label;
  }),

  isStatic: computed('powId', function () {
    return !this.powId;
  }),
  uniqueIdentifier: computed(
    'creator.username',
    'creator.studentId',
    function () {
      // vmt room
      if (this.isVmt) {
        return this.get('vmtRoomInfo.roomId');
      }
      // encompass user
      if (this.get('creator.studentId')) {
        return this.get('creator.studentId');
      }

      // pows username
      if (this.get('creator.username')) {
        return this.get('creator.username');
      }
      return this.get('creator.safeName');
    }
  ),

  isVmt: computed('vmtRoomInfo.roomId', function () {
    let id = this.get('vmtRoomInfo.roomId');
    let checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

    return checkForHexRegExp.test(id);
  }),

  firstVmtParticipant: computed('vmtRoomInfo.participants.[]', function () {
    return this.get('vmtRoomInfo.participants.firstObject');
  }),
  firstVmtFacilitator: computed(
    'vmtRoomInfo.facilitators.firstObject',
    function () {
      return this.get('vmtRoomInfo.facilitators.firstObject');
    }
  ),
  vmtDisplayName: computed('vmtRoomInfo.roomName', function () {
    return `VMT Room: ${this.get('vmtRoomInfo.roomName')}`;
  }),
});
