const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('underscore');
const sockets = require('../../socketInit');
const ObjectId = Schema.ObjectId;

const  { User } = require('../schemas');

const { isNil } = require('../../utils/objects');
const { isValidMongoId, areObjectIdsEqual } = require('../../utils/mongoose');

/**
  * @public
  * @class Notification
  */
var NotificationSchema = new Schema({
//== Shared properties (Because Mongoose doesn't support schema inheritance)
    createdBy: { type: ObjectId, ref: 'User'},
    createDate: { type: Date, 'default': Date.now() },
    isTrashed: { type: Boolean, 'default': false },
    lastModifiedBy: { type: ObjectId, ref: 'User' },
    lastModifiedDate: { type: Date, 'default': Date.now() },
//====
    text: { type: String, },
    primaryRecordType: { type: String, enum: ['workspace', 'assignment', 'section', 'response', 'problem', 'organization']},
    notificationType: {type: String, enum: ['newWorkToMentor', 'mentorReplyNeedsRevisions', 'newAssignmentAnswer', 'newMentorReply', 'mentorReplyRequiresApproval', 'newApproverReply', 'newlyApprovedReply']},
    submission: { type: ObjectId, ref: 'Submission' },
    workspace: {type: ObjectId, ref: 'Workspace' },
    response: {type: ObjectId , ref: 'Response' },
    recipient: {type: ObjectId, ref: 'User'},
    section: { type: ObjectId, ref: 'Section'},
    assignment: { type: ObjectId, ref: 'Assignment' },
    user: { type: ObjectId, ref: 'User' },
    organization: { type: ObjectId, ref: 'Organization' },
    problem: { type: ObjectId, ref: 'Problem' },
    wasSeen: {type: Boolean, default: false},
    doAddToRecipient: { type: Boolean }, // only used for post save hook,
    doPullFromRecipient: { type: Boolean } // only used for post save hook,
  }, {versionKey: false});

/**
  * ## Pre-Validation
  * Before saving we must verify (synchonously) that:
  */
NotificationSchema.pre('save', function (next) {
  this.doAddToRecipient = false;
  this.doPullFromRecipient = false;

  // new notification, add to user's ntf array

  if (this.isNew) {
    this.doAddToRecipient = true;
    next();
  }
  let modifiedFields = this.modifiedPaths();

  if (this.isTrashed) {
    if (modifiedFields.includes('isTrashed')) {
      this.doPullFromRecipient = true;
      next();
    }
  }

  if (this.wasSeen) {
    if (modifiedFields.includes('wasSeen')) {
      // notification was set from seen to unseen, pull from user
      this.doPullFromRecipient = true;
      next();
    }
  }

  if (!this.wasSeen) {
    // notification was manually toggled to 'unread', so add back to user
    if (modifiedFields.includes('wasSeen')) {
      this.doAddToRecipient = true;
      next();
    }
  }
  next();
});

async function notifyUser(recipientId, notification) {
  if (!isValidMongoId(recipientId)) {
    return;
  }

  let user = await User.findById(recipientId);

  if (isNil(user)) {
    return;
  }

  let existingNtf = _.find(user.notifications, (ntfId) => {
    return areObjectIdsEqual(ntfId, notification._id);
  });

  // ntf doesnt exist, add to user array
  if (isNil(existingNtf)) {
    let sliced = user.notifications.slice();
    sliced.push(notification._id);
    user.$set('notifications', sliced);
    await user.save();

    // emit event to user

    let socketId = user.socketId;
    if (socketId) {
      let socket = _.propertyOf(sockets)(['io', 'sockets', 'sockets', socketId]);

      if (socket) {
       await notification
        .populate('submission')
        .populate('workspace')
        .populate('response')
        .populate('problem')
        .populate('assignment')
        .populate('section')
        .populate('user')
        .populate('organization')
        .execPopulate();

        let ntfData = {};
        let props = ['submission', 'workspace', 'response', 'problem', 'assignment', 'section', 'user', 'organization'];

        props.forEach((prop) => {
          if (notification[prop]) {
            let plural = prop + 's';
            ntfData[plural] = [notification[prop]];
          }
        });
        // depopulate ntf

        props.forEach((prop) => {
          notification.depopulate(prop);
        });

        ntfData.notifications = [notification];
        // find any related records and
        socket.emit('NEW_NOTIFICATION', ntfData);
      }
    }
  }

}

/**
  * ## Post-Validation
  * After saving we must ensure (synchonously) that:
  */
NotificationSchema.post('save', function (notification) {

  if (notification.doAddToRecipient) {


    if (isValidMongoId(notification.recipient)) {
      notifyUser(notification.recipient, notification);
    }
  }

  if (notification.doPullFromRecipient) {
    if (isValidMongoId(notification.recipient)) {
      User.findByIdAndUpdate(notification.recipient, {
        $pull: { notifications: notification._id }
      }).exec();
    }
  }
});

module.exports.Notification = mongoose.model('Notification', NotificationSchema);
