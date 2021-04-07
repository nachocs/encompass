import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import DS from 'ember-data';
import Auditable from '../models/_auditable_mixin';

export default DS.Model.extend(Auditable, {
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  userId: alias('id'),
  email: DS.attr('string'),
  avatar: DS.attr('string'),
  organization: DS.belongsTo('organization'),
  organizationRequest: DS.attr('string'),
  location: DS.attr('string'),
  username: DS.attr('string'),
  googleId: DS.attr('string'),
  requestReason: DS.attr('string'),
  isGuest: DS.attr('boolean'),
  accountType: DS.attr('string'),
  isEmailConfirmed: DS.attr('boolean'),
  isAuthorized: DS.attr('boolean', { defaultValue: false }),
  authorizedBy: DS.belongsTo('user', { inverse: null }),
  seenTour: DS.attr('date'),
  lastImported: DS.attr('date'),
  lastLogin: DS.attr('date'),
  history: DS.attr(),
  sections: DS.attr(),
  assignments: DS.hasMany('assignment', { async: true, inverse: null }),
  answers: DS.hasMany('answer', { async: true }),
  actingRole: DS.attr('string'),
  notifications: DS.hasMany('notifications', { inverse: 'recipient' }),

  actingRoleName: computed('actingRole', function () {
    let actingRole = this.actingRole;
    if (this.accountType === 'P') {
      actingRole === 'teacher'
        ? (actingRole = 'pdadmin')
        : (actingRole = 'student');
    } else if (this.accountType === 'A') {
      actingRole === 'teacher'
        ? (actingRole = 'admin')
        : (actingRole = 'student');
    }
    return actingRole;
  }),
  isAdmin: computed('accountType', function () {
    return this.accountType === 'A';
  }),
  isTeacher: computed('accountType', function () {
    return this.accountType === 'T';
  }),
  isStudent: computed('accountType', 'actingRole', function () {
    return this.accountType === 'S' || this.actingRole === 'student';
  }),
  isPdAdmin: computed('accountType', function () {
    return this.accountType === 'P';
  }),
  isAuthenticated: computed('isGuest', function () {
    return !this.isGuest;
  }),
  isAuthz: computed('isAdmin', 'isAuthorized', function () {
    return this.isAdmin || this.isAuthorized;
  }),
  displayName: computed('name', 'username', 'isLoaded', function () {
    var display = this.name;
    if (!display) {
      display = this.username;
    }
    return display;
  }),
  lastSeen: DS.attr('date'),
  needAdditionalInfo: computed(
    'googleId',
    'requestReason',
    'isAuthz',
    function () {
      const authorized = this.isAuthz;
      if (authorized) {
        return false;
      }

      const googleId = this.googleId;

      if (!googleId) {
        return false;
      }
      const requestReason = this.requestReason;

      if (!requestReason) {
        return true;
      }
      return false;
    }
  ),

  shouldSendAuthEmail: DS.attr('boolean'),
  collabWorkspaces: DS.attr(),
  hiddenWorkspaces: DS.attr(),
  socketId: DS.attr('string'),
  ssoId: DS.attr('string'),
  doForcePasswordChange: DS.attr('boolean', { defaultValue: false }),
  confirmEmailDate: DS.attr('date'),
  isConfirmingEmail: DS.attr('boolean', { defaultValue: false }),
});
