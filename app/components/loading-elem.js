import { computed } from '@ember/object';
import Component from '@ember/component';






export default Component.extend({
  classNames: 'loading-elem',

  defaultMessage: 'Request in progress. Thank you for your patience!',

  loadingText: computed('loadingMessage', 'defaultMessage', function () {
    return this.loadingMessage || this.defaultMessage;
  }),

});
