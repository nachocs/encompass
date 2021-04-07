import { computed } from '@ember/object';
/*global _:false */
import Component from '@ember/component';






export default Component.extend({
  classNames: ['radio-group-item'],

  isSelected: computed('selectedValue', 'value', function () {
    const selectedValue = this.selectedValue;
    const value = this.value;

    return _.isEqual(selectedValue, value);
  }),

  actions: {
    onClick(val) {
      this.onClick(val);
    }
  }
});