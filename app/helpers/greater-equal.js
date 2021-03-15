import Ember from 'ember';






export default Ember.Helper.helper(function (args) {
  let [leftSide, rightSide] = args;
  return leftSide >= rightSide;
});
