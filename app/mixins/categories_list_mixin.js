import Ember from 'ember';






export default Ember.Mixin.create({
  application: Ember.inject.controller(),
  selectedCategories: Ember.computed.alias('application.selectedCategories'),
});
