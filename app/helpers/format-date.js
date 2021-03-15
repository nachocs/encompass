import Ember from 'ember';
import moment from 'moment';






export default Ember.Helper.helper(function (args) {
  // args is array of arguments passed in from template
  let [date, format, doUseRelativeTime] = args;

  if (!date) {
    return 'N/A';
  }

  let formattedDate;


  let momentObj = moment(date);

  if (!momentObj.isValid()) {
    return 'N/A';
  }

  if (doUseRelativeTime) {
    formattedDate = momentObj.fromNow();
  } else {
    formattedDate = momentObj.format(format);
  }

  return formattedDate;
});
