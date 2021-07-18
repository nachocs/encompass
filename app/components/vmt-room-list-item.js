import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vmt-room-list-item'],

  isExpanded: false,

  isSelected: computed('selectedRoomIds.[]', 'room._id', function () {
    let ids = this.selectedRoomIds || [];
    return ids.includes(this.room._id);
  }),

  encodedImageUri: computed('room.image', function () {
    if (!this.room.image) {
      return '';
    }
    return encodeURI(this.room.image);
  }),

  actions: {
    expandImage() {
      this.set('isExpanded', !this.isExpanded);
    },
    onSelect() {
      this.onSelect(this.room);
    },
  },
});
