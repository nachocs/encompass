import { computed } from '@ember/object';
/*global _:false */
import { alias } from '@ember/object/computed';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';

export default DS.Model.extend(Auditable, {
  answerId: alias('id'),
  studentName: DS.attr('string'),
  problem: DS.belongsTo('problem'),
  answer: DS.attr('string'),
  explanation: DS.attr('string'),
  explanationImage: DS.belongsTo('image', { inverse: null }),
  section: DS.belongsTo('section'),
  isSubmitted: DS.attr('boolean'),
  students: DS.hasMany('users', { inverse: null }),
  studentNames: DS.attr(),
  priorAnswer: DS.belongsTo('answer'),
  assignment: DS.belongsTo('assignment', { async: true }),
  additionalImage: DS.belongsTo('image', { inverse: null }),
  workspacesToUpdate: DS.attr(''),
  vmtRoomInfo: DS.attr(),

  isVmt: computed('vmtRoomInfo.roomId', function () {
    let id = this.get('vmtRoomInfo.roomId');
    let checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

    return checkForHexRegExp.test(id);
  }),

  student: computed(
    'createdBy.username',
    'studentNames.[]',
    'studentName',
    'isVmt',
    'vmtRoomInfo.participants.[]',
    function () {
      if (this.isVmt) {
        return this.get('vmtRoomInfo.participants.firstObject') || 'Unknown';
      }
      const creatorUsername = this.get('createdBy.username');
      if (creatorUsername && creatorUsername !== 'old_pows_user') {
        return creatorUsername;
      }
      const studentName = this.studentName;
      if (typeof studentName === 'string') {
        return studentName.trim();
      }

      const names = this.studentNames;

      if (Array.isArray(names)) {
        let firstStringName = _.find(names, _.isString);
        if (firstStringName) {
          return firstStringName.trim();
        }
      }
    }
  ),
});
