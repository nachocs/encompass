import Ember from 'ember';
import CurrentUserMixin from '../mixins/current_user_mixin';
import ErrorHandlingMixin from '../mixins/error_handling_mixin';
import VmtHostMixin from '../mixins/vmt-host';






export default Ember.Component.extend(CurrentUserMixin, VmtHostMixin, ErrorHandlingMixin, {
  classNames: ['vmt-search'],

  searchConstraints: {
    query: {
      length: {
        minimum: 0,
        maximum: 500
      }
    }
  },
  searchErrors: [],

  actions: {
    submitSearch() {
      let searchText = this.get('searchText');

      let trimmed = typeof searchText === 'string' ? searchText.trim() : '';

      if (trimmed.length === 0) {
        return;
      }
      let vmtHost = this.getVmtHost();

      let url = `${vmtHost}/enc/search?resourceName=${trimmed}`;

      Ember.$.get({
        url,
        xhrFields: {
          withCredentials: true
        }
        // headers
      })
        .then((results) => {
          /*
          {
            activities: [],
            rooms: [],
          }
          */
          if (this.get('handleSearchResults')) {
            this.get('handleSearchResults')(results);
          }
        })
        .catch((err) => {
          this.handleErrors(err, 'searchErrors');
        });
    }
  }

});