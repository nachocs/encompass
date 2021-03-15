import Ember from 'ember';






export default Ember.Helper.helper(function (args) {
  let [base, numberToAdd] = args;
  return base + numberToAdd;
});