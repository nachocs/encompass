import Ember from 'ember';




export default Ember.Mixin.create({
  application: Ember.inject.controller(),
  utils: Ember.inject.service('utility-methods'),
  userNtfs: Ember.inject.service('user-ntfs'),
  //needs: 'application',
  currentUser: Ember.computed.alias('application.currentUser'),

  areNtfsLoaded: Ember.computed.alias('userNtfs.areNtfsLoaded'),

  newNotifications: function () {
    if (this.get('areNtfsLoaded')) {
      return this.get('userNtfs.newNotifications');
    }
    return [];
  }.property('userNtfs.newNotifications.[]', 'areNtfsLoaded'),

  responseNotifications: function () {
    return this.get('newNotifications').filterBy('primaryRecordType', 'response');
  }.property('newNotifications.[]'),

  workspaceNotifications: function () {
    return this.get('newNotifications').filterBy('primaryRecordType', 'workspace');
  }.property('newNotifications.[]'),

  assignmentNotifications: function () {
    return this.get('newNotifications').filterBy('primaryRecordType', 'workspace');
  }.property('newNotifications.[]'),

  sectionNotifications: function () {
    return this.get('newNotifications').filterBy('primaryRecordType', 'section');
  }.property('newNotifications.[]'),

  problemNotifications: function () {
    return this.get('newNotifications').filterBy('primaryRecordType', 'problem');
  }.property('newNotifications.[]'),

  organizationNotifications: function () {
    return this.get('newNotifications').filterBy('primaryRecordType', 'organization');
  }.property('newNotifications.[]'),

  userNotifications: function () {
    return this.get('newNotifications').filterBy('primaryRecordType', 'user');
  }.property('newNotifications.[]'),

  newReplyNotifications: function () {
    return this.get('responseNotifications').filter((ntf) => {
      let recipientId = this.get('utils').getBelongsToId(ntf, 'recipient');
      let ntfType = ntf.get('notificationType');
      let isNewReply = ntfType === 'newMentorReply' || ntfType === 'newApproverReply';

      return isNewReply && recipientId === this.get('currentUser.id');
    });
  }.property('responseNotifications.[]'),

  findRelatedNtfs(primaryRecordType, relatedRecord, ntfType, belongsToType) {
    if (!primaryRecordType || !relatedRecord) {
      return [];
    }
    let propName = `${primaryRecordType}Notifications`;
    let baseNtfs = this.get(propName);

    if (!baseNtfs) {
      return [];
    }

    let relationshipType = belongsToType || primaryRecordType;
    return baseNtfs.filter((ntf) => {
      let belongsToId = this.get('utils').getBelongsToId(ntf, relationshipType);

      if (ntfType) {
        return ntf.get('notificationType') === ntfType && belongsToId === relatedRecord.get('id');
      }
      return belongsToId === relatedRecord.get('id');
    });
  },

});
