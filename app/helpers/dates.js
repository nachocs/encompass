import Ember from 'ember';
import moment from 'moment';






export default Ember.Helper.helper(function (date, format) {
  return moment(date).format(format);
});
