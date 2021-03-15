// Get an abbreviated version of the given text.
// app/helpers/short-text.js

import Ember from 'ember';






export default Ember.Helper.helper(function (text) {
  // Why does the template pass the text string in an array?
  return text[0].substring(0, 100);
});
