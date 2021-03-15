/*global _:false */
import Ember from 'ember';






export default Ember.Helper.helper(function (args) {
  let [list, val] = args;
  return _.contains(list, val);
});
