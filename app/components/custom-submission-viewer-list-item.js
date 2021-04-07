import { computed } from '@ember/object';
import Component from '@ember/component';






export default Component.extend({
  elementId: ['custom-submission-viewer-list-item'],

  isChecked: computed('selectedSubmissionIds.[]', function () {
    return this.selectedSubmissionIds.includes(this.get('submission.id'));
  }),

  actions: {
    onSelect: function () {
      this.onSelect(this.get('submission.id'));
    }
  }

});