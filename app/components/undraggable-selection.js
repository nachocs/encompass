import Ember from 'ember';
import moment from 'moment';
import CurrentUserMixin from '../mixins/current_user_mixin';






export default Ember.Component.extend(CurrentUserMixin, {
  utils: Ember.inject.service('utility-methods'),

  classNames: ['undraggable-selection'],
  isExpanded: false,

  workspaceType: Ember.computed.alias('selection.workspace.workspaceType'),

  isParentWorkspace: Ember.computed.equal('workspaceType', 'parent'),

  isImage: function () {
    return this.get('selection.imageTagLink.length') > 0;
  }.property('selection.imageTagLink'),

  isText: Ember.computed.not('isImage'),

  isVmtClip: function () {
    return this.get('selection.vmtInfo.startTime') >= 0 &&
      this.get('selection.vmtInfo.endTime') >= 0;
  }.property('selection.vmtInfo.{startTime,endTime}'),

  linkToClassName: function () {
    if (this.get('isImage')) {
      return 'selection-image';
    }
    return 'selection_text';
  }.property('isImage'),

  isSelected: function () {
    return this.get('selection.id') === this.get('currentSelection.id');
  }.property('selection', 'currentSelection'),
  titleText: function () {
    if (!this.get('isVmtClip')) {
      let createDate;
      if (this.get('isParentWorkspace')) {
        createDate = this.get('selection.originalSelection.createDate');
      } else {
        createDate = this.get('selection.createDate');

      }
      let displayDate;
      displayDate = moment(createDate).format('l h:mm');
      return `Created ${displayDate}`;
    }
    let startTime = this.get('selection.vmtInfo.startTime');
    let endTime = this.get('selection.vmtInfo.endTime');

    return `${this.get('utils').getTimeStringFromMs(startTime)} -
            ${this.get('utils').getTimeStringFromMs(endTime)}`;
  }.property('isVmtClip', 'selection.createDate', 'isParentWorkspace', 'selection.originalSelection'),

  overlayIcon: function () {
    if (!this.get('isImage')) {
      return '';
    }

    if (this.get('isVmtClip')) {
      return 'fas fa-play';
    }
    return 'fas fa-expand';
  }.property('isVmtClip}', 'isImage'),

  actions: {
    expandImage() {
      if (this.get('isVmtClip')) {
        return;
      }
      this.set('isExpanded', !this.get('isExpanded'));
    }
  }
});
