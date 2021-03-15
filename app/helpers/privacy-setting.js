import Ember from 'ember';






export default Ember.Helper.helper(function (setting) {
  if (setting[0] === "M") {
    return 'Just Me';
  } else if (setting[0] === "O") {
    return 'My Organization';
  } else if (setting[0] === "E") {
    return 'Everyone';
  } else {
    return 'Undefined';
  }

});

