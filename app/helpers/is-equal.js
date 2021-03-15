// is-equal helper is necessary to determine which option is currently selected.
// app/helpers/is-equal.js
/*global _:false */
import Ember from 'ember';






export default Ember.Helper.helper(function (args) {
  let [leftSide, rightSide] = args;
  return _.isEqual(leftSide, rightSide);
});
